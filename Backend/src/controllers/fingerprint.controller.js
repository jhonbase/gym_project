import * as fingerprintService from '../services/fingerprint.service.js'
import { generateTemplate } from '../utils/fingerprintHelpers.js'
import * as response from '../utils/apiResponse.js'
import * as logger from '../utils/logger.js'

async function enroll(req, res, next) {
  try {
    const { userId } = req.body

    const template = generateTemplate()
    const quality = 90
    logger.info(`Huella generada localmente para usuario ${userId}`)

    const fingerprint = await fingerprintService.enrollFingerprint(userId, template)

    return response.success(res, { fingerprint, template, quality, source: 'local' }, 201)
  } catch (error) {
    next(error)
  }
}

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