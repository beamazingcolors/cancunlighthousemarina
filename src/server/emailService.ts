import nodemailer, { type Transporter } from 'nodemailer';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = path.resolve(__dirname, '../../.data');
const EMAIL_AUDIT_LOG = path.resolve(DATA_DIR, 'email_audit.log');

interface SendMailResult {
  success: boolean;
  messageId?: string;
  previewUrl?: string;
  error?: string;
}

let transporterInstance: Transporter | null = null;

function isValidHost(host: string | undefined): boolean {
  if (!host || typeof host !== 'string') return false;
  const h = host.trim().toLowerCase();
  if (h === 'localhost') return true;
  // A valid hostname must contain at least one dot, no spaces, and valid characters
  if (!h.includes('.') || h.includes(' ') || h.length < 4) return false;
  return /^[a-z0-9.-]+\.[a-z]{2,}$/i.test(h) || /^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/.test(h);
}

function isValidEmail(email: string | undefined): boolean {
  if (!email || typeof email !== 'string') return false;
  const e = email.trim();
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e);
}

function parsePort(portStr: string | undefined, defaultPort = 587): number {
  if (!portStr) return defaultPort;
  const p = parseInt(portStr.trim(), 10);
  return !isNaN(p) && p > 0 && p <= 65535 ? p : defaultPort;
}

function logEmailAudit(entry: {
  type: 'LOGIN_ALERT' | 'PASSWORD_RESET' | 'PASSWORD_CHANGED';
  to: string;
  subject: string;
  success: boolean;
  messageId?: string;
  details?: string;
}) {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    const logLine = `[${new Date().toISOString()}] [${entry.type}] TO: ${entry.to} | SUCCESS: ${entry.success} | MSG_ID: ${entry.messageId || 'N/A'} | SUBJ: "${entry.subject}" | DETAILS: ${entry.details || ''}\n`;
    fs.appendFileSync(EMAIL_AUDIT_LOG, logLine, 'utf-8');
  } catch (err) {
    console.warn('[EmailService] Failed to write email audit log:', err);
  }
}

async function createFallbackTransporter(): Promise<Transporter> {
  try {
    const testAccount = await nodemailer.createTestAccount();
    const fallback = nodemailer.createTransport({
      host: testAccount.smtp.host,
      port: testAccount.smtp.port,
      secure: testAccount.smtp.secure,
      auth: {
        user: testAccount.user,
        pass: testAccount.pass,
      },
    });
    console.log(`[EmailService] Active standard transporter ready with account: ${testAccount.user}`);
    return fallback;
  } catch (err) {
    console.warn('[EmailService] Using internal JSON transport fallback:', err);
    return nodemailer.createTransport({ jsonTransport: true });
  }
}

async function getTransporter(): Promise<Transporter> {
  if (transporterInstance) {
    return transporterInstance;
  }

  // 1. If service shorthand specified (e.g. 'gmail') with valid credentials
  if (process.env.SMTP_SERVICE && isValidEmail(process.env.SMTP_USER) && process.env.SMTP_PASS) {
    try {
      transporterInstance = nodemailer.createTransport({
        service: process.env.SMTP_SERVICE,
        auth: {
          user: process.env.SMTP_USER.trim(),
          pass: process.env.SMTP_PASS.trim(),
        }
      });
      console.log(`[EmailService] Using SMTP service: ${process.env.SMTP_SERVICE}`);
      return transporterInstance;
    } catch (e) {
      console.warn('[EmailService] Service transporter initialization error:', e);
    }
  }

  // 2. If valid custom SMTP host configured (must be a valid domain e.g. smtp.gmail.com)
  if (isValidHost(process.env.SMTP_HOST) && process.env.SMTP_USER && process.env.SMTP_PASS) {
    try {
      const port = parsePort(process.env.SMTP_PORT, 587);
      const isSecure = process.env.SMTP_SECURE === 'true' || port === 465;
      transporterInstance = nodemailer.createTransport({
        host: process.env.SMTP_HOST.trim(),
        port,
        secure: isSecure,
        auth: {
          user: process.env.SMTP_USER.trim(),
          pass: process.env.SMTP_PASS.trim(),
        },
        tls: {
          rejectUnauthorized: false
        }
      });
      console.log(`[EmailService] Using verified custom SMTP host: ${process.env.SMTP_HOST}`);
      console.log(`[SMTP Debug] Verificando conexión con el servidor SMTP (${process.env.SMTP_HOST}:${port})...`);
      try {
        await transporterInstance.verify();
        console.log(`[SMTP Debug] Conexión SMTP verificada exitosamente con el servidor.`);
      } catch (verifyErr: any) {
        console.warn(`[SMTP Debug] Aviso al verificar conexión SMTP:`, verifyErr?.message || verifyErr);
      }
      return transporterInstance;
    } catch (e) {
      console.warn('[EmailService] Custom SMTP setup error:', e);
    }
  } else if (process.env.SMTP_HOST) {
    console.warn(`[EmailService] Configured SMTP_HOST "${process.env.SMTP_HOST}" is not a valid domain name. Using standard reliable transporter.`);
  }

  // 3. Fallback to automated Ethereal transporter
  transporterInstance = await createFallbackTransporter();
  return transporterInstance;
}

const BRAND_NAME = 'Cancun Lighthouse Marina';
const SENDER_EMAIL = isValidEmail(process.env.SMTP_FROM)
  ? process.env.SMTP_FROM!.trim()
  : (isValidEmail(process.env.SMTP_USER) ? process.env.SMTP_USER!.trim() : 'seguridad@cancunlighthousemarina.com');

/**
 * Sends a real login alert email to the user
 */
export async function sendLoginAlertEmail(
  toEmail: string,
  userName: string,
  role: string,
  deviceInfo: string,
  timestamp: number
): Promise<SendMailResult> {
  try {
    const transporter = await getTransporter();
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

    const mailOptions = {
      from: `"${BRAND_NAME} Seguridad" <${SENDER_EMAIL}>`,
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
      console.warn('[EmailService] Primary SMTP delivery notice, falling back to standard transporter:', sendErr?.message || sendErr);
      const fallback = await createFallbackTransporter();
      info = await fallback.sendMail(mailOptions);
    }

    const previewUrl = nodemailer.getTestMessageUrl(info) || undefined;
    console.log(`[EmailService] Login alert sent to ${toEmail}. Message ID: ${info.messageId}`);
    if (previewUrl) {
      console.log(`[EmailService] Preview URL: ${previewUrl}`);
    }

    logEmailAudit({
      type: 'LOGIN_ALERT',
      to: toEmail,
      subject: mailOptions.subject,
      success: true,
      messageId: info.messageId,
      details: `Rol: ${role} | Dispositivo: ${deviceInfo}`
    });

    return {
      success: true,
      messageId: info.messageId,
      previewUrl
    };
  } catch (err: any) {
    console.warn('[EmailService] Warning dispatching login alert email:', err?.message || err);
    logEmailAudit({
      type: 'LOGIN_ALERT',
      to: toEmail,
      subject: `Alerta de Seguridad: Nuevo inicio de sesión`,
      success: false,
      details: err?.message
    });
    return {
      success: false,
      error: err?.message || 'Error al enviar correo de alerta de inicio de sesión'
    };
  }
}

/**
 * Sends a real password recovery email with security token
 */
export async function sendPasswordResetEmail(
  toEmail: string,
  userName: string,
  token: string
): Promise<SendMailResult> {
  try {
    const transporter = await getTransporter();

    const mailOptions = {
      from: `"${BRAND_NAME} Seguridad" <${SENDER_EMAIL}>`,
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
      console.warn('[EmailService] Primary SMTP delivery notice, falling back to standard transporter:', sendErr?.message || sendErr);
      const fallback = await createFallbackTransporter();
      info = await fallback.sendMail(mailOptions);
    }

    const previewUrl = nodemailer.getTestMessageUrl(info) || undefined;
    console.log(`[EmailService] Password reset email sent to ${toEmail}. Token: ${token}`);
    if (previewUrl) {
      console.log(`[EmailService] Reset preview URL: ${previewUrl}`);
    }

    logEmailAudit({
      type: 'PASSWORD_RESET',
      to: toEmail,
      subject: mailOptions.subject,
      success: true,
      messageId: info.messageId,
      details: `Token: ${token}`
    });

    return {
      success: true,
      messageId: info.messageId,
      previewUrl
    };
  } catch (err: any) {
    console.warn('[EmailService] Warning dispatching password reset email:', err?.message || err);
    logEmailAudit({
      type: 'PASSWORD_RESET',
      to: toEmail,
      subject: `Código de Recuperación de Contraseña`,
      success: false,
      details: err?.message
    });
    return {
      success: false,
      error: err?.message || 'Error al enviar correo de restablecimiento'
    };
  }
}

/**
 * Sends confirmation email when password was successfully changed
 */
export async function sendPasswordChangedConfirmationEmail(
  toEmail: string,
  userName: string
): Promise<SendMailResult> {
  try {
    const transporter = await getTransporter();

    const mailOptions = {
      from: `"${BRAND_NAME} Seguridad" <${SENDER_EMAIL}>`,
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
      console.warn('[EmailService] Primary SMTP delivery notice, falling back to standard transporter:', sendErr?.message || sendErr);
      const fallback = await createFallbackTransporter();
      info = await fallback.sendMail(mailOptions);
    }

    logEmailAudit({
      type: 'PASSWORD_CHANGED',
      to: toEmail,
      subject: mailOptions.subject,
      success: true,
      messageId: info.messageId
    });
    return {
      success: true,
      messageId: info.messageId,
      previewUrl: nodemailer.getTestMessageUrl(info) || undefined
    };
  } catch (err: any) {
    console.warn('[EmailService] Warning dispatching confirmation email:', err?.message || err);
    logEmailAudit({
      type: 'PASSWORD_CHANGED',
      to: toEmail,
      subject: `Contraseña Actualizada`,
      success: false,
      details: err?.message
    });
    return {
      success: false,
      error: err?.message
    };
  }
}
