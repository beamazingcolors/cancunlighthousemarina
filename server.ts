import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI, Type } from '@google/genai';

dotenv.config({ override: true });

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Parse port from args e.g. --port 3000 or process.env.PORT
let port = 3000;
const portArgIndex = process.argv.indexOf('--port');
if (portArgIndex !== -1 && process.argv[portArgIndex + 1]) {
  port = parseInt(process.argv[portArgIndex + 1], 10);
} else if (process.env.PORT) {
  port = parseInt(process.env.PORT, 10);
}

app.use(express.json({ limit: '10mb' }));

// ==========================================
// BACKEND SECURE AUTHENTICATION ENDPOINTS
// ==========================================
import { 
  authenticateUser, 
  generateBackendCaptcha, 
  requestPasswordReset, 
  resetPasswordWithToken, 
  validateSessionToken, 
  destroySessionToken 
} from './src/server/authService.js';

// Get visual Captcha
app.get('/api/auth/captcha', (_req, res) => {
  try {
    const captcha = generateBackendCaptcha();
    return res.json(captcha);
  } catch (err: any) {
    return res.status(500).json({ error: 'Error generating captcha' });
  }
});

// Authenticate user with 5-attempt limit and alert email
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password, deviceInfo } = req.body;
    const result = await authenticateUser(email, password, deviceInfo);

    if (!result.success) {
      return res.status(401).json(result);
    }

    return res.json(result);
  } catch (err: any) {
    console.error('[Server] Login error:', err);
    return res.status(500).json({ error: 'Error interno de autenticación' });
  }
});

// Request password reset (sends real email with token)
app.post('/api/auth/forgot-password', async (req, res) => {
  try {
    const { email, captcha, captchaId } = req.body;
    const result = await requestPasswordReset(email, captcha, captchaId);

    if (!result.success) {
      return res.status(400).json(result);
    }

    return res.json(result);
  } catch (err: any) {
    console.error('[Server] Forgot password error:', err);
    return res.status(500).json({ error: 'Error al procesar recuperación de contraseña' });
  }
});

// Reset password with token, unlock account, and enforce 3 policy rules
app.post('/api/auth/reset-password', async (req, res) => {
  try {
    const { email, token, newPassword } = req.body;
    const result = await resetPasswordWithToken(email, token, newPassword);

    if (!result.success) {
      return res.status(400).json(result);
    }

    return res.json(result);
  } catch (err: any) {
    console.error('[Server] Reset password error:', err);
    return res.status(500).json({ error: 'Error al actualizar contraseña' });
  }
});

// Validate active session
app.get('/api/auth/session', (req, res) => {
  try {
    const authHeader = req.headers.authorization || '';
    const token = authHeader.replace(/^Bearer\s+/i, '');
    const sessionResult = validateSessionToken(token);
    return res.json(sessionResult);
  } catch {
    return res.json({ isValid: false });
  }
});

// Logout session
app.post('/api/auth/logout', (req, res) => {
  try {
    const authHeader = req.headers.authorization || '';
    const token = authHeader.replace(/^Bearer\s+/i, '');
    destroySessionToken(token);
    return res.json({ success: true });
  } catch {
    return res.json({ success: true });
  }
});

// Live Google Sheet TSV proxy endpoint to ensure client always gets the complete, uncached Google Sheet data
app.get('/api/marina-tsv', async (_req, res) => {
  try {
    const LIVE_TSV_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vRHr_YZ4y1-Ww6JKAerEWp1jCp07k3SZkiZcYx47A55PRA7dM-0DLzRMeJgplZbAwLDxswE2sVN9L-U/pub?gid=1624494179&single=true&output=tsv';
    const fetchUrl = `${LIVE_TSV_URL}&_nocache=${Date.now()}`;
    const response = await fetch(fetchUrl, {
      headers: {
        'Accept': 'text/tab-separated-values, text/plain',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    });
    if (!response.ok) {
      throw new Error(`Google Sheets responded with status ${response.status}`);
    }
    const tsvData = await response.text();
    res.setHeader('Content-Type', 'text/tab-separated-values; charset=utf-8');
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate');
    return res.send(tsvData);
  } catch (err: any) {
    console.error('Error fetching live TSV in proxy:', err);
    return res.status(502).json({ error: 'Failed to fetch Google Sheet TSV', details: err?.message });
  }
});

// Shared Gemini Client with User-Agent telemetry as mandated by gemini-api guidelines
const apiKey = process.env.GEMINI_API_KEY || '';
const ai = new GoogleGenAI({
  apiKey,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

// Helper to call Gemini with retry and fallback across supported flash models in case of transient 503/429
async function generateTrendsAnalysisWithGemini(prompt: string, systemInstruction: string, schema: any) {
  const modelsToTry = ['gemini-3.8-flash', 'gemini-flash-latest', 'gemini-3.1-flash-lite'];
  let lastError: any = null;

  for (const model of modelsToTry) {
    for (let attempt = 1; attempt <= 2; attempt++) {
      try {
        const response = await ai.models.generateContent({
          model,
          contents: prompt,
          config: {
            systemInstruction,
            responseMimeType: 'application/json',
            responseSchema: schema,
          },
        });

        const text = response.text;
        if (text) {
          return JSON.parse(text);
        }
      } catch (err: any) {
        lastError = err;
        console.warn(`Model ${model} attempt ${attempt} warning:`, err?.message || err);
        // Short pause between retries
        await new Promise((resolve) => setTimeout(resolve, 800 * attempt));
      }
    }
  }

  throw lastError;
}

// API endpoint to analyze weekly trends and generate next-week operational projection
app.post('/api/gemini/analyze-trends', async (req, res) => {
  try {
    const { weeklyTrends, context } = req.body;

    if (!weeklyTrends || !Array.isArray(weeklyTrends) || weeklyTrends.length === 0) {
      return res.status(400).json({ error: 'Se requiere el arreglo weeklyTrends con datos válidos.' });
    }

    if (!process.env.GEMINI_API_KEY) {
      return res.status(500).json({
        error: 'La variable de entorno GEMINI_API_KEY no está configurada en el servidor.',
      });
    }

    const systemInstruction = `Eres el Director de Finanzas y Operaciones de "Cancun Lighthouse Marina", marina turística corporativa de alto nivel en Cancún, Quintana Roo.
Tu responsabilidad es evaluar con rigor cuantitativo las tendencias semanales de operaciones (charters/tours), pasajeros atendidos (PAX), ingresos totales en pesos mexicanos (MXN), recaudación por muellaje y utilidad operativa neta.
Con base en los datos empíricos de las semanas analizadas, debes generar un resumen ejecutivo conciso y proyectar un pronóstico operativo realista y fundamentado para la siguiente semana (identificada consecutivamente respecto a la última semana registrada).
Mantén un enfoque estrictamente profesional, ejecutivo, accionable y prudente.
Todas las cifras monetarias deben expresarse en Pesos Mexicanos (MXN).`;

    const prompt = `Analiza las tendencias semanales históricas registradas en Cancun Lighthouse Marina:

Datos de Semanas (weeklyTrends):
${JSON.stringify(weeklyTrends, null, 2)}

Contexto de Métricas Acumuladas:
${context ? JSON.stringify(context, null, 2) : 'No disponible'}

Por favor, genera:
1. Resumen ejecutivo de la tendencia observada (crecimiento, volumen de pasajeros, comportamiento de margen).
2. Pronóstico específico para la siguiente semana: calcula ingresos totales estimados (MXN), utilidad operativa estimada (MXN), margen operativo estimado (%), PAX proyectados y operaciones proyectadas, indicando si la tendencia esperada es "crecimiento", "estable" o "precaucion", junto con la justificación lógica.
3. 3 a 5 observaciones clave sobre el comportamiento de indicadores clave.
4. Recomendaciones operativas accionables para la siguiente semana (embarcaciones, tripulaciones, muellaje, cobranza).
5. Alertas o riesgos que la administración debe monitorear.`;

    const schema = {
      type: Type.OBJECT,
      properties: {
        resumenEjecutivo: {
          type: Type.STRING,
          description: 'Resumen ejecutivo conciso del comportamiento financiero y operativo de las últimas semanas.',
        },
        pronosticoSiguienteSemana: {
          type: Type.OBJECT,
          description: 'Pronóstico y proyección operativa para la semana entrante.',
          properties: {
            semanaProyectada: {
              type: Type.STRING,
              description: 'Identificador de la siguiente semana calculada (ej. "Semana 31")',
            },
            ingresosEstimadosMXN: {
              type: Type.NUMBER,
              description: 'Ingresos totales proyectados en MXN',
            },
            utilidadEstimadaMXN: {
              type: Type.NUMBER,
              description: 'Utilidad operativa neta proyectada en MXN',
            },
            margenEstimado: {
              type: Type.NUMBER,
              description: 'Margen operativo proyectado en porcentaje (ej. 24.8)',
            },
            paxEstimados: {
              type: Type.INTEGER,
              description: 'Número de pasajeros (PAX) proyectados',
            },
            operacionesEstimadas: {
              type: Type.INTEGER,
              description: 'Número de salidas u operaciones proyectadas',
            },
            tendenciaEsperada: {
              type: Type.STRING,
              description: 'Dirección esperada: "crecimiento", "estable" o "precaucion"',
            },
            justificacion: {
              type: Type.STRING,
              description: 'Explicación cuantitativa y operacional de la proyección.',
            },
          },
          required: [
            'semanaProyectada',
            'ingresosEstimadosMXN',
            'utilidadEstimadaMXN',
            'margenEstimado',
            'paxEstimados',
            'operacionesEstimadas',
            'tendenciaEsperada',
            'justificacion',
          ],
        },
        tendenciasClave: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              indicador: { type: Type.STRING, description: 'KPI o concepto analizado' },
              comportamiento: { type: Type.STRING, description: 'Tendencia observada en las semanas' },
              impacto: { type: Type.STRING, description: '"positivo", "neutral" o "alerta"' },
            },
            required: ['indicador', 'comportamiento', 'impacto'],
          },
          description: 'Lista de 3 a 5 puntos clave sobre las tendencias recientes.',
        },
        recomendacionesOperativas: {
          type: Type.ARRAY,
          items: { type: Type.STRING },
          description: '3 a 4 recomendaciones prácticas para la siguiente semana.',
        },
        alertasRiesgo: {
          type: Type.ARRAY,
          items: { type: Type.STRING },
          description: 'Alertas o áreas prioritarias para control de riesgos.',
        },
      },
      required: [
        'resumenEjecutivo',
        'pronosticoSiguienteSemana',
        'tendenciasClave',
        'recomendacionesOperativas',
        'alertasRiesgo',
      ],
    };

    const data = await generateTrendsAnalysisWithGemini(prompt, systemInstruction, schema);
    return res.json(data);
  } catch (error: any) {
    console.error('Error al analizar tendencias con Gemini:', error);
    return res.status(500).json({
      error: error?.message || 'Error al procesar el análisis de tendencias con Gemini API.',
    });
  }
});

// Google Sheets Live Data Proxy endpoint: reads 100% of the live Google Sheet without CORS limitations
const LIVE_SHEET_TSV_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vRHr_YZ4y1-Ww6JKAerEWp1jCp07k3SZkiZcYx47A55PRA7dM-0DLzRMeJgplZbAwLDxswE2sVN9L-U/pub?gid=1624494179&single=true&output=tsv';

app.get('/api/sheet/live-data', async (_req, res) => {
  try {
    const response = await fetch(LIVE_SHEET_TSV_URL, {
      cache: 'no-store',
      headers: {
        'Accept': 'text/tab-separated-values, text/plain',
      },
    });

    if (!response.ok) {
      throw new Error(`Google Sheets respondió con estatus HTTP ${response.status}`);
    }

    const tsvData = await response.text();
    res.setHeader('Content-Type', 'text/tab-separated-values; charset=utf-8');
    return res.send(tsvData);
  } catch (err: any) {
    console.error('Error al descargar Google Sheet desde el servidor:', err);
    return res.status(500).json({
      error: err?.message || 'Error al descargar datos en vivo de Google Sheets',
    });
  }
});

// Setup Vite dev middleware or static production serve
async function setupServer() {
  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  } else {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(port, '0.0.0.0', () => {
    console.log(`Cancun Lighthouse Marina app running at http://0.0.0.0:${port}`);
  });
}

setupServer().catch((err) => {
  console.error('Error al inicializar el servidor:', err);
  process.exit(1);
});
