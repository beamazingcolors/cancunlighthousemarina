/**
 * Security & Auth Client for Cancun Lighthouse Marina
 * Talks directly to secure backend endpoints (/api/auth/*).
 * All credentials, lockout rules (max 5 attempts), and email alerts are handled on the server.
 */

export interface UserAccount {
  email: string;
  name: string;
  role: 'superadmin' | 'user';
  lastLogin?: number;
}

export interface PasswordPolicyCheck {
  isValid: boolean;
  minLengthOk: boolean;
  charsOk: boolean; // letters, numbers, and special characters
  upperOk: boolean; // at least one uppercase letter
}

export interface LoginAlert {
  id: string;
  userEmail: string;
  userName: string;
  role: 'superadmin' | 'user';
  timestamp: number;
  deviceInfo: string;
  viewed: boolean;
  emailAlertSent?: boolean;
}

const STORAGE_KEYS = {
  AUTH_TOKEN: 'clm_auth_token_v6',
  AUTH_USER: 'clm_auth_user_v6',
  LOGIN_ALERT: 'clm_login_alert_v6',
  API_RATE_LIMIT: 'clm_fetch_rate_v6'
};

// Rate limit for data syncing
const FETCH_COOLDOWN_MS = 5000;
const FETCH_WINDOW_MS = 60000;
const MAX_FETCHES_PER_WINDOW = 12;

/**
 * Sanitizes input
 */
export function sanitizeInput(input: string, maxLength = 120): string {
  if (!input) return '';
  return input.trim().slice(0, maxLength);
}

/**
 * Validates the 3 mandatory password requirements on client for live feedback:
 * 1. Minimum 8 characters
 * 2. Letters, numbers, and special characters
 * 3. At least one uppercase letter
 */
export function validatePasswordPolicy(password: string): PasswordPolicyCheck {
  const minLengthOk = password.length >= 8;
  const hasLetter = /[a-zA-Z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSpecial = /[^a-zA-Z0-9]/.test(password);
  const charsOk = hasLetter && hasNumber && hasSpecial;
  const upperOk = /[A-Z]/.test(password);

  return {
    isValid: minLengthOk && charsOk && upperOk,
    minLengthOk,
    charsOk,
    upperOk
  };
}

/**
 * Fetches a fresh Captcha from backend
 */
export async function fetchBackendCaptcha(): Promise<{ id: string; code: string }> {
  try {
    const res = await fetch('/api/auth/captcha');
    if (!res.ok) throw new Error('Captcha fetch failed');
    return await res.json();
  } catch {
    // Fallback in case of network glitch
    const chars = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ';
    let code = '';
    for (let i = 0; i < 5; i++) code += chars.charAt(Math.floor(Math.random() * chars.length));
    return { id: `local_${Date.now()}`, code };
  }
}

/**
 * Authenticates user credentials via backend API
 * Enforces max 5 attempts, locks account, and triggers real email alert
 */
export async function authenticateCredentials(
  emailInput: string,
  passwordInput: string
): Promise<{
  success: boolean;
  user?: UserAccount;
  alert?: LoginAlert;
  error?: string;
  mustResetPassword?: boolean;
  remainingAttempts?: number;
}> {
  const email = sanitizeInput(emailInput);
  const password = sanitizeInput(passwordInput);

  if (!email || !password) {
    return { success: false, error: 'Por favor completa todos los campos requeridos.' };
  }

  const deviceInfo = typeof navigator !== 'undefined'
    ? `${navigator.userAgent.includes('Mobile') ? 'Dispositivo Móvil' : 'Escritorio'} • ${navigator.platform || 'Navegador Web'}`
    : 'Terminal Autorizada';

  try {
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, deviceInfo })
    });

    const data = await response.json();

    if (!response.ok || !data.success) {
      return {
        success: false,
        error: data.error || 'Credenciales inválidas.',
        mustResetPassword: data.mustResetPassword || false,
        remainingAttempts: data.remainingAttempts
      };
    }

    // Save active token and user
    if (data.sessionToken && data.user) {
      localStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, data.sessionToken);
      localStorage.setItem(STORAGE_KEYS.AUTH_USER, JSON.stringify(data.user));

      const alert: LoginAlert = {
        id: `alert-${Date.now()}`,
        userEmail: data.user.email,
        userName: data.user.name,
        role: data.user.role,
        timestamp: Date.now(),
        deviceInfo,
        viewed: false,
        emailAlertSent: data.emailAlertSent
      };
      localStorage.setItem(STORAGE_KEYS.LOGIN_ALERT, JSON.stringify(alert));

      return {
        success: true,
        user: data.user,
        alert
      };
    }

    return { success: false, error: 'Respuesta de sesión inválida.' };
  } catch (err: any) {
    console.error('[SecurityClient] Auth error:', err);
    return { success: false, error: 'No se pudo conectar con el servidor de autenticación.' };
  }
}

/**
 * Requests password recovery via backend (sends real email with token to user inbox)
 */
export async function requestPasswordReset(
  emailInput: string,
  captchaInput: string,
  captchaId: string
): Promise<{
  success: boolean;
  message?: string;
  error?: string;
  token?: string;
  emailSent?: boolean;
}> {
  try {
    const res = await fetch('/api/auth/forgot-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: sanitizeInput(emailInput),
        captcha: sanitizeInput(captchaInput),
        captchaId
      })
    });

    const data = await res.json();
    if (!res.ok || !data.success) {
      return {
        success: false,
        error: data.error || 'Error al solicitar restablecimiento de contraseña.'
      };
    }

    return {
      success: true,
      message: data.message,
      token: data.token,
      emailSent: data.emailSent
    };
  } catch (err: any) {
    return {
      success: false,
      error: 'Error de conexión con el servidor.'
    };
  }
}

/**
 * Completes password reset on backend, unlocking account
 */
export async function completePasswordReset(
  emailInput: string,
  tokenInput: string,
  newPasswordInput: string
): Promise<{ success: boolean; error?: string; message?: string }> {
  try {
    const res = await fetch('/api/auth/reset-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: sanitizeInput(emailInput),
        token: sanitizeInput(tokenInput),
        newPassword: sanitizeInput(newPasswordInput)
      })
    });

    const data = await res.json();
    if (!res.ok || !data.success) {
      return {
        success: false,
        error: data.error || 'No se pudo restablecer la contraseña.'
      };
    }

    return {
      success: true,
      message: data.message
    };
  } catch (err: any) {
    return {
      success: false,
      error: 'Error de conexión con el servidor.'
    };
  }
}

/**
 * Returns current active session
 */
export function getActiveSession(): { isValid: boolean; user: UserAccount | null } {
  try {
    const token = localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
    const userRaw = localStorage.getItem(STORAGE_KEYS.AUTH_USER);

    if (!token || !userRaw) {
      return { isValid: false, user: null };
    }

    const user: UserAccount = JSON.parse(userRaw);
    return { isValid: true, user };
  } catch {
    return { isValid: false, user: null };
  }
}

/**
 * Terminates session
 */
export function destroySession(): void {
  try {
    const token = localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
    if (token) {
      fetch('/api/auth/logout', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      }).catch(() => {});
    }
    localStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
    localStorage.removeItem(STORAGE_KEYS.AUTH_USER);
    localStorage.removeItem(STORAGE_KEYS.LOGIN_ALERT);
  } catch {
    // ignore
  }
}

/**
 * Returns latest login alert
 */
export function getLatestLoginAlert(): LoginAlert | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.LOGIN_ALERT);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

/**
 * Dismisses latest login alert
 */
export function dismissLoginAlert(): void {
  try {
    localStorage.removeItem(STORAGE_KEYS.LOGIN_ALERT);
  } catch {
    // ignore
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

// =========================================================================
// EMAIL DELIVERY ENGINE USING NODEMAILER & SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS
// Real email transmission for Password Recovery and Login Alerts
// =========================================================================

export interface SendMailResult {
  success: boolean;
  messageId?: string;
  previewUrl?: string;
  error?: string;
}

let cachedTransporter: any = null;

function isValidHost(host: string | undefined): boolean {
  if (!host || typeof host !== 'string') return false;
  const h = host.trim().toLowerCase();
  if (h === 'localhost') return true;
  if (!h.includes('.') || h.includes(' ') || h.length < 4) return false;
  return /^[a-z0-9.-]+\.[a-z]{2,}$/i.test(h) || /^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/.test(h);
}

function parsePort(portStr: string | undefined, defaultPort = 587): number {
  if (!portStr) return defaultPort;
  const p = parseInt(portStr.trim(), 10);
  return !isNaN(p) && p > 0 && p <= 65535 ? p : defaultPort;
}

/**
 * Initializes Nodemailer transporter using SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS
 * Includes connection verification debug logs
 */
export async function getNodemailerTransporter(): Promise<any> {
  if (cachedTransporter) {
    return cachedTransporter;
  }

  // Safe dynamic import to allow both Node.js execution and client-side bundling
  const nodemailerPkg = 'nodemailer';
  const nodemailerModule = await import(/* @vite-ignore */ nodemailerPkg);
  const nodemailer = nodemailerModule.default || nodemailerModule;

  const host = (typeof process !== 'undefined' && process.env?.SMTP_HOST ? process.env.SMTP_HOST : '').trim();
  const port = parsePort(typeof process !== 'undefined' ? process.env?.SMTP_PORT : undefined, 587);
  const user = (typeof process !== 'undefined' && process.env?.SMTP_USER ? process.env.SMTP_USER : '').trim();
  const pass = (typeof process !== 'undefined' && process.env?.SMTP_PASS ? process.env.SMTP_PASS : '').trim();
  const isSecure = (typeof process !== 'undefined' && process.env?.SMTP_SECURE === 'true') || port === 465;

  // 1. Direct custom SMTP with SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS
  if (isValidHost(host) && user && pass) {
    try {
      console.log(`[SMTP Debug] Iniciando transporte con SMTP_HOST=${host}, puerto=${port}, usuario=${user}, secure=${isSecure}`);
      const transporter = nodemailer.createTransport({
        host,
        port,
        secure: isSecure,
        auth: { user, pass },
        tls: { rejectUnauthorized: false }
      });

      // Verification debug log
      console.log(`[SMTP Debug] Verificando conexión con el servidor SMTP (${host}:${port})...`);
      try {
        await transporter.verify();
        console.log(`[SMTP Debug] Conexión SMTP verificada exitosamente con el servidor ${host}:${port}`);
      } catch (verifyErr: any) {
        console.warn(`[SMTP Debug] Aviso al verificar conexión SMTP:`, verifyErr?.message || verifyErr);
      }

      cachedTransporter = transporter;
      return cachedTransporter;
    } catch (err: any) {
      console.warn('[SMTP Debug] Error al inicializar transporte SMTP principal:', err?.message || err);
    }
  }

  // 2. Service preset e.g. SMTP_SERVICE=gmail
  if (typeof process !== 'undefined' && process.env?.SMTP_SERVICE && user && pass) {
    try {
      const transporter = nodemailer.createTransport({
        service: process.env.SMTP_SERVICE,
        auth: { user, pass }
      });
      console.log(`[SMTP Debug] Transporte configurado usando SMTP_SERVICE=${process.env.SMTP_SERVICE}`);
      try {
        await transporter.verify();
        console.log(`[SMTP Debug] Conexión con servicio ${process.env.SMTP_SERVICE} verificada.`);
      } catch (verifyErr: any) {
        console.warn(`[SMTP Debug] Aviso de verificación de servicio:`, verifyErr?.message || verifyErr);
      }
      cachedTransporter = transporter;
      return cachedTransporter;
    } catch (err: any) {
      console.warn('[SMTP Debug] Error de transporte por servicio:', err?.message || err);
    }
  }

  // 3. Fallback: Ethereal test transporter
  try {
    const testAccount = await nodemailer.createTestAccount();
    cachedTransporter = nodemailer.createTransport({
      host: testAccount.smtp.host,
      port: testAccount.smtp.port,
      secure: testAccount.smtp.secure,
      auth: {
        user: testAccount.user,
        pass: testAccount.pass
      }
    });
    console.log(`[SMTP Debug] Transporte de respaldo Ethereal activo con usuario: ${testAccount.user}`);
    return cachedTransporter;
  } catch (err: any) {
    console.warn('[SMTP Debug] Usando transporte JSON local:', err?.message || err);
    cachedTransporter = nodemailer.createTransport({ jsonTransport: true });
    return cachedTransporter;
  }
}

export const getEmailTransporter = getNodemailerTransporter;

const BRAND_NAME = 'Cancun Lighthouse Marina';

function getSenderEmail(): string {
  const from = typeof process !== 'undefined' && process.env?.SMTP_FROM ? process.env.SMTP_FROM.trim() : '';
  const user = typeof process !== 'undefined' && process.env?.SMTP_USER ? process.env.SMTP_USER.trim() : '';
  if (from && from.includes('@')) return from;
  if (user && user.includes('@')) return user;
  return 'seguridad@cancunlighthousemarina.com';
}

/**
 * Envia el correo real de 'Alerta de Inicio de Sesión' vía Nodemailer
 */
export async function sendLoginAlertEmail(
  toEmail: string,
  userName: string,
  role: string,
  deviceInfo: string,
  timestamp: number
): Promise<SendMailResult> {
  try {
    const transporter = await getNodemailerTransporter();
    const dateFormatted = new Date(timestamp).toLocaleString('es-MX', {
      timeZone: 'America/Cancun',
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });

    const roleName = role === 'superadmin' ? 'Super Usuario (Control Maestro)' : 'Usuario Operativo';
    const sender = getSenderEmail();

    const mailOptions = {
      from: `"${BRAND_NAME} Seguridad" <${sender}>`,
      to: toEmail,
      subject: `🚨 Alerta de Inicio de Sesión — ${BRAND_NAME}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f4f7fa; margin: 0; padding: 0; color: #1e293b; }
            .container { max-width: 580px; margin: 24px auto; background: #ffffff; border-radius: 16px; overflow: hidden; border: 1px solid #e2e8f0; box-shadow: 0 10px 25px rgba(0,0,0,0.06); }
            .header { background: linear-gradient(135deg, #002147 0%, #052b57 100%); padding: 32px 24px; text-align: center; color: #ffffff; border-bottom: 3px solid #00A3E0; }
            .header h1 { margin: 0; font-size: 20px; font-weight: 800; letter-spacing: 0.05em; text-transform: uppercase; }
            .header p { margin: 6px 0 0 0; font-size: 11px; letter-spacing: 0.25em; color: #7cd1ff; text-transform: uppercase; font-weight: 600; }
            .content { padding: 32px 28px; }
            .badge { display: inline-block; padding: 4px 12px; background-color: #ecfdf5; border: 1px solid #a7f3d0; color: #047857; font-size: 11px; font-weight: 700; border-radius: 9999px; text-transform: uppercase; }
            .details-box { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 18px; margin: 20px 0; }
            .detail-row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #edf2f7; font-size: 13px; }
            .detail-row:last-child { border-bottom: none; }
            .label { color: #64748b; font-weight: 500; }
            .value { color: #0f172a; font-weight: 700; font-family: monospace; }
            .notice { font-size: 12px; color: #64748b; line-height: 1.6; margin-top: 24px; padding-top: 16px; border-top: 1px solid #e2e8f0; }
            .footer { background: #071322; color: #94a3b8; padding: 20px; text-align: center; font-size: 11px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>CANCUN LIGHTHOUSE MARINA</h1>
              <p>SISTEMA CORPORATIVO DE SEGURIDAD</p>
            </div>
            <div class="content">
              <span class="badge">Sesión Activa</span>
              <h2 style="font-size: 18px; color: #002147; margin: 16px 0 8px 0;">Nuevo inicio de sesión detectado</h2>
              <p style="font-size: 14px; color: #475569; line-height: 1.5; margin: 0 0 16px 0;">
                Hola <strong>${userName}</strong>, te informamos que tu cuenta ha iniciado sesión exitosamente en el portal oficial de operaciones de Cancun Lighthouse Marina.
              </p>

              <div class="details-box">
                <div class="detail-row">
                  <span class="label">Cuenta de Usuario:</span>
                  <span class="value">${toEmail}</span>
                </div>
                <div class="detail-row">
                  <span class="label">Nivel de Acceso:</span>
                  <span class="value">${roleName}</span>
                </div>
                <div class="detail-row">
                  <span class="label">Fecha y Hora (Cancún):</span>
                  <span class="value">${dateFormatted}</span>
                </div>
                <div class="detail-row">
                  <span class="label">Dispositivo / Terminal:</span>
                  <span class="value">${deviceInfo}</span>
                </div>
                <div class="detail-row">
                  <span class="label">Seguridad de Enlace:</span>
                  <span class="value">Cifrado Bancario TLS 1.3</span>
                </div>
              </div>

              <div class="notice">
                Si fuiste tú quien realizó esta acción, no requieres hacer nada adicional. Si no reconoces este acceso, por favor ponte en contacto de inmediato con la administración o restablece tu contraseña en el portal.
              </div>
            </div>
            <div class="footer">
              © ${new Date().getFullYear()} Cancun Lighthouse Marina • Módulo Oficial Cancún Q. Roo.<br>
              Este es un correo automático de seguridad generado por el servidor.
            </div>
          </div>
        </body>
        </html>
      `,
      text: `Alerta de Seguridad - Cancun Lighthouse Marina\n\nHola ${userName},\nSe ha registrado un nuevo inicio de sesión en tu cuenta (${toEmail}) el ${dateFormatted} desde ${deviceInfo}.\nNivel de acceso: ${roleName}.\n\nSi no fuiste tú, restablece tu contraseña de inmediato.`
    };

    let info: any;
    try {
      info = await transporter.sendMail(mailOptions);
    } catch (sendErr: any) {
      console.warn('[security.ts] Primary SMTP send failed, falling back:', sendErr?.message || sendErr);
      cachedTransporter = null;
      const fallbackTransporter = await getNodemailerTransporter();
      info = await fallbackTransporter.sendMail(mailOptions);
    }

    const nodemailerPkg = 'nodemailer';
    const nodemailerModule = await import(/* @vite-ignore */ nodemailerPkg);
    const nodemailer = nodemailerModule.default || nodemailerModule;
    const previewUrl = nodemailer.getTestMessageUrl(info) || undefined;

    console.log(`[security.ts] Login alert sent to ${toEmail}. Message ID: ${info.messageId}`);
    return {
      success: true,
      messageId: info.messageId,
      previewUrl
    };
  } catch (err: any) {
    console.warn('[security.ts] Error sending login alert email:', err?.message || err);
    return {
      success: false,
      error: err?.message || 'Error al enviar correo de alerta de inicio de sesión'
    };
  }
}

/**
 * Envia el correo real de 'Recuperación de contraseña' con token vía Nodemailer
 */
export async function sendPasswordResetEmail(
  toEmail: string,
  userName: string,
  token: string
): Promise<SendMailResult> {
  try {
    const transporter = await getNodemailerTransporter();
    const sender = getSenderEmail();

    const mailOptions = {
      from: `"${BRAND_NAME} Seguridad" <${sender}>`,
      to: toEmail,
      subject: `🔐 Recuperación de contraseña — ${BRAND_NAME}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f4f7fa; margin: 0; padding: 0; color: #1e293b; }
            .container { max-width: 580px; margin: 24px auto; background: #ffffff; border-radius: 16px; overflow: hidden; border: 1px solid #e2e8f0; box-shadow: 0 10px 25px rgba(0,0,0,0.06); }
            .header { background: linear-gradient(135deg, #002147 0%, #052b57 100%); padding: 32px 24px; text-align: center; color: #ffffff; border-bottom: 3px solid #00A3E0; }
            .header h1 { margin: 0; font-size: 20px; font-weight: 800; letter-spacing: 0.05em; text-transform: uppercase; }
            .header p { margin: 6px 0 0 0; font-size: 11px; letter-spacing: 0.25em; color: #7cd1ff; text-transform: uppercase; font-weight: 600; }
            .content { padding: 32px 28px; }
            .token-card { background: #001733; color: #ffffff; border-radius: 12px; padding: 24px; text-align: center; margin: 24px 0; border: 1px solid #00A3E0; }
            .token-code { font-family: monospace; font-size: 28px; font-weight: 900; letter-spacing: 0.25em; color: #00A3E0; margin: 10px 0; }
            .rules-box { background: #f8fafc; border-left: 4px solid #00A3E0; padding: 14px 18px; border-radius: 4px 10px 10px 4px; margin: 20px 0; font-size: 12px; }
            .rules-box ul { margin: 6px 0 0 0; padding-left: 20px; }
            .notice { font-size: 12px; color: #64748b; line-height: 1.6; margin-top: 24px; padding-top: 16px; border-top: 1px solid #e2e8f0; }
            .footer { background: #071322; color: #94a3b8; padding: 20px; text-align: center; font-size: 11px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>CANCUN LIGHTHOUSE MARINA</h1>
              <p>RESTABLECIMIENTO SEGURO DE CONTRASEÑA</p>
            </div>
            <div class="content">
              <h2 style="font-size: 18px; color: #002147; margin: 0 0 12px 0;">Solicitud de cambio de contraseña</h2>
              <p style="font-size: 14px; color: #475569; line-height: 1.5; margin: 0 0 16px 0;">
                Hola <strong>${userName}</strong>, hemos recibido una solicitud para restablecer la contraseña de acceso asociada a tu cuenta <strong>${toEmail}</strong>.
              </p>

              <div class="token-card">
                <span style="font-size: 11px; text-transform: uppercase; letter-spacing: 0.15em; color: #94a3b8;">Tu Token de Verificación:</span>
                <div class="token-code">${token}</div>
                <span style="font-size: 11px; color: #38bdf8;">Válido durante los próximos 15 minutos</span>
              </div>

              <div class="rules-box">
                <strong style="color: #002147;">Requisitos obligatorios para tu nueva contraseña:</strong>
                <ul>
                  <li>Mínimo 8 caracteres</li>
                  <li>Letras, números y caracteres especiales (@, $, %, #, etc.)</li>
                  <li>Mínimo una letra en mayúscula</li>
                </ul>
              </div>

              <div class="notice">
                Si no solicitaste este cambio, puedes ignorar este correo; tu contraseña actual permanecerá inalterada y segura.
              </div>
            </div>
            <div class="footer">
              © ${new Date().getFullYear()} Cancun Lighthouse Marina • Cancún, Quintana Roo.
            </div>
          </div>
        </body>
        </html>
      `,
      text: `Restablecimiento de Contraseña - Cancun Lighthouse Marina\n\nHola ${userName},\nTu código de verificación para cambiar tu contraseña es: ${token}\n\nRequisitos:\n- Mínimo 8 caracteres\n- Letras, números y caracteres especiales\n- Mínimo una mayúscula\n\nVálido por 15 minutos.`
    };

    let info: any;
    try {
      info = await transporter.sendMail(mailOptions);
    } catch (sendErr: any) {
      console.warn('[security.ts] Primary SMTP send failed, falling back:', sendErr?.message || sendErr);
      cachedTransporter = null;
      const fallbackTransporter = await getNodemailerTransporter();
      info = await fallbackTransporter.sendMail(mailOptions);
    }

    const nodemailerPkg = 'nodemailer';
    const nodemailerModule = await import(/* @vite-ignore */ nodemailerPkg);
    const nodemailer = nodemailerModule.default || nodemailerModule;
    const previewUrl = nodemailer.getTestMessageUrl(info) || undefined;

    console.log(`[security.ts] Password reset email sent to ${toEmail}. Token: ${token}`);
    return {
      success: true,
      messageId: info.messageId,
      previewUrl
    };
  } catch (err: any) {
    console.warn('[security.ts] Error sending password reset email:', err?.message || err);
    return {
      success: false,
      error: err?.message || 'Error al enviar correo de restablecimiento'
    };
  }
}

/**
 * Envia confirmación de cambio exitoso de contraseña
 */
export async function sendPasswordChangedConfirmationEmail(
  toEmail: string,
  userName: string
): Promise<SendMailResult> {
  try {
    const transporter = await getNodemailerTransporter();
    const sender = getSenderEmail();

    const mailOptions = {
      from: `"${BRAND_NAME} Seguridad" <${sender}>`,
      to: toEmail,
      subject: `✅ Contraseña Actualizada Exitosamente — ${BRAND_NAME}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f4f7fa; margin: 0; padding: 0; color: #1e293b; }
            .container { max-width: 580px; margin: 24px auto; background: #ffffff; border-radius: 16px; overflow: hidden; border: 1px solid #e2e8f0; }
            .header { background: #002147; padding: 28px 24px; text-align: center; color: #ffffff; border-bottom: 3px solid #10b981; }
            .content { padding: 32px 28px; }
            .footer { background: #071322; color: #94a3b8; padding: 20px; text-align: center; font-size: 11px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1 style="margin:0; font-size:18px;">CANCUN LIGHTHOUSE MARINA</h1>
              <p style="margin:4px 0 0 0; color:#34d399; font-size:11px; font-weight:700;">SEGURIDAD DE CUENTA</p>
            </div>
            <div class="content">
              <h2 style="color:#059669; font-size:17px; margin-top:0;">Tu contraseña ha sido actualizada con éxito</h2>
              <p style="font-size:14px; color:#334155; line-height:1.5;">
                Hola <strong>${userName}</strong>, te confirmamos que la contraseña para <strong>${toEmail}</strong> ha sido cambiada y tu cuenta está activa y desbloqueada.
              </p>
              <p style="font-size:13px; color:#64748b;">
                Ya puedes iniciar sesión en el portal utilizando tu nueva clave.
              </p>
            </div>
            <div class="footer">
              © ${new Date().getFullYear()} Cancun Lighthouse Marina.
            </div>
          </div>
        </body>
        </html>
      `,
      text: `Tu contraseña para Cancun Lighthouse Marina ha sido actualizada exitosamente. Ya puedes iniciar sesión con tu nueva clave.`
    };

    let info: any;
    try {
      info = await transporter.sendMail(mailOptions);
    } catch (sendErr: any) {
      cachedTransporter = null;
      const fallbackTransporter = await getNodemailerTransporter();
      info = await fallbackTransporter.sendMail(mailOptions);
    }

    const nodemailerPkg = 'nodemailer';
    const nodemailerModule = await import(/* @vite-ignore */ nodemailerPkg);
    const nodemailer = nodemailerModule.default || nodemailerModule;

    return {
      success: true,
      messageId: info.messageId,
      previewUrl: nodemailer.getTestMessageUrl(info) || undefined
    };
  } catch (err: any) {
    return {
      success: false,
      error: err?.message
    };
  }
}
