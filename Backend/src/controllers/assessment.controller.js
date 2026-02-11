import * as assessmentService from '../services/assessment.service.js'
import * as aiService from '../services/ai.service.js'
import * as response from '../utils/apiResponse.js'
import * as logger from '../utils/logger.js'

/**
 * POST /api/assessments
 * Crea una nueva valoración física y intenta generar análisis IA.
 */
async function createAssessment(req, res, next) {
  try {
    // Guardar en BD con estado "completada"
    const assessment = await assessmentService.create({
      ...req.body,
      estadoValoracion: 'completada',
    })

    // Intentar generar análisis con IA (devuelve null si no hay internet/key)
    const analysis = await aiService.generateAssessmentAnalysis(assessment)

    if (analysis) {
      // Si la IA respondió → actualizar con el análisis
      const updated = await assessmentService.updateAnalysis(assessment.id, analysis)
      logger.info(`Valoración ${updated.id} creada con análisis IA.`)
      return response.success(res, { assessment: updated }, 201)
    }

    // Si la IA no está disponible → devolver sin análisis
    logger.info(`Valoración ${assessment.id} creada sin análisis IA (IA no disponible).`)
    return response.success(res, { assessment, aiStatus: 'pending' }, 201)
  } catch (error) {
    next(error)
  }
}

/**
 * GET /api/assessments/:id
 * Obtiene una valoración por su ID.
 */
async function getAssessment(req, res, next) {
  try {
    const assessment = await assessmentService.getById(req.params.id)

    if (!assessment) {
      return response.error(res, 'Valoración no encontrada.', 404)
    }

    return response.success(res, { assessment })
  } catch (error) {
    next(error)
  }
}

/**
 * GET /api/assessments/user/:userId
 * Obtiene todas las valoraciones de un usuario.
 */
async function getByUser(req, res, next) {
  try {
    const assessments = await assessmentService.getByUserId(req.params.userId)
    return response.success(res, { assessments })
  } catch (error) {
    next(error)
  }
}

/**
 * POST /api/assessments/:id/analyze
 * Reintenta generar el análisis IA para una valoración
 * que se guardó sin análisis (porque no había internet).
 */
async function retryAnalysis(req, res, next) {
  try {
    const assessment = await assessmentService.getById(req.params.id)

    if (!assessment) {
      return response.error(res, 'Valoración no encontrada.', 404)
    }

    // Si ya tiene análisis, no lo regeneramos
    if (assessment.analisisIA) {
      return response.success(res, {
        assessment,
        message: 'Esta valoración ya tiene análisis generado.',
      })
    }

    // Intentar generar análisis
    const analysis = await aiService.generateAssessmentAnalysis(assessment)

    if (!analysis) {
      return response.error(
        res,
        'Servicio de IA no disponible. Intenta de nuevo cuando tengas conexión a internet.',
        503
      )
    }

    const updated = await assessmentService.updateAnalysis(assessment.id, analysis)
    logger.info(`Análisis IA generado para valoración ${updated.id}.`)
    return response.success(res, { assessment: updated })
  } catch (error) {
    next(error)
  }
}

export { createAssessment, getAssessment, getByUser, retryAnalysis }
