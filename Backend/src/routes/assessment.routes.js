import { Router } from 'express'
import * as assessmentController from '../controllers/assessment.controller.js'
import { validateRequest } from '../middlewares/validateRequest.js'
import { authenticate } from '../middlewares/authenticate.js'
import { createAssessmentSchema, updateAssessmentSchema } from '../validations/assessment.validation.js'
import uploadLesion from '../config/multer.lesion.js'

const router = Router()

// POST /api/assessments → Crear valoración + intentar análisis IA
router.post('/', authenticate, validateRequest(createAssessmentSchema), assessmentController.createAssessment)

// GET /api/assessments/user/:userId → Todas las valoraciones de un usuario
router.get('/user/:userId', authenticate, assessmentController.getByUser)

// GET /api/assessments/:id/pdf → Genera PDF de la valoración
router.get('/:id/pdf', authenticate, assessmentController.getAssessmentPdf)

// GET /api/assessments/:id → Obtener una valoración específica
router.get('/:id', authenticate, assessmentController.getAssessment)

// PUT /api/assessments/:id → Actualizar valoración
router.put('/:id', authenticate, validateRequest(updateAssessmentSchema), assessmentController.updateAssessment)

// POST /api/assessments/:id/analyze → Reintentar análisis IA
router.post('/:id/analyze', authenticate, assessmentController.retryAnalysis)

// POST /api/assessments/:id/lesion → Subir evidencia de lesión
router.post('/:id/lesion', authenticate, uploadLesion.single('evidencia'), assessmentController.uploadLesion)

// GET /api/assessments/:id/lesion → Descargar evidencia de lesión
router.get('/:id/lesion', authenticate, assessmentController.getLesion)

// DELETE /api/assessments/:id → Eliminar valoración
router.delete('/:id', authenticate, assessmentController.deleteAssessment)

// PUT /api/assessments/:id/training-plan → Actualizar plan de entrenamiento (edición manual)
router.put('/:id/training-plan', authenticate, assessmentController.updateTrainingPlan)

export default router
