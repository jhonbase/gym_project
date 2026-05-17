/**
 * authenticate.js
 * ───────────────────────────────────────────────────────────────
 * Middleware que protege rutas privadas verificando el JWT.
 *
 * ¿Cómo funciona?
 *   1. Lee el header: Authorization: Bearer <token>
 *   2. Verifica la firma del token con JWT_SECRET
 *   3. Si es válido → agrega req.userId y deja pasar
 *   4. Si es inválido/ausente → responde 401 Unauthorized
 *
 * Vulnerabilidad mitigada: Broken Access Control (OWASP A01:2021)
 * Sin este middleware, cualquier persona puede acceder a datos
 * médicos de todos los usuarios sin ninguna credencial.
 */
import jwt from 'jsonwebtoken'
import config from '../config/environment.js'

export function authenticate(req, res, next) {
  const authHeader = req.headers['authorization']

  // El header debe tener el formato: "Bearer <token>"
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      success: false,
      error: 'Acceso no autorizado. Se requiere autenticación.',
    })
  }

  const token = authHeader.split(' ')[1]

  try {
    const payload = jwt.verify(token, config.jwtSecret)
    req.userId = payload.sub
    req.user = { sub: payload.sub, nombre: payload.nombre, rol: payload.rol }
    next()
  } catch {
    return res.status(401).json({
      success: false,
      error: 'Token inválido o expirado. Inicia sesión nuevamente.',
    })
  }
}
