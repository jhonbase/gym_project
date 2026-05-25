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
 * Limpia la respuesta de la IA eliminando markdown y texto innecesario.
 */
function cleanAIResponse(text) {
  if (!text || typeof text !== 'string') return ''
  return text
    .replace(/```json\s*/g, '')
    .replace(/```\s*$/g, '')
    .replace(/```/g, '')
    .trim()
}

/**
 * Valida que el JSON del plan tenga la estructura mínima requerida.
 */
function validateTrainingPlanJSON(obj) {
  if (!obj || typeof obj !== 'object') return false
  if (!obj.objetivo || typeof obj.objetivo !== 'string') return false
  if (!obj.nivel || typeof obj.nivel !== 'string') return false
  if (!obj.frecuencia || typeof obj.frecuencia !== 'string') return false
  if (!obj.dias || !Array.isArray(obj.dias) || obj.dias.length === 0) return false
  return true
}

/**
 * POST /api/assessments
 * Crea una nueva valoración física e intenta generar análisis IA y plan de entrenamiento.
 */
async function createAssessment(req, res, next) {
  try {
    const assessment = await assessmentService.create({
      ...req.body,
      estadoValoracion: 'completada',
      aiStatus: 'PENDING',
    })

    let analysis = null
    let trainingPlan = null

    try {
      analysis = await aiService.generateAssessmentAnalysis(assessment)
    } catch (e) {
      logger.error(`Error generando análisis IA: ${e.message}`)
    }

    try {
      trainingPlan = await aiService.generateTrainingPlan(assessment)
    } catch (e) {
      logger.error(`Error generando plan IA: ${e.message}`)
    }

    const hasAnalysis = analysis !== null
    const hasTrainingPlan = trainingPlan !== null

    let aiStatus
    if (hasAnalysis && hasTrainingPlan) aiStatus = 'COMPLETED'
    else if (hasAnalysis || hasTrainingPlan) aiStatus = 'PARTIAL'
    else aiStatus = 'FAILED'

    const updated = await assessmentService.update(assessment.id, {
      analisisIA: analysis,
      planEntrenamiento: trainingPlan ? JSON.stringify(trainingPlan) : null,
      aiStatus,
      estadoValoracion: aiStatus === 'FAILED' ? 'completada' : 'analizada',
    })

    logger.info(`Valoración ${updated.id} creada con aiStatus: ${aiStatus}`)
    return response.success(res, { assessment: updated }, 201)
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

    logger.info(`Regenerando análisis y plan para valoración ${assessment.id}`)

    let analysis = null
    let trainingPlan = null

    try {
      analysis = await aiService.generateAssessmentAnalysis(assessment)
    } catch (e) {
      logger.error(`Error generando análisis IA: ${e.message}`)
    }

    try {
      trainingPlan = await aiService.generateTrainingPlan(assessment)
    } catch (e) {
      logger.error(`Error generando plan IA: ${e.message}`)
    }

    const hasAnalysis = analysis !== null
    const hasTrainingPlan = trainingPlan !== null

    let aiStatus
    if (hasAnalysis && hasTrainingPlan) aiStatus = 'COMPLETED'
    else if (hasAnalysis || hasTrainingPlan) aiStatus = 'PARTIAL'
    else aiStatus = 'FAILED'

    const updated = await assessmentService.update(assessment.id, {
      analisisIA: analysis,
      planEntrenamiento: trainingPlan ? JSON.stringify(trainingPlan) : null,
      aiStatus,
      estadoValoracion: aiStatus === 'FAILED' ? 'completada' : 'analizada',
    })

    logger.info(`Análisis regenerado para valoración ${updated.id}, aiStatus: ${aiStatus}`)
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
 * Sube evidencia de lesión (imagen o PDF) y la AGREGA al array existente
 */
async function uploadLesion(req, res, next) {
  try {
    if (!req.file) {
      return response.error(res, 'No se ha proporcionado ningún archivo.', 400)
    }

    const filePath = `/uploads/lesiones/${req.file.filename}`
    const descripcion = req.body.descripcion || null

    const assessment = await assessmentService.getById(req.params.id)

    if (!assessment) {
      return response.error(res, 'Valoración no encontrada.', 404)
    }

    const lesionesActuales = assessment.lesionesEvidencia || []
    const nuevasLesiones = [...lesionesActuales, filePath]

    const updated = await assessmentService.updateLesion(req.params.id, {
      lesionesEvidencia: nuevasLesiones,
      lesionDescripcion: descripcion || assessment.lesionDescripcion,
    })

    return response.success(res, { 
      assessment: updated,
      lesionUrl: filePath,
      totalLesiones: nuevasLesiones.length
    })
  } catch (error) {
    next(error)
  }
}

/**
 * GET /api/assessments/:id/lesion
 * Lista todas las evidencias de lesión
 */
async function getLesion(req, res, next) {
  try {
    const assessment = await assessmentService.getById(req.params.id)

    if (!assessment) {
      return response.error(res, 'Valoración no encontrada.', 404)
    }

    if (!assessment.lesionesEvidencia || assessment.lesionesEvidencia.length === 0) {
      return response.error(res, 'No hay evidencias de lesión.', 404)
    }

    return response.success(res, { 
      lesiones: assessment.lesionesEvidencia,
      descripcion: assessment.lesionDescripcion
    })
  } catch (error) {
    next(error)
  }
}

/**
 * DELETE /api/assessments/:id/lesion/:filename
 * Elimina un archivo específico del array de lesiones
 */
async function deleteLesionFile(req, res, next) {
  try {
    const { id, filename } = req.params
    
    const assessment = await assessmentService.getById(id)

    if (!assessment) {
      return response.error(res, 'Valoración no encontrada.', 404)
    }

    const lesionesActuales = assessment.lesionesEvidencia || []
    const filePath = `/uploads/lesiones/${filename}`
    const nuevasLesiones = lesionesActuales.filter(l => l !== filePath)

    const updated = await assessmentService.updateLesion(id, {
      lesionesEvidencia: nuevasLesiones,
    })

    return response.success(res, { 
      assessment: updated,
      deletedFile: filePath
    })
  } catch (error) {
    next(error)
  }
}

/**
 * POST /api/assessments/:id/historial
 * Sube el historial clínico (único archivo)
 */
async function uploadHistorial(req, res, next) {
  try {
    if (!req.file) {
      return response.error(res, 'No se ha proporcionado ningún archivo.', 400)
    }

    const filePath = `/uploads/historial/${req.file.filename}`

    const assessment = await assessmentService.updateHistorial(req.params.id, {
      historialClinico: filePath,
    })

    if (!assessment) {
      return response.error(res, 'Valoración no encontrada.', 404)
    }

    return response.success(res, { 
      assessment,
      historialUrl: filePath
    })
  } catch (error) {
    next(error)
  }
}

/**
 * GET /api/assessments/:id/historial
 * Descarga el historial clínico
 */
async function getHistorial(req, res, next) {
  try {
    const assessment = await assessmentService.getById(req.params.id)

    if (!assessment) {
      return response.error(res, 'Valoración no encontrada.', 404)
    }

    if (!assessment.historialClinico) {
      return response.error(res, 'No hay historial clínico.', 404)
    }

    const absolutePath = path.join(process.cwd(), assessment.historialClinico)

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

// NEW: Delete historial clínico
async function deleteHistorial(req, res, next) {
  try {
    const { id } = req.params
    const assessment = await assessmentService.getById(id)

    if (!assessment) {
      return response.error(res, 'Valoración no encontrada.', 404)
    }

    if (!assessment.historialClinico) {
      return response.error(res, 'No hay historial clínico para eliminar.', 404)
    }

    const absolutePath = path.join(process.cwd(), assessment.historialClinico)

    // Remove file from disk if it exists
    if (fs.existsSync(absolutePath)) {
      try {
        fs.unlinkSync(absolutePath)
      } catch (e) {
        // Log but continue; file may already be missing
        logger.error(`Error deleting historial file: ${e.message}`)
      }
    }

    // Update DB to null
    const updated = await assessmentService.updateHistorial(id, { historialClinico: null })

    return response.success(res, { assessment: updated, message: 'Historial clínico eliminado' })
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

async function getMyTrainingPlan(req, res, next) {
  try {
    const userId = req.user.sub
    
    const assessments = await assessmentService.getByUserId(userId)
    
    if (!assessments || assessments.length === 0) {
      return response.error(res, 'No tienes valoraciones yet. Contacta a tu trainer.', 404)
    }

    const latestAssessment = assessments.sort((a, b) => 
      new Date(b.createdAt) - new Date(a.createdAt)
    )[0]

    const aiStatus = latestAssessment.aiStatus || 'PENDING'

    if (aiStatus === 'PENDING' || aiStatus === 'FAILED') {
      return response.success(res, {
        aiStatus,
        message: aiStatus === 'PENDING' 
          ? 'Tu plan aún se está generando. Esto puede tardar unos minutos.'
          : 'Hubo un problema generando tu plan. El entrenador puede regenerarlo.',
        planEntrenamiento: null,
        rawPlan: null,
        valoracionFecha: latestAssessment.createdAt,
        objetivo: latestAssessment.objetivoUsuario,
      })
    }

    if (!latestAssessment.planEntrenamiento) {
      return response.error(res, 'Tu plan de entrenamiento aún no está disponible.', 404)
    }

    let planObj = null
    let rawPlan = null

    try {
      planObj = JSON.parse(latestAssessment.planEntrenamiento)
      if (!validateTrainingPlanJSON(planObj)) {
        logger.warn(`Plan parseado pero sin estructura válida - guardando como raw`)
        rawPlan = latestAssessment.planEntrenamiento
        planObj = null
      }
    } catch (e) {
      logger.warn(`Error parseando planEntrenamiento: ${e.message}`)
      rawPlan = latestAssessment.planEntrenamiento
      planObj = null
    }

    const message = aiStatus === 'PARTIAL' 
      ? 'Tu plan está incompleto. El entrenador puede completar la generación.'
      : null

    return response.success(res, { 
      aiStatus,
      planEntrenamiento: planObj,
      rawPlan,
      message,
      valoracionFecha: latestAssessment.createdAt,
      objetivo: latestAssessment.objetivoUsuario
    })
  } catch (error) {
    next(error)
  }
}

/**
 * GET /api/assessments/my/assessments
 * Obtiene el historial de valoraciones del usuario autenticado.
 */
async function getMyAssessments(req, res, next) {
  try {
    const userId = req.user.sub
    const assessments = await assessmentService.getByUserId(userId)
    
    const history = assessments
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .map(a => ({
        id: a.id,
        createdAt: a.createdAt,
        objetivoUsuario: a.objetivoUsuario,
        aiStatus: a.aiStatus,
        peso: a.peso,
        masaMuscular: a.masaMuscular,
        grasaCorporal: a.grasaCorporal,
        imc: a.imc,
      }))

    return response.success(res, { assessments: history })
  } catch (error) {
    next(error)
  }
}

/**
 * GET /api/assessments/user/:userId/progress
 * Obtiene datos de progreso para un usuario en formato específico para el frontend.
 */
async function getProgress(req, res, next) {
  try {
    // Authorization logic: estudiantes pueden ver solo su propio progreso
    // entrenadores y admin pueden ver el progreso de cualquier usuario
    if (req.user && req.user.rol === 'usuario') {
      // Estudiantes pueden acceder solo a su propio progreso
      if (req.params.userId !== req.user.sub) {
        return response.error(res, 'No autorizado', 403)
      }
    }
    // Para roles 'entrenador' y 'admin', se permite acceso a cualquier userId
    
    const progressData = await assessmentService.getProgress(req.params.userId)
    return response.success(res, progressData)
  } catch (error) {
    next(error)
  }
}

export { createAssessment, getAssessment, getByUser, getAllAssessments, retryAnalysis, getAssessmentPdf, uploadLesion, getLesion, deleteLesionFile, uploadHistorial, getHistorial, deleteHistorial, updateAssessment, deleteAssessment, updateTrainingPlan, getMyTrainingPlan, getMyAssessments, getProgress }