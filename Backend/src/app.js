import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import rateLimit from 'express-rate-limit'
import { ipKeyGenerator } from 'express-rate-limit'
import routes from './routes/index.js'
import errorHandler from './middlewares/errorHandler.js'
import notFound from './middlewares/notFound.js'
import config from './config/environment.js'
import path from 'path'
import fs from 'fs'

const app = express()

const uploadsDir = path.join(process.cwd(), 'uploads', 'certificados')
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true })
}

// ─── Trust proxy ────────────────────────────────────────────────────────────
app.set('trust proxy', 1)

// ─── Seguridad: headers HTTP ────────────────────────────────────────────────
app.use(helmet())

// ─── Seguridad: CORS restringido ────────────────────────────────────────────
app.use(cors({
  origin: config.allowedOrigin,
  credentials: true,
}))

// ─── Extrae IP real en entornos serverless/proxy ────────────────────────────
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
  keyGenerator: (req) => getClientIp(req) || ipKeyGenerator(req),
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
  keyGenerator: (req) => getClientIp(req) || ipKeyGenerator(req),
  message: {
    success: false,
    error: 'Demasiados intentos de inicio de sesión. Intenta de nuevo en 15 minutos.',
  },
})

app.use(generalLimiter)
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// Archivos estáticos para uploads
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')))

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
