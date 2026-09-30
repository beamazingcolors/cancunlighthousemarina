import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { 
  sendLoginAlertEmail, 
  sendPasswordResetEmail, 
  sendPasswordChangedConfirmationEmail 
} from './emailService.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = path.resolve(__dirname, '../../.data');
const AUTH_STORE_PATH = path.resolve(DATA_DIR, 'auth_store.json');

export interface BackendUser {
  email: string;
  password: string; // Stored securely on backend only
  name: string;
  role: 'superadmin' | 'user';
  failedAttempts: number;
  isLocked: boolean;
  lockedAt?: number;
  lastLogin?: number;
}

export interface SessionData {
  sessionId: string;
  email: string;
  name: string;
  role: 'superadmin' | 'user';
  createdAt: number;
  expiresAt: number;
}

// Initial authorized system users requested
const INITIAL_BACKEND_USERS: BackendUser[] = [
  {
    email: 'alexisjfgg@gmail.com',
    password: 'Ajfgg29593',
    name: 'Alexis J. (Super Admin)',
    role: 'superadmin',
    failedAttempts: 0,
    isLocked: false
  },
  {
    email: 'andres@nauticoslighthouse.com',
    password: 'Soyandres1$%',
    name: 'Andrés',
    role: 'user',
    failedAttempts: 0,
    isLocked: false
  },
  {
    email: 'joseluis@nauticoslighthouse.com',
    password: 'Soyjose1$#$',
    name: 'José Luis',
    role: 'user',
    failedAttempts: 0,
    isLocked: false
  },
  {
    email: 'victor@nauticoslighthouse.com',
    password: 'Soyvictor1$%#$',
    name: 'Víctor',
    role: 'user',
    failedAttempts: 0,
    isLocked: false
  },
  {
    email: 'gabrielcecenasarabia@gmail.com',
    password: 'Soygabo123$',
    name: 'Gabriel Ceceña',
    role: 'user',
    failedAttempts: 0,
    isLocked: false
  }
];

// In-memory runtime fallback and cache
let usersCache: BackendUser[] = [];
const activeSessions: Map<string, SessionData> = new Map();
const activeCaptchas: Map<string, { code: string; expiresAt: number }> = new Map();
const resetTokens: Map<string, { token: string; email: string; expiresAt: number }> = new Map();

const MAX_FAILED_ATTEMPTS = 5;
const SESSION_DURATION_MS = 24 * 60 * 60 * 1000; // 24 hours

/**
 * Initialize backend users store
 */
function initAuthStore() {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }

    if (fs.existsSync(AUTH_STORE_PATH)) {
      const raw = fs.readFileSync(AUTH_STORE_PATH, 'utf-8');
      usersCache = JSON.parse(raw);
    } else {
      usersCache = [...INITIAL_BACKEND_USERS];
      fs.writeFileSync(AUTH_STORE_PATH, JSON.stringify(usersCache, null, 2), 'utf-8');
    }

    // Ensure all mandatory users exist
    let updated = false;
    for (const initUser of INITIAL_BACKEND_USERS) {
      const idx = usersCache.findIndex(u => u.email.toLowerCase() === initUser.email.toLowerCase());
      if (idx === -1) {
        usersCache.push({ ...initUser });
        updated = true;
      }
    }
    if (updated) {
      fs.writeFileSync(AUTH_STORE_PATH, JSON.stringify(usersCache, null, 2), 'utf-8');
    }
  } catch (err) {
    console.warn('[AuthService] Could not persist to file, using in-memory store:', err);
    usersCache = [...INITIAL_BACKEND_USERS];
  }
}

// Initial bootstrap
initAuthStore();

function saveUsersStore() {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(AUTH_STORE_PATH, JSON.stringify(usersCache, null, 2), 'utf-8');
  } catch (err) {
    console.warn('[AuthService] Error saving users store:', err);
  }
}

/**
 * Validates the 3 mandatory password policy requirements:
 * 1. Minimum 8 characters
 * 2. Letters, numbers, and special characters
 * 3. At least one uppercase letter
 */
export function validatePasswordPolicy(password: string): {
  isValid: boolean;
  minLengthOk: boolean;
  charsOk: boolean;
  upperOk: boolean;
  error?: string;
} {
  const minLengthOk = password.length >= 8;
  const hasLetter = /[a-zA-Z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSpecial = /[^a-zA-Z0-9]/.test(password);
  const charsOk = hasLetter && hasNumber && hasSpecial;
  const upperOk = /[A-Z]/.test(password);

  let error: string | undefined = undefined;
  if (!minLengthOk) {
    error = 'La contraseña debe tener mínimo 8 caracteres.';
  } else if (!upperOk) {
    error = 'La contraseña debe contener al menos una letra en mayúscula.';
  } else if (!charsOk) {
    error = 'La contraseña debe contener letras, números y caracteres especiales.';
  }

  return {
    isValid: minLengthOk && charsOk && upperOk,
    minLengthOk,
    charsOk,
    upperOk,
    error
  };
}

/**
 * Generates a clean random Captcha
 */
export function generateBackendCaptcha(): { id: string; code: string } {
  const chars = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ';
  let code = '';
  for (let i = 0; i < 5; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }

  const id = `cap_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
  activeCaptchas.set(id, {
    code,
    expiresAt: Date.now() + 10 * 60 * 1000 // 10 minutes
  });

  return { id, code };
}

/**
 * Authenticates user credentials with 5-attempt limit and alert email delivery
 */
export async function authenticateUser(
  emailInput: string,
  passwordInput: string,
  deviceInfoInput?: string
): Promise<{
  success: boolean;
  user?: { email: string; name: string; role: 'superadmin' | 'user' };
  sessionToken?: string;
  error?: string;
  mustResetPassword?: boolean;
  remainingAttempts?: number;
  emailAlertSent?: boolean;
}> {
  const email = (emailInput || '').trim().toLowerCase();
  const password = (passwordInput || '').trim();
  const deviceInfo = deviceInfoInput || 'Dispositivo Web Autorizado';

  if (!email || !password) {
    return {
      success: false,
      error: 'Por favor ingresa correo electrónico y contraseña.'
    };
  }

  const user = usersCache.find(u => u.email.toLowerCase() === email);

  if (!user) {
    return {
      success: false,
      error: 'Credenciales inválidas.'
    };
  }

  // Check if account is locked after exceeding 5 attempts
  if (user.isLocked || user.failedAttempts >= MAX_FAILED_ATTEMPTS) {
    return {
      success: false,
      error: 'Has superado el límite de 5 intentos fallidos. Tu cuenta ha sido bloqueada. Por seguridad, debes generar una nueva contraseña para restablecer tu acceso.',
      mustResetPassword: true,
      remainingAttempts: 0
    };
  }

  // Password verification
  if (user.password !== password) {
    user.failedAttempts += 1;

    if (user.failedAttempts >= MAX_FAILED_ATTEMPTS) {
      user.isLocked = true;
      user.lockedAt = Date.now();
      saveUsersStore();

      return {
        success: false,
        error: 'Has alcanzado el límite máximo de 5 intentos fallidos. Tu cuenta ha sido bloqueada. Es obligatorio generar una nueva contraseña.',
        mustResetPassword: true,
        remainingAttempts: 0
      };
    }

    saveUsersStore();
    const remaining = MAX_FAILED_ATTEMPTS - user.failedAttempts;
    return {
      success: false,
      error: `Credenciales inválidas. Te quedan ${remaining} de ${MAX_FAILED_ATTEMPTS} intentos.`,
      remainingAttempts: remaining
    };
  }

  // SUCCESSFUL LOGIN
  user.failedAttempts = 0;
  user.isLocked = false;
  user.lastLogin = Date.now();
  saveUsersStore();

  // Create session
  const sessionId = `clm_sess_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
  activeSessions.set(sessionId, {
    sessionId,
    email: user.email,
    name: user.name,
    role: user.role,
    createdAt: Date.now(),
    expiresAt: Date.now() + SESSION_DURATION_MS
  });

  // DISPATCH REAL LOGIN ALERT EMAIL TO USER
  let emailAlertSent = false;
  try {
    const mailRes = await sendLoginAlertEmail(
      user.email,
      user.name,
      user.role,
      deviceInfo,
      Date.now()
    );
    emailAlertSent = mailRes.success;
  } catch (err) {
    console.error('[AuthService] Could not send login email:', err);
  }

  return {
    success: true,
    user: {
      email: user.email,
      name: user.name,
      role: user.role
    },
    sessionToken: sessionId,
    emailAlertSent
  };
}

/**
 * Initiates password reset with Captcha verification and real recovery email dispatch
 */
export async function requestPasswordReset(
  emailInput: string,
  userCaptcha: string,
  captchaId: string
): Promise<{
  success: boolean;
  error?: string;
  message?: string;
  token?: string;
  emailSent?: boolean;
}> {
  const email = (emailInput || '').trim().toLowerCase();
  const cleanCaptcha = (userCaptcha || '').trim().toUpperCase().replace(/\s+/g, '');

  if (!email) {
    return { success: false, error: 'Por favor ingresa tu correo electrónico.' };
  }

  // Verify captcha
  const storedCaptcha = activeCaptchas.get(captchaId);
  if (!storedCaptcha || storedCaptcha.expiresAt < Date.now()) {
    return { success: false, error: 'El código Captcha ha expirado. Por favor solicita uno nuevo.' };
  }

  if (storedCaptcha.code !== cleanCaptcha) {
    return { success: false, error: 'El código Captcha es incorrecto. Intenta nuevamente.' };
  }

  // Remove used captcha
  activeCaptchas.delete(captchaId);

  // Verify user existence in authorized list
  const user = usersCache.find(u => u.email.toLowerCase() === email);
  if (!user) {
    return {
      success: false,
      error: 'El correo ingresado no corresponde a ningún usuario autorizado del sistema.'
    };
  }

  // Generate security reset token: 6 random digits prefixed with CLM-
  const randomSixDigits = Math.floor(100000 + Math.random() * 900000).toString();
  const token = `CLM-${randomSixDigits}`;
  resetTokens.set(token, {
    token,
    email: user.email,
    expiresAt: Date.now() + 15 * 60 * 1000 // 15 minutes
  });

  // Send real email with token to user
  let emailSent = false;
  try {
    const mailResult = await sendPasswordResetEmail(user.email, user.name, token);
    emailSent = mailResult.success;
  } catch (err) {
    console.error('[AuthService] Error sending reset email:', err);
  }

  return {
    success: true,
    message: `Se ha enviado el código de restablecimiento a ${user.email}. Revisa tu bandeja de entrada o spam.`,
    emailSent
  };
}

/**
 * Completes password reset, unlocks account, resets attempts to 0, and sends confirmation email
 */
export async function resetPasswordWithToken(
  emailInput: string,
  tokenInput: string,
  newPasswordInput: string
): Promise<{
  success: boolean;
  error?: string;
  message?: string;
}> {
  const email = (emailInput || '').trim().toLowerCase();
  const rawToken = (tokenInput || '').trim().toUpperCase();
  const newPassword = (newPasswordInput || '').trim();

  if (!email || !rawToken || !newPassword) {
    return {
      success: false,
      error: 'Por favor completa todos los campos requeridos.'
    };
  }

  // Validate policy (the 3 mandatory requirements)
  const policy = validatePasswordPolicy(newPassword);
  if (!policy.isValid) {
    return {
      success: false,
      error: policy.error || 'La contraseña no cumple con los requisitos mínimos de seguridad.'
    };
  }

  // Flexible token lookup: matches exact token, or without 'CLM-' prefix, or case-insensitive
  let matchedKey: string | null = null;
  for (const [key, val] of resetTokens.entries()) {
    if (val.email.toLowerCase() === email && val.expiresAt >= Date.now()) {
      const cleanKey = key.toUpperCase();
      const codeOnly = cleanKey.replace(/^CLM-/, '');
      if (cleanKey === rawToken || codeOnly === rawToken || cleanKey === `CLM-${rawToken}`) {
        matchedKey = key;
        break;
      }
    }
  }

  if (!matchedKey) {
    return {
      success: false,
      error: 'El código de verificación ingresado es inválido o ha expirado. Por favor solicita uno nuevo.'
    };
  }

  // Find user and update
  const user = usersCache.find(u => u.email.toLowerCase() === email);
  if (!user) {
    return {
      success: false,
      error: 'Usuario no encontrado.'
    };
  }

  // Update password and unlock account
  user.password = newPassword;
  user.failedAttempts = 0;
  user.isLocked = false;
  delete user.lockedAt;
  saveUsersStore();

  // Delete used token immediately
  resetTokens.delete(matchedKey);

  // Send confirmation email
  try {
    await sendPasswordChangedConfirmationEmail(user.email, user.name);
  } catch (e) {
    console.warn('[AuthService] Confirmation email notice:', e);
  }

  return {
    success: true,
    message: 'Contraseña actualizada exitosamente. Tu cuenta ha sido desbloqueada y el contador de intentos restablecido a cero.'
  };
}

/**
 * Validates a session token
 */
export function validateSessionToken(token: string): {
  isValid: boolean;
  user?: { email: string; name: string; role: 'superadmin' | 'user' };
} {
  if (!token) return { isValid: false };

  const session = activeSessions.get(token);
  if (!session || session.expiresAt < Date.now()) {
    if (session) activeSessions.delete(token);
    return { isValid: false };
  }

  return {
    isValid: true,
    user: {
      email: session.email,
      name: session.name,
      role: session.role
    }
  };
}

/**
 * Destroys a session token
 */
export function destroySessionToken(token: string): void {
  if (token) {
    activeSessions.delete(token);
  }
}
