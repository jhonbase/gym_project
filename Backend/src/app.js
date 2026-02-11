import express from 'express'
import cors from 'cors'
import routes from './routes/index.js'
import errorHandler from './middlewares/errorHandler.js'
import notFound from './middlewares/notFound.js'

const app = express()

// ---- Middleware ----
// cors() permite que el frontend (puerto 5173) hable con el backend (puerto 3000)
app.use(cors())
// express.json() parsea el body de las peticiones que vienen en formato JSON
app.use(express.json())

// ---- Rutas ----
// Todas las rutas de la API viven bajo /api
app.use('/api', routes)

// Health check: para verificar rápidamente que el backend está corriendo
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

// ---- Manejo de errores ----
// IMPORTANTE: estos van DESPUÉS de las rutas.
// notFound atrapa rutas que no existen (404)
// errorHandler atrapa errores que ocurran en las rutas (500, etc.)
app.use(notFound)
app.use(errorHandler)

export default app
