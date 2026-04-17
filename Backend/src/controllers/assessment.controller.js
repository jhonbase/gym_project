import * as assessmentService from '../services/assessment.service.js'
import * as aiService from '../services/ai.service.js'
import * as response from '../utils/apiResponse.js'
import * as logger from '../utils/logger.js'
import * as pdfService from '../services/pdf.service.js'
import path from 'path'
import fs from 'fs'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

/**
 * POST /api/assessments
 * Crea una nueva valoración física e intenta generar análisis IA y plan de entrenamiento.
 */
async function createAssessment(req, res, next) {
  try {
    const assessment = await assessmentService.create({
      ...req.body,
      estadoValoracion: 'completada',
    })

    const analysis = await aiService.generateAssessmentAnalysis(assessment)
    const trainingPlan = await aiService.generateTrainingPlan(assessment)

    if (analysis || trainingPlan) {
      const updated = await assessmentService.updateAnalysisAndPlan(
        assessment.id,
        analysis,
        trainingPlan
      )
      logger.info(`Valoración ${updated.id} creada con análisis IA y plan de entrenamiento.`)
      return response.success(res, { assessment: updated }, 201)
    }

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
 * GET /api/assessments
 * Obtiene todas las valoraciones con datos del usuario.
 */
async function getAllAssessments(req, res, next) {
  try {
    const assessments = await assessmentService.getAll()
    return response.success(res, { assessments })
  } catch (error) {
    next(error)
  }
}

/**
 * POST /api/assessments/:id/analyze
 * Reintenta generar el análisis IA y plan de entrenamiento para una valoración.
 */
async function retryAnalysis(req, res, next) {
  try {
    const assessment = await assessmentService.getById(req.params.id)

    if (!assessment) {
      return response.error(res, 'Valoración no encontrada.', 404)
    }

    // Siempre regeneramos (el usuario puede elegir regenerar aunque ya tenga)
    logger.info(`Regenerando análisis y plan para valoración ${assessment.id}`)

    const analysis = await aiService.generateAssessmentAnalysis(assessment)
    const trainingPlan = await aiService.generateTrainingPlan(assessment)

    if (!analysis && !trainingPlan) {
      return response.error(
        res,
        'Servicio de IA no disponible. Intenta de nuevo cuando tengas conexión a internet.',
        503
      )
    }

    const updated = await assessmentService.updateAnalysisAndPlan(
      assessment.id,
      analysis,
      trainingPlan
    )
    logger.info(`Análisis y plan regenerados para valoración ${updated.id}.`)
    return response.success(res, { assessment: updated })
  } catch (error) {
    next(error)
  }
}

/**
 * GET /api/assessments/:id/pdf
 * Genera y devuelve el PDF de la valoración.
 * ?download=true → descarga. Sin query param → previsualiza inline.
 */
async function getAssessmentPdf(req, res, next) {
  try {
    const assessment = await assessmentService.getById(req.params.id)

    if (!assessment) {
      return response.error(res, 'Valoración no encontrada.', 404)
    }

    const disposition = req.query.download === 'true' ? 'attachment' : 'inline'

    res.setHeader('Content-Type', 'application/pdf')
    res.setHeader(
      'Content-Disposition',
      `${disposition}; filename="valoracion-${assessment.id}.pdf"`
    )

    pdfService.generateAssessmentPdf(assessment, res)
  } catch (error) {
    next(error)
  }
}

/**
 * POST /api/assessments/:id/lesion
 * Sube evidencia de lesión (imagen o PDF)
 */
async function uploadLesion(req, res, next) {
  try {
    if (!req.file) {
      return response.error(res, 'No se ha proporcionado ningún archivo.', 400)
    }

    const filePath = `/uploads/lesiones/${req.file.filename}`
    const descripcion = req.body.descripcion || null

    const assessment = await assessmentService.updateLesion(req.params.id, {
      lesionEvidencia: filePath,
      lesionDescripcion: descripcion,
    })

    if (!assessment) {
      return response.error(res, 'Valoración no encontrada.', 404)
    }

    return response.success(res, { 
      assessment,
      lesionUrl: filePath 
    })
  } catch (error) {
    next(error)
  }
}

/**
 * GET /api/assessments/:id/lesion
 * Descarga la evidencia de lesión
 */
async function getLesion(req, res, next) {
  try {
    const assessment = await assessmentService.getById(req.params.id)

    if (!assessment) {
      return response.error(res, 'Valoración no encontrada.', 404)
    }

    if (!assessment.lesionEvidencia) {
      return response.error(res, 'No hay evidencia de lesión.', 404)
    }

    const absolutePath = path.join(process.cwd(), assessment.lesionEvidencia)

    if (!fs.existsSync(absolutePath)) {
      return response.error(res, 'El archivo no existe.', 404)
    }

    const ext = path.extname(absolutePath).toLowerCase()
    const contentType = ext === '.pdf' ? 'application/pdf' : 'image/jpeg'

    res.setHeader('Content-Type', contentType)
    res.setHeader('Content-Disposition', 'inline')
    res.sendFile(absolutePath)
  } catch (error) {
    next(error)
  }
}

/**
 * PUT /api/assessments/:id
 * Actualiza una valoración completa.
 */
async function updateAssessment(req, res, next) {
  try {
    const data = req.body
    
    if (data.lesionDescripcion !== undefined && data.lesionDescripcion === '') {
      data.lesionDescripcion = null
    }
    
    if (data.lesionEvidencia !== undefined && data.lesionEvidencia === null) {
      data.lesionEvidencia = null
    }
    
    const assessment = await assessmentService.update(req.params.id, data)

    if (!assessment) {
      return response.error(res, 'Valoración no encontrada.', 404)
    }

    return response.success(res, { assessment })
  } catch (error) {
    next(error)
  }
}

/**
 * DELETE /api/assessments/:id
 * Elimina una valoración.
 */
async function deleteAssessment(req, res, next) {
  try {
    const { id } = req.params
    
    const assessment = await assessmentService.getById(id)
    if (!assessment) {
      return response.error(res, 'Valoración no encontrada.', 404)
    }
    
    await assessmentService.deleteAssessment(id)
    
    return response.success(res, { message: 'Valoración eliminada correctamente.' })
  } catch (error) {
    next(error)
  }
}

/**
 * PUT /api/assessments/:id/training-plan
 * Actualiza el plan de entrenamiento de una valoración (edición manual).
 */
async function updateTrainingPlan(req, res, next) {
  try {
    const { planEntrenamiento } = req.body

    if (!planEntrenamiento) {
      return response.error(res, 'El plan de entrenamiento es requerido.', 400)
    }

    const assessment = await assessmentService.updatePlanEntrenamiento(req.params.id, planEntrenamiento)

    if (!assessment) {
      return response.error(res, 'Valoración no encontrada.', 404)
    }

    return response.success(res, { assessment })
  } catch (error) {
    next(error)
  }
}


export { createAssessment, getAssessment, getByUser, getAllAssessments, retryAnalysis, getAssessmentPdf, uploadLesion, getLesion, updateAssessment, deleteAssessment, updateTrainingPlan }