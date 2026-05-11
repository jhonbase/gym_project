import { Router } from 'express'
import * as metricsController from '../controllers/metrics.controller.js'

const router = Router()

router.get('/:id/metricas', metricsController.getUserMetrics)

export default router
