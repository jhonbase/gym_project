import { Router } from 'express'
import * as assessmentController from '../controllers/assessment.controller.js'
import { validateRequest } from '../middlewares/validateRequest.js'
import { createAssessmentSchema } from '../validations/assessment.validation.js'

const router = Router()

// POST /api/assessments → Crear valoración + intentar análisis IA
router.post('/', validateRequest(createAssessmentSchema), assessmentController.createAssessment)

// GET /api/assessments/user/:userId -> Todas las valoraciones de un usuario
router.get('/user/:userId', assessmentController.getByUser)

// GET /api/assessments/:id/pdf -> Genera pdf de la valoración
router.get('/:id/pdf', assessmentController.getAssessmentPdf)

// GET /api/assessments/:id -> Obtener una valoración específica
router.get('/:id', assessmentController.getAssessment)

// POST /api/assessments/:id/analyze -> Reintentar análisis IA
router.post('/:id/analyze', assessmentController.retryAnalysis)

export default router