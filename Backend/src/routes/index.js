import { Router } from 'express'
import userRoutes from './user.routes.js'
import fingerprintRoutes from './fingerprint.routes.js'
import assessmentRoutes from './assessment.routes.js'
import authRoutes from './auth.routes.js'

const router = Router()

router.use('/users', userRoutes)
router.use('/fingerprint', fingerprintRoutes)
router.use('/assessments', assessmentRoutes)
router.use('/auth', authRoutes)

export default router
