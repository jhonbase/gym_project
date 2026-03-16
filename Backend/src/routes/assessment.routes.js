import { Router } from 'express'
import * as assessmentController from '../controllers/assessment.controller.js'
import { validateRequest } from '../middlewares/validateRequest.js'
import { authenticate } from '../middlewares/authenticate.js'
import { createAssessmentSchema } from '../validations/assessment.validation.js'

const router = Router()

// Todas las rutas de valoraciones requieren autenticación.
// Sin authenticate: cualquiera puede crear, leer o descargar PDF de cualquier valoración
// y consumir créditos de la API de IA sin autorización.

// POST /api/assessments → Crear valoración + intentar análisis IA
router.post('/', authenticate, validateRequest(createAssessmentSchema), assessmentController.createAssessment)

// GET /api/assessments/user/:userId → Todas las valoraciones de un usuario
router.get('/user/:userId', authenticate, assessmentController.getByUser)

// GET /api/assessments/:id/pdf → Genera PDF de la valoración
router.get('/:id/pdf', authenticate, assessmentController.getAssessmentPdf)

// GET /api/assessments/:id → Obtener una valoración específica
router.get('/:id', authenticate, assessmentController.getAssessment)

// POST /api/assessments/:id/analyze → Reintentar análisis IA
router.post('/:id/analyze', authenticate, assessmentController.retryAnalysis)

export default router
