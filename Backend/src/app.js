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

// ─── Extrae IP real en entornos serverless/proxy ────────────────────────────
// En Netlify Functions req.ip puede ser undefined porque la petición llega
// a través de un proxy. Usamos x-nf-client-connection-ip (Netlify), luego
// x-forwarded-for, y como último recurso un fallback para no romper.
function getClientIp(req) {
  return (
    req.headers['x-nf-client-connection-ip'] ||
    req.headers['x-forwarded-for']?.split(',')[0]?.trim() ||
    req.ip ||
    req.socket?.remoteAddress ||
    '0.0.0.0'
  )
}

// ─── Seguridad: Rate limiting general ───────────────────────────────────────
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: getClientIp,
  validate: { ip: false, xForwardedForHeader: false },
  message: {
    success: false,
    error: 'Demasiadas peticiones desde esta IP. Intenta de nuevo en 15 minutos.',
  },
})

// ─── Seguridad: Rate limiting específico para login ─────────────────────────
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: getClientIp,
  validate: { ip: false, xForwardedForHeader: false },
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
