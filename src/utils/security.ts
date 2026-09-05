/**
 * Security & Rate Limiting Engine for Cancun Lighthouse Marina
 * Implements secure authentication, brute-force defense, rate limiting, and session verification.
 */

// Authorized credentials
const AUTH_EMAIL = 'admin@cancunlighthousemarina.com';
const AUTH_PASSWORD = 'Superyates$123';

const STORAGE_KEYS = {
  AUTH_SESSION: 'clm_sec_session_v3',
  LOGIN_ATTEMPTS: 'clm_sec_attempts_v3',
  API_RATE_LIMIT: 'clm_sec_fetch_rate_v3'
};

const MAX_FAILED_ATTEMPTS = 5;
const BASE_LOCKOUT_MS = 2 * 60 * 1000; // 2 minutes
const SESSION_MAX_AGE_MS = 24 * 60 * 60 * 1000; // 24 hours

// Rate limit for data syncing: min 5 seconds cooldown, max 12 requests per minute
const FETCH_COOLDOWN_MS = 5000;
const FETCH_WINDOW_MS = 60000;
const MAX_FETCHES_PER_WINDOW = 12;

/**
 * Constant-time string comparison to prevent timing attacks
 */
function constantTimeEquals(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let result = 0;
  for (let i = 0; i < a.length; i++) {
    result |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return result === 0;
}

/**
 * Sanitizes input by trimming and capping max length without corrupting valid email/password characters
 */
export function sanitizeInput(input: string, maxLength = 120): string {
  if (!input) return '';
  return input.trim().slice(0, maxLength);
}

export interface LoginSecurityStatus {
  isLocked: boolean;
  remainingLockoutSeconds: number;
  remainingAttempts: number;
  totalAttemptsAllowed: number;
  failedAttempts: number;
}

interface StoredAttemptData {
  failedAttempts: number;
  lockedUntil: number | null;
  lockoutCount: number;
  lastAttemptTime: number;
}

function getStoredAttemptData(): StoredAttemptData {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.LOGIN_ATTEMPTS);
    if (!raw) {
      return { failedAttempts: 0, lockedUntil: null, lockoutCount: 0, lastAttemptTime: 0 };
    }
    const data = JSON.parse(raw);
    return {
      failedAttempts: Number(data.failedAttempts) || 0,
      lockedUntil: data.lockedUntil ? Number(data.lockedUntil) : null,
      lockoutCount: Number(data.lockoutCount) || 0,
      lastAttemptTime: Number(data.lastAttemptTime) || 0
    };
  } catch {
    return { failedAttempts: 0, lockedUntil: null, lockoutCount: 0, lastAttemptTime: 0 };
  }
}

function saveStoredAttemptData(data: StoredAttemptData) {
  try {
    localStorage.setItem(STORAGE_KEYS.LOGIN_ATTEMPTS, JSON.stringify(data));
  } catch (e) {
    console.warn('Storage unavailable', e);
  }
}

/**
 * Returns current login security and lockout status
 */
export function getLoginSecurityStatus(): LoginSecurityStatus {
  const now = Date.now();
  const data = getStoredAttemptData();

  if (data.lockedUntil && now < data.lockedUntil) {
    const remainingSeconds = Math.ceil((data.lockedUntil - now) / 1000);
    return {
      isLocked: true,
      remainingLockoutSeconds: remainingSeconds,
      remainingAttempts: 0,
      totalAttemptsAllowed: MAX_FAILED_ATTEMPTS,
      failedAttempts: data.failedAttempts
    };
  }

  // Lockout expired, reset attempts
  if (data.lockedUntil && now >= data.lockedUntil) {
    data.lockedUntil = null;
    data.failedAttempts = 0;
    saveStoredAttemptData(data);
  }

  const remaining = Math.max(0, MAX_FAILED_ATTEMPTS - data.failedAttempts);

  return {
    isLocked: false,
    remainingLockoutSeconds: 0,
    remainingAttempts: remaining,
    totalAttemptsAllowed: MAX_FAILED_ATTEMPTS,
    failedAttempts: data.failedAttempts
  };
}

/**
 * Records a failed login attempt and calculates lockout if limit exceeded
 */
export function recordFailedAttempt(): LoginSecurityStatus {
  const now = Date.now();
  const data = getStoredAttemptData();

  data.failedAttempts += 1;
  data.lastAttemptTime = now;

  if (data.failedAttempts >= MAX_FAILED_ATTEMPTS) {
    data.lockoutCount += 1;
    const multiplier = Math.min(Math.pow(2, data.lockoutCount - 1), 6);
    const lockoutDuration = BASE_LOCKOUT_MS * multiplier;
    data.lockedUntil = now + lockoutDuration;
  }

  saveStoredAttemptData(data);
  return getLoginSecurityStatus();
}

/**
 * Resets failed attempts after a successful login
 */
export function recordSuccessfulLogin(email: string): void {
  try {
    localStorage.removeItem(STORAGE_KEYS.LOGIN_ATTEMPTS);
    
    // Store active session
    const sessionPayload = {
      user: email,
      createdAt: Date.now(),
      expiresAt: Date.now() + SESSION_MAX_AGE_MS
    };
    localStorage.setItem(STORAGE_KEYS.AUTH_SESSION, JSON.stringify(sessionPayload));
  } catch (e) {
    console.warn('Storage unavailable', e);
  }
}

/**
 * Checks if current saved session is valid and not expired
 */
export function getActiveSession(): { isValid: boolean; user: string } {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.AUTH_SESSION);
    if (!raw) return { isValid: false, user: '' };

    const session = JSON.parse(raw);
    const now = Date.now();

    if (session.expiresAt && now > session.expiresAt) {
      localStorage.removeItem(STORAGE_KEYS.AUTH_SESSION);
      return { isValid: false, user: '' };
    }

    if (session.user) {
      return { isValid: true, user: session.user };
    }
  } catch {
    return { isValid: false, user: '' };
  }

  return { isValid: false, user: '' };
}

/**
 * Terminates active session
 */
export function destroySession(): void {
  try {
    localStorage.removeItem(STORAGE_KEYS.AUTH_SESSION);
  } catch (e) {
    console.warn('Storage unavailable', e);
  }
}

/**
 * Verifies credentials safely with constant-time equality and brute-force protection
 */
export async function authenticateCredentials(
  emailInput: string, 
  passwordInput: string
): Promise<{ success: boolean; error?: string }> {
  // Check lockout status
  const status = getLoginSecurityStatus();
  if (status.isLocked) {
    return {
      success: false,
      error: `Acceso bloqueado por seguridad. Espera ${status.remainingLockoutSeconds} segundos antes de reintentar.`
    };
  }

  const cleanEmail = sanitizeInput(emailInput).toLowerCase();
  const cleanPassword = sanitizeInput(passwordInput);

  if (!cleanEmail || !cleanPassword) {
    return { success: false, error: 'Por favor ingresa usuario y contraseña.' };
  }

  // Artificial anti-timing jitter delay (200ms)
  await new Promise(r => setTimeout(r, 200));

  const isEmailMatch = constantTimeEquals(cleanEmail, AUTH_EMAIL.toLowerCase());
  const isPasswordMatch = constantTimeEquals(cleanPassword, AUTH_PASSWORD);

  if (isEmailMatch && isPasswordMatch) {
    recordSuccessfulLogin(cleanEmail);
    return { success: true };
  } else {
    const updatedStatus = recordFailedAttempt();
    if (updatedStatus.isLocked) {
      return {
        success: false,
        error: `Has superado el límite de 5 intentos. Acceso bloqueado por ${updatedStatus.remainingLockoutSeconds} segundos.`
      };
    }
    return {
      success: false,
      error: `Credenciales inválidas. Te quedan ${updatedStatus.remainingAttempts} de ${updatedStatus.totalAttemptsAllowed} intentos.`
    };
  }
}

/**
 * Rate Limiter for Data Fetching
 */
export function checkFetchRateLimit(): { allowed: boolean; waitSeconds?: number; reason?: string } {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.API_RATE_LIMIT);
    const now = Date.now();
    let timestamps: number[] = raw ? JSON.parse(raw) : [];

    // Filter to last 60 seconds
    timestamps = timestamps.filter(t => now - t < FETCH_WINDOW_MS);

    // Check last fetch cooldown
    if (timestamps.length > 0) {
      const lastFetch = timestamps[timestamps.length - 1];
      const elapsedSinceLast = now - lastFetch;
      if (elapsedSinceLast < FETCH_COOLDOWN_MS) {
        const wait = Math.ceil((FETCH_COOLDOWN_MS - elapsedSinceLast) / 1000);
        return {
          allowed: false,
          waitSeconds: wait,
          reason: `Espera ${wait} segundo${wait > 1 ? 's' : ''} antes de volver a sincronizar.`
        };
      }
    }

    // Check max requests per window
    if (timestamps.length >= MAX_FETCHES_PER_WINDOW) {
      const oldestInWindow = timestamps[0];
      const wait = Math.ceil((FETCH_WINDOW_MS - (now - oldestInWindow)) / 1000);
      return {
        allowed: false,
        waitSeconds: wait,
        reason: `Límite de sincronizaciones alcanzado (máx ${MAX_FETCHES_PER_WINDOW}/min). Espera ${wait}s.`
      };
    }

    // Record fetch
    timestamps.push(now);
    localStorage.setItem(STORAGE_KEYS.API_RATE_LIMIT, JSON.stringify(timestamps));
    return { allowed: true };
  } catch {
    return { allowed: true };
  }
}
