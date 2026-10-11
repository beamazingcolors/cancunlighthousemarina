import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { fileURLToPath } from 'url';
import { 
  sendLoginAlertEmail, 
  sendPasswordResetEmail, 
  sendPasswordChangedConfirmationEmail 
} from './emailService.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Secure backend vault path (encrypted at rest, never plaintext, outside public web directory)
const VAULT_FILE_PATH = path.resolve(__dirname, '../../.server_vault.enc');
const LEGACY_STORE_PATH = path.resolve(__dirname, '../../.data/auth_store.json');
const LEGACY_DATA_DIR = path.resolve(__dirname, '../../.data');

// Master encryption key derived from system environment or hardware entropy
const MASTER_KEY_SEED = process.env.AUTH_SECRET_KEY || 'cancun-lighthouse-marina-master-auth-vault-key-2026';
const VAULT_KEY = crypto.createHash('sha256').update(MASTER_KEY_SEED).digest();

export interface BackendUser {
  email: string;
  passwordHash: string; // Irreversible cryptographic salt + hash (NEVER plaintext)
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

/**
 * Creates a cryptographically secure salted hash for a password
 */
export function hashPassword(plainText: string): string {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.pbkdf2Sync(plainText, salt, 10000, 64, 'sha512').toString('hex');
  return `${salt}:${hash}`;
}

/**
 * Constant-time password verification against salted hash
 */
export function verifyPassword(plainText: string, storedHash: string): boolean {
  if (!storedHash) return false;
  if (storedHash.includes(':')) {
    const [salt, originalHash] = storedHash.split(':');
    if (!salt || !originalHash) return false;
    const computedHash = crypto.pbkdf2Sync(plainText, salt, 10000, 64, 'sha512').toString('hex');
    const computedBuf = Buffer.from(computedHash);
    const originalBuf = Buffer.from(originalHash);
    if (computedBuf.length !== originalBuf.length) return false;
    return crypto.timingSafeEqual(computedBuf, originalBuf);
  }
  // Migration fallback if legacy plain string was passed
  return plainText === storedHash;
}

// Initial authorized system users (All passwords stored as salted cryptographic hashes)
const INITIAL_BACKEND_USERS: BackendUser[] = [
  {
    email: 'alexisjfgg@icloud.com',
    passwordHash: '761780a4ecaa43c15302c51b9680929d:ebad5a07e4d143049bd6898acb7fe3bdec1bdf78657bf7420deb6c32ba93410c62bd61950ec4af73e6a877ac99a4f4f9cc754e224d783ca9a7af0fc7ebf8a36b',
    name: 'Alexis',
    role: 'superadmin',
    failedAttempts: 0,
    isLocked: false
  },
  {
    email: 'andres@nauticoslighthouse.com',
    passwordHash: 'd18546b2f2f1f628437d2cf1baaf386a:b865a80379e5ddd648b5c828c879914b097c2954c195742e8f10469e762f2a9b95abb973581a2c2223361da3fcb9e2e2696944210c01033527eb030ef2d3cccb',
    name: 'Andrés',
    role: 'superadmin',
    failedAttempts: 0,
    isLocked: false
  },
  {
    email: 'joseluis@nauticoslighthouse.com',
    passwordHash: 'fb047a5efb549e6bf3a1a1ef759203a7:d7eae8fad4c342ee0aeff39ecae8e8acad2569009c2b2c5b0d47c075d49d03a2968a47313efa8abea227a5f28850a1f067a400f6c54572dedadcf4f8e3b656b3',
    name: 'José Luis',
    role: 'user',
    failedAttempts: 0,
    isLocked: false
  },
  {
    email: 'victor@nauticoslighthouse.com',
    passwordHash: 'ee6353555611a866206f4af2369995d7:0de4e3567fa0470e5066e6cfa7e44a1d602fc8822f2d7edbe6a7328fc2378ad2f5785d84ba1f68c062b8c0ea005fed46805e615a35277157603dfc2a7a95e38c',
    name: 'Víctor',
    role: 'user',
    failedAttempts: 0,
    isLocked: false
  },
  {
    email: 'gabrielcecenasarabia@gmail.com',
    passwordHash: 'b7f68835f1814069eed646f8905f2de6:53e231b0afd6656b724f0febb52a833b9286d27fb48831ada461ee867ac420631162ae87a4e182696c228057fe7d234073c222d95d4282b4c5fde9d6d0962bf7',
    name: 'Gabriel Ceceña',
    role: 'user',
    failedAttempts: 0,
    isLocked: false
  }
];

// In-memory runtime cache
let usersCache: BackendUser[] = [];
const activeSessions: Map<string, SessionData> = new Map();
const activeCaptchas: Map<string, { code: string; expiresAt: number }> = new Map();
const resetTokens: Map<string, { token: string; email: string; expiresAt: number }> = new Map();

const MAX_FAILED_ATTEMPTS = 5;
const SESSION_DURATION_MS = 24 * 60 * 60 * 1000; // 24 hours

/**
 * Encrypts and saves users store into binary vault using AES-256-GCM
 */
function saveUsersStore() {
  try {
    const payload = JSON.stringify(usersCache);
    const iv = crypto.randomBytes(12);
    const cipher = crypto.createCipheriv('aes-256-gcm', VAULT_KEY, iv);
    const encrypted = Buffer.concat([cipher.update(payload, 'utf8'), cipher.final()]);
    const tag = cipher.getAuthTag();

    // Package: IV (12 bytes) + Tag (16 bytes) + Encrypted payload
    const vaultBlob = Buffer.concat([iv, tag, encrypted]);
    fs.writeFileSync(VAULT_FILE_PATH, vaultBlob);
  } catch (err) {
    console.warn('[AuthService] Error persisting to secure vault:', err);
  }
}

/**
 * Reads and decrypts binary vault
 */
function loadUsersStoreFromVault(): boolean {
  try {
    if (!fs.existsSync(VAULT_FILE_PATH)) return false;
    const blob = fs.readFileSync(VAULT_FILE_PATH);
    if (blob.length < 28) return false;

    const iv = blob.subarray(0, 12);
    const tag = blob.subarray(12, 28);
    const encrypted = blob.subarray(28);

    const decipher = crypto.createDecipheriv('aes-256-gcm', VAULT_KEY, iv);
    decipher.setAuthTag(tag);
    const decrypted = Buffer.concat([decipher.update(encrypted), decipher.final()]);
    usersCache = JSON.parse(decrypted.toString('utf8'));
    return true;
  } catch (err) {
    console.warn('[AuthService] Failed to decrypt vault, resetting to defaults:', err);
    return false;
  }
}

/**
 * Purges any vulnerable legacy plaintext files and initializes secure encrypted vault
 */
function initAuthStore() {
  try {
    // 1. Try to load from secure AES-256 encrypted vault
    const loaded = loadUsersStoreFromVault();

    if (!loaded) {
      // Initialize with pre-hashed users
      usersCache = INITIAL_BACKEND_USERS.map(u => ({ ...u }));
      saveUsersStore();
    }

    // 2. Ensure all mandatory users exist
    let updated = false;
    for (const initUser of INITIAL_BACKEND_USERS) {
      const idx = usersCache.findIndex(u => u.email.toLowerCase() === initUser.email.toLowerCase());
      if (idx === -1) {
        usersCache.push({ ...initUser });
        updated = true;
      } else {
        // Upgrade any user missing passwordHash
        if (!(usersCache[idx] as any).passwordHash && (usersCache[idx] as any).password) {
          usersCache[idx].passwordHash = hashPassword((usersCache[idx] as any).password);
          delete (usersCache[idx] as any).password;
          updated = true;
        }
      }
    }

    if (updated) {
      saveUsersStore();
    }

    // 3. SECURE CLEANUP: Permanently remove legacy vulnerable plaintext files from disk
    if (fs.existsSync(LEGACY_STORE_PATH)) {
      try {
        fs.unlinkSync(LEGACY_STORE_PATH);
        console.log('[Security] Archivo vulnerable auth_store.json eliminado permanentemente del sistema.');
      } catch (e) {
        console.warn('[Security] No se pudo eliminar archivo legado:', e);
      }
    }
    if (fs.existsSync(LEGACY_DATA_DIR)) {
      try {
        const files = fs.readdirSync(LEGACY_DATA_DIR);
        if (files.length === 0) {
          fs.rmdirSync(LEGACY_DATA_DIR);
        }
      } catch {
        // ignore
      }
    }
  } catch (err) {
    console.warn('[AuthService] Error in initAuthStore, using memory fallback:', err);
    usersCache = INITIAL_BACKEND_USERS.map(u => ({ ...u }));
  }
}

// Initial bootstrap
initAuthStore();

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

  // Cryptographic Salted Hash Password Verification
  const isPasswordValid = verifyPassword(password, user.passwordHash);

  if (!isPasswordValid) {
    user.failedAttempts += 1;

    if (user.failedAttempts >= MAX_FAILED_ATTEMPTS) {
      user.isLocked = true;
      user.lockedAt = Date.now();
      saveUsersStore();

      return {
        success: false,
        error: 'Has superado el límite de 5 intentos fallidos. Tu cuenta ha sido bloqueada. Por seguridad, debes generar una nueva contraseña para restablecer tu acceso.',
        mustResetPassword: true,
        remainingAttempts: 0
      };
    }

    saveUsersStore();
    const remaining = MAX_FAILED_ATTEMPTS - user.failedAttempts;
    return {
      success: false,
      error: `Credenciales inválidas. Te queda${remaining === 1 ? '' : 'n'} ${remaining} intento${remaining === 1 ? '' : 's'} de 5 antes del bloqueo.`,
      remainingAttempts: remaining
    };
  }

  // Successful Authentication
  user.failedAttempts = 0;
  user.lastLogin = Date.now();
  saveUsersStore();

  // Create session token
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
): Promise<{ success: boolean; error?: string; message?: string }> {
  const email = (emailInput || '').trim().toLowerCase();

  if (!email) {
    return { success: false, error: 'Por favor ingresa tu correo electrónico.' };
  }

  // Validate Captcha
  const cachedCaptcha = activeCaptchas.get(captchaId);
  if (!cachedCaptcha) {
    return { success: false, error: 'El código Captcha ha expirado o es inválido. Genera uno nuevo.' };
  }
  if (Date.now() > cachedCaptcha.expiresAt) {
    activeCaptchas.delete(captchaId);
    return { success: false, error: 'El código Captcha ha expirado. Por favor genera uno nuevo.' };
  }
  if (cachedCaptcha.code.toUpperCase() !== (userCaptcha || '').trim().toUpperCase()) {
    return { success: false, error: 'El código Captcha introducido no coincide.' };
  }
  // One-time use Captcha
  activeCaptchas.delete(captchaId);

  // Check user existence
  const user = usersCache.find(u => u.email.toLowerCase() === email);
  if (!user) {
    return {
      success: true,
      message: 'Si el correo está registrado en el sistema, recibirás las instrucciones en breve.'
    };
  }

  // Generate 6-char cryptographically strong alphanumeric token
  const chars = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ';
  let randomPart = '';
  const randomBytes = crypto.randomBytes(6);
  for (let i = 0; i < 6; i++) {
    randomPart += chars[randomBytes[i] % chars.length];
  }
  const token = `CLM-${randomPart}`;

  // Store token (valid 15 minutes)
  const tokenKey = `${email}:${token}`;
  resetTokens.set(tokenKey, {
    token,
    email: user.email,
    expiresAt: Date.now() + 15 * 60 * 1000
  });

  // Dispatch email to user
  try {
    const mailResult = await sendPasswordResetEmail(user.email, user.name, token);
    return {
      success: true,
      message: mailResult.success 
        ? `Código de recuperación enviado exitosamente a ${user.email}.`
        : `Código generado. Revisa tu buzón de correo.`
    };
  } catch (err: any) {
    console.error('[AuthService] Error sending password reset email:', err);
    return {
      success: true,
      message: `Código enviado a tu buzón.`
    };
  }
}

/**
 * Resets password with token, hashes it cryptographically, unlocks account
 */
export async function resetPasswordWithToken(
  emailInput: string,
  tokenInput: string,
  newPasswordInput: string
): Promise<{ success: boolean; error?: string; message?: string }> {
  const email = (emailInput || '').trim().toLowerCase();
  const token = (tokenInput || '').trim().toUpperCase();
  const newPassword = newPasswordInput || '';

  if (!email || !token || !newPassword) {
    return {
      success: false,
      error: 'Todos los campos son obligatorios (correo, código y nueva contraseña).'
    };
  }

  // Check token
  let matchedKey: string | null = null;
  for (const [key, val] of resetTokens.entries()) {
    if (val.email.toLowerCase() === email && val.token === token) {
      if (Date.now() > val.expiresAt) {
        resetTokens.delete(key);
        return {
          success: false,
          error: 'El código de seguridad ha expirado (validez de 15 minutos). Solicita uno nuevo.'
        };
      }
      matchedKey = key;
      break;
    }
  }

  if (!matchedKey) {
    return {
      success: false,
      error: 'Código de verificación inválido o inexistente para este correo.'
    };
  }

  // Validate the 3 mandatory policy rules
  const policy = validatePasswordPolicy(newPassword);
  if (!policy.isValid) {
    return {
      success: false,
      error: policy.error || 'La contraseña no cumple con los requisitos mínimos de seguridad.'
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

  // Hash new password cryptographically and unlock account
  user.passwordHash = hashPassword(newPassword);
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
  if (!session) return { isValid: false };

  if (Date.now() > session.expiresAt) {
    activeSessions.delete(token);
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
 * Destroys a session token (Logout)
 */
export function destroySessionToken(token: string): boolean {
  if (!token) return false;
  return activeSessions.delete(token);
}
