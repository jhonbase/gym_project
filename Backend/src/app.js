import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import rateLimit from 'express-rate-limit'
import routes from './routes/index.js'
import errorHandler from './middlewares/errorHandler.js'
import notFound from './middlewares/notFound.js'
import config from './config/environment.js'

const app = express()

// ─── Trust proxy ────────────────────────────────────────────────────────────
// Necesario en entornos serverless/cloud (Netlify, Railway, etc.) donde las
// peticiones pasan por un proxy/load balancer. Sin esto, express-rate-limit
// lanza ERR_ERL_UNDEFINED_IP_ADDRESS porque req.ip viene undefined.
app.set('trust proxy', 1)

// ─── Seguridad: headers HTTP ────────────────────────────────────────────────
// helmet() activa 14 headers de seguridad automáticamente:
// - X-Frame-Options: DENY → evita Clickjacking (iframe malicioso)
// - X-Content-Type-Options: nosniff → evita MIME sniffing / XSS via tipo de contenido
// - Content-Security-Policy → evita inyección de scripts externos
// - Strict-Transport-Security → fuerza HTTPS en producción
// - Referrer-Policy → evita fuga de URLs internas a terceros
// Sin helmet: el navegador no tiene instrucciones de seguridad, vulnerable a múltiples ataques.
app.use(helmet())

// ─── Seguridad: CORS restringido ────────────────────────────────────────────
// cors() sin opciones permite CUALQUIER origen del mundo → riesgo de CSRF.
// Con origin específico: solo el frontend autorizado puede hacer peticiones.
app.use(cors({
  origin: config.allowedOrigin,
  credentials: true,
}))

// ─── Seguridad: Rate limiting general ───────────────────────────────────────
// Limita las peticiones por IP para prevenir abuso de la API en general.
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: 'Demasiadas peticiones desde esta IP. Intenta de nuevo en 15 minutos.',
  },
})

// ─── Seguridad: Rate limiting específico para login ─────────────────────────
// Sin límite: un atacante puede enviar miles de templates por segundo buscando
// una coincidencia con las huellas almacenadas (fuerza bruta biométrica).
// Con límite: 10 intentos por IP cada 15 minutos → ataque automatizado bloqueado.
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: 'Demasiados intentos de inicio de sesión. Intenta de nuevo en 15 minutos.',
  },
})

app.use(generalLimiter)
app.use(express.json())

// ─── Rutas ──────────────────────────────────────────────────────────────────
// En local: peticiones llegan como /api/users, /api/fingerprint/login, etc.
// En Netlify serverless: el redirect strips /api, llegan como /users, /fingerprint/login, etc.
// Montamos en ambos prefijos para que funcione en los dos entornos sin cambios.
app.use('/api/fingerprint/login', loginLimiter)
app.use('/fingerprint/login', loginLimiter)

app.use('/api', routes)   // local dev
app.use('/', routes)      // Netlify serverless

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

// ─── Manejo de errores ──────────────────────────────────────────────────────
// IMPORTANTE: estos van DESPUÉS de las rutas.
app.use(notFound)
app.use(errorHandler)

export default app
