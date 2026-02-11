import * as fingerprintService from '../services/fingerprint.service.js'
import * as csharpService from '../services/csharp.service.js'
import { generateTemplate } from '../utils/fingerprintHelpers.js'
import * as response from '../utils/apiResponse.js'
import * as logger from '../utils/logger.js'


//  POST /api/fingerprint/enroll
//  Registra una huella para un usuario.
 
async function enroll(req, res, next) {
  try {
    const { userId } = req.body

    let template, quality, source

    try {
      // Intentar captura desde el servicio C#
      const capture = await csharpService.captureFingerprint()
      template = capture.template
      quality = capture.quality
      source = 'csharp'
      logger.info(`Huella capturada desde servicio C# para usuario ${userId}`)
    } catch {
      // Si C# no está disponible, generamos localmente
      template = generateTemplate()
      quality = 90
      source = 'local'
      logger.info(`Huella generada localmente para usuario ${userId} (C# no disponible)`)
    }

    // Guardar la huella en la BD
    const fingerprint = await fingerprintService.enrollFingerprint(userId, template)

    // IMPORTANTE: Devolvemos el template para que el frontend
    // lo guarde en localStorage (simula "este dispositivo tiene esta huella")
    return response.success(res, { fingerprint, template, quality, source }, 201)
  } catch (error) {
    next(error)
  }
}

// POST /api/fingerprint/login
// Autentica un usuario por su huella.
 
async function login(req, res, next) {
  try {
    const { template } = req.body

    const result = await fingerprintService.matchFingerprint(template)

    if (result.matched) {
      logger.info(`Login exitoso: ${result.user.nombre} (similitud: ${result.similarity.toFixed(1)}%)`)
      return response.success(res, {
        access: true,
        user: result.user,
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
