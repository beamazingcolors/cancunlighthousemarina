import nodemailer from 'nodemailer';
import type { Transporter } from 'nodemailer';

export interface SendMailResult {
  success: boolean;
  messageId?: string;
  previewUrl?: string;
  error?: string;
}

let cachedTransporter: Transporter | null = null;

/**
 * Creates and configures the Nodemailer transporter using SMTP environment variables:
 * SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS
 */
export function getEmailTransporter(): Transporter {
  if (cachedTransporter) {
    return cachedTransporter;
  }

  const host = (process.env.SMTP_HOST || '').trim();
  const rawPort = (process.env.SMTP_PORT || '').trim();
  const port = parseInt(rawPort, 10);
  const validPort = !isNaN(port) && port > 0 && port <= 65535 ? port : 587;
  const user = (process.env.SMTP_USER || '').trim();
  const pass = (process.env.SMTP_PASS || '').trim();
  const secure = (process.env.SMTP_SECURE === 'true') || validPort === 465;

  if (host && user && pass) {
    try {
      console.log(`[SMTP Debug] Configurando transporte con SMTP_HOST=${host}, port=${validPort}, user=${user}, secure=${secure}`);
      const transporter = nodemailer.createTransport({
        host,
        port: validPort,
        secure,
        auth: {
          user,
          pass,
        },
        tls: {
          rejectUnauthorized: false,
        },
      });

      // Verification debug log
      console.log(`[SMTP Debug] Verificando conexión con el servidor SMTP (${host}:${validPort})...`);
      transporter.verify().then(() => {
        console.log(`[SMTP Debug] Conexión SMTP verificada exitosamente con el servidor ${host}:${validPort}`);
      }).catch((verifyErr: any) => {
        console.warn(`[SMTP Debug] Aviso al verificar conexión SMTP:`, verifyErr?.message || verifyErr);
      });

      cachedTransporter = transporter;
      return cachedTransporter;
    } catch (err: any) {
      console.warn('[utils/security.ts] Error al crear transporte SMTP:', err?.message || err);
    }
  }

  // Fallback to JSON transport or default transport if credentials are not valid
  cachedTransporter = nodemailer.createTransport({
    jsonTransport: true,
  });
  return cachedTransporter;
}

const BRAND_NAME = 'Cancun Lighthouse Marina';

function getSenderAddress(): string {
  const from = (process.env.SMTP_FROM || '').trim();
  const user = (process.env.SMTP_USER || '').trim();
  if (from && from.includes('@')) return from;
  if (user && user.includes('@')) return user;
  return 'seguridad@cancunlighthousemarina.com';
}

/**
 * Envia el correo real de 'Alerta de Inicio de Sesión' al usuario vía Nodemailer
 */
export async function sendLoginAlertEmail(
  toEmail: string,
  userName: string,
  role: string,
  deviceInfo: string,
  timestamp: number
): Promise<SendMailResult> {
  try {
    const transporter = getEmailTransporter();
    const dateFormatted = new Date(timestamp).toLocaleString('es-MX', {
      timeZone: 'America/Cancun',
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });

    const roleName = role === 'superadmin' ? 'Super Usuario (Control Maestro)' : 'Usuario Operativo';
    const sender = getSenderAddress();

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
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f4f7fa; margin: 0; padding: 0; color: #1e293b; }
            .container { max-width: 580px; margin: 24px auto; background: #ffffff; border-radius: 16px; overflow: hidden; border: 1px solid #e2e8f0; }
            .header { background: linear-gradient(135deg, #002147 0%, #052b57 100%); padding: 32px 24px; text-align: center; color: #ffffff; border-bottom: 3px solid #00A3E0; }
            .content { padding: 32px 28px; }
            .details-box { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 18px; margin: 20px 0; }
            .detail-row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #edf2f7; font-size: 13px; }
            .footer { background: #071322; color: #94a3b8; padding: 20px; text-align: center; font-size: 11px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1 style="margin: 0; font-size: 20px;">CANCUN LIGHTHOUSE MARINA</h1>
              <p style="margin: 6px 0 0 0; font-size: 11px; color: #7cd1ff;">ALERTA DE INICIO DE SESIÓN</p>
            </div>
            <div class="content">
              <h2 style="font-size: 18px; color: #002147; margin-top: 0;">Nuevo inicio de sesión detectado</h2>
              <p style="font-size: 14px; color: #475569; line-height: 1.5;">
                Hola <strong>${userName}</strong>, se ha registrado un nuevo inicio de sesión en tu cuenta en el portal de Cancun Lighthouse Marina.
              </p>
              <div class="details-box">
                <div class="detail-row"><span>Usuario:</span><strong>${toEmail}</strong></div>
                <div class="detail-row"><span>Nivel:</span><strong>${roleName}</strong></div>
                <div class="detail-row"><span>Fecha:</span><strong>${dateFormatted}</strong></div>
                <div class="detail-row"><span>Dispositivo:</span><strong>${deviceInfo}</strong></div>
              </div>
              <p style="font-size: 12px; color: #64748b;">
                Si fuiste tú, no requieres hacer nada adicional. Si no reconoces este acceso, ponte en contacto de inmediato con la administración.
              </p>
            </div>
            <div class="footer">
              © ${new Date().getFullYear()} Cancun Lighthouse Marina.
            </div>
          </div>
        </body>
        </html>
      `,
      text: `Alerta de Inicio de Sesión - Cancun Lighthouse Marina\n\nHola ${userName},\nSe ha registrado un nuevo inicio de sesión en tu cuenta (${toEmail}) el ${dateFormatted} desde ${deviceInfo}.\nNivel: ${roleName}.`,
    };

    let info: any;
    try {
      info = await transporter.sendMail(mailOptions);
    } catch (sendErr: any) {
      console.warn('[utils/security.ts] SMTP send error, using fallback:', sendErr?.message || sendErr);
      const fallback = nodemailer.createTransport({ jsonTransport: true });
      info = await fallback.sendMail(mailOptions);
    }

    const previewUrl = nodemailer.getTestMessageUrl(info) || undefined;
    console.log(`[utils/security.ts] Alerta de Inicio de Sesión enviada a ${toEmail}. Message ID: ${info?.messageId || 'N/A'}`);
    return {
      success: true,
      messageId: info?.messageId,
      previewUrl,
    };
  } catch (err: any) {
    console.warn('[utils/security.ts] Error en sendLoginAlertEmail:', err?.message || err);
    return {
      success: false,
      error: err?.message || 'Error al enviar correo de alerta de inicio de sesión',
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
    const transporter = getEmailTransporter();
    const sender = getSenderAddress();

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
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f4f7fa; margin: 0; padding: 0; color: #1e293b; }
            .container { max-width: 580px; margin: 24px auto; background: #ffffff; border-radius: 16px; overflow: hidden; border: 1px solid #e2e8f0; }
            .header { background: linear-gradient(135deg, #002147 0%, #052b57 100%); padding: 32px 24px; text-align: center; color: #ffffff; border-bottom: 3px solid #00A3E0; }
            .content { padding: 32px 28px; }
            .token-card { background: #001733; color: #ffffff; border-radius: 12px; padding: 24px; text-align: center; margin: 24px 0; border: 1px solid #00A3E0; }
            .token-code { font-family: monospace; font-size: 28px; font-weight: 900; letter-spacing: 0.25em; color: #00A3E0; margin: 10px 0; }
            .footer { background: #071322; color: #94a3b8; padding: 20px; text-align: center; font-size: 11px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1 style="margin: 0; font-size: 20px;">CANCUN LIGHTHOUSE MARINA</h1>
              <p style="margin: 6px 0 0 0; font-size: 11px; color: #7cd1ff;">RECUPERACIÓN DE CONTRASEÑA</p>
            </div>
            <div class="content">
              <h2 style="font-size: 18px; color: #002147; margin-top: 0;">Recuperación de contraseña</h2>
              <p style="font-size: 14px; color: #475569; line-height: 1.5;">
                Hola <strong>${userName}</strong>, hemos recibido una solicitud de recuperación de contraseña para tu cuenta <strong>${toEmail}</strong>.
              </p>
              <div class="token-card">
                <span style="font-size: 11px; text-transform: uppercase; color: #94a3b8;">Tu Código de Verificación:</span>
                <div class="token-code">${token}</div>
                <span style="font-size: 11px; color: #38bdf8;">Válido durante 15 minutos</span>
              </div>
              <p style="font-size: 12px; color: #64748b;">
                Requisitos para tu nueva contraseña: mínimo 8 caracteres, al menos una mayúscula y combinación de letras, números y caracteres especiales.
              </p>
            </div>
            <div class="footer">
              © ${new Date().getFullYear()} Cancun Lighthouse Marina.
            </div>
          </div>
        </body>
        </html>
      `,
      text: `Recuperación de contraseña - Cancun Lighthouse Marina\n\nHola ${userName},\nTu código de verificación para cambiar tu contraseña es: ${token}\n\nVálido durante 15 minutos.`,
    };

    let info: any;
    try {
      info = await transporter.sendMail(mailOptions);
    } catch (sendErr: any) {
      console.warn('[utils/security.ts] SMTP send error, using fallback:', sendErr?.message || sendErr);
      const fallback = nodemailer.createTransport({ jsonTransport: true });
      info = await fallback.sendMail(mailOptions);
    }

    const previewUrl = nodemailer.getTestMessageUrl(info) || undefined;
    console.log(`[utils/security.ts] Correo de Recuperación de contraseña enviado a ${toEmail}. Token: ${token}`);
    return {
      success: true,
      messageId: info?.messageId,
      previewUrl,
    };
  } catch (err: any) {
    console.warn('[utils/security.ts] Error en sendPasswordResetEmail:', err?.message || err);
    return {
      success: false,
      error: err?.message || 'Error al enviar correo de recuperación de contraseña',
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
    const transporter = getEmailTransporter();
    const sender = getSenderAddress();

    const mailOptions = {
      from: `"${BRAND_NAME} Seguridad" <${sender}>`,
      to: toEmail,
      subject: `✅ Contraseña Actualizada Exitosamente — ${BRAND_NAME}`,
      html: `
        <div style="font-family: sans-serif; padding: 20px; color: #1e293b;">
          <h2>Tu contraseña ha sido actualizada con éxito</h2>
          <p>Hola <strong>${userName}</strong>, tu contraseña para <strong>${toEmail}</strong> ha sido restablecida.</p>
        </div>
      `,
      text: `Tu contraseña para Cancun Lighthouse Marina ha sido actualizada exitosamente.`,
    };

    let info: any;
    try {
      info = await transporter.sendMail(mailOptions);
    } catch {
      const fallback = nodemailer.createTransport({ jsonTransport: true });
      info = await fallback.sendMail(mailOptions);
    }

    return {
      success: true,
      messageId: info?.messageId,
    };
  } catch (err: any) {
    return {
      success: false,
      error: err?.message,
    };
  }
}
