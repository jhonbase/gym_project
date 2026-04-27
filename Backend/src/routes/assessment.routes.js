import { Router } from 'express'
import * as assessmentController from '../controllers/assessment.controller.js'
import { validateRequest } from '../middlewares/validateRequest.js'
import { authenticate } from '../middlewares/authenticate.js'
import { authorize } from '../middlewares/authorize.js'
import { createAssessmentSchema, updateAssessmentSchema } from '../validations/assessment.validation.js'
import uploadLesion from '../config/multer.lesion.js'
import uploadHistorial from '../config/multer.historial.js'

const router = Router()

const protectRoutes = (req, res, next) => {
  authenticate(req, res, next)
}

router.get('/', protectRoutes, authorize('entrenador', 'admin'), assessmentController.getAllAssessments)
router.post('/', protectRoutes, authorize('entrenador', 'admin'), validateRequest(createAssessmentSchema), assessmentController.createAssessment)
router.get('/user/:userId', protectRoutes, authorize('entrenador', 'admin'), assessmentController.getByUser)
router.get('/:id/pdf', protectRoutes, authorize('entrenador', 'admin'), assessmentController.getAssessmentPdf)
router.get('/:id', protectRoutes, authorize('entrenador', 'admin'), assessmentController.getAssessment)
router.put('/:id', protectRoutes, authorize('entrenador', 'admin'), validateRequest(updateAssessmentSchema), assessmentController.updateAssessment)
router.post('/:id/analyze', protectRoutes, authorize('entrenador', 'admin'), assessmentController.retryAnalysis)
router.post('/:id/lesion', protectRoutes, authorize('entrenador', 'admin'), uploadLesion.single('evidencia'), assessmentController.uploadLesion)
router.delete('/:id/lesion/:filename', protectRoutes, authorize('entrenador', 'admin'), assessmentController.deleteLesionFile)
router.get('/:id/lesion', protectRoutes, authorize('entrenador', 'admin'), assessmentController.getLesion)
router.post('/:id/historial', protectRoutes, authorize('entrenador', 'admin'), uploadHistorial.single('archivo'), assessmentController.uploadHistorial)
router.get('/:id/historial', protectRoutes, authorize('entrenador', 'admin'), assessmentController.getHistorial)
router.delete('/:id', protectRoutes, authorize('entrenador', 'admin'), assessmentController.deleteAssessment)
router.put('/:id/training-plan', protectRoutes, authorize('entrenador', 'admin'), assessmentController.updateTrainingPlan)

export default router
