import jwt from 'jsonwebtoken'
import * as fingerprintService from '../services/fingerprint.service.js'
import { generateTemplate } from '../utils/fingerprintHelpers.js'
import * as response from '../utils/apiResponse.js'
import * as logger from '../utils/logger.js'
import config from '../config/environment.js'

async function enroll(req, res, next) {
  try {
    const { userId, template } = req.body

    if (!template) {
      return response.error(res, 'El template es obligatorio.', 400)
    }

    logger.info(`Registrando huella para usuario ${userId}`)

    const fingerprint = await fingerprintService.enrollFingerprint(userId, template)

    return response.success(res, { fingerprint, template }, 201)
  } catch (error) {
    next(error)
  }
}

async function login(req, res, next) {
  try {
    const { template } = req.body

    const result = await fingerprintService.matchFingerprint(template)

    if (result.matched) {
      // ─── SEGURIDAD: Generamos un JWT con datos mínimos ──────────────────────
      // Solo incluimos id y nombre en el token — NO datos médicos ni sensibles.
      // El frontend usa este token en cada petición posterior vía Bearer header.
      // Sin JWT: cualquiera que sepa la URL puede leer datos de todos los usuarios.
      // ────────────────────────────────────────────────────────────────────────
      const token = jwt.sign(
        {
          sub:    result.user.id,
          nombre: result.user.nombre,
        },
        config.jwtSecret,
        { expiresIn: config.jwtExpiresIn }
      )

      logger.info(`Login exitoso: ${result.user.nombre} (similitud: ${result.similarity.toFixed(1)}%)`)
      return response.success(res, {
        access:     true,
        token,                        // JWT para peticiones futuras
        userId:     result.user.id,   // solo para que el frontend sepa el ID
        nombre:     result.user.nombre,
        similarity: result.similarity,
      })
    }

    logger.warn(`Login fallido: mejor similitud fue ${result.similarity.toFixed(1)}%`)
    return response.success(res, {
      access: false,
      similarity: result.similarity,
    })
  } catch (error) {
    next(error)
  }
}

export { enroll, login }
