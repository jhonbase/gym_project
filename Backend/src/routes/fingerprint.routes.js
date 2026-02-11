import { Router } from 'express'
import * as fpController from '../controllers/fingerprint.controller.js'
import { validateRequest } from '../middlewares/validateRequest.js'
import { enrollSchema, loginSchema } from '../validations/fingerprint.validation.js'

const router = Router()

// POST /api/fingerprint/enroll → Registrar huella de un usuario
router.post('/enroll', validateRequest(enrollSchema), fpController.enroll)

// POST /api/fingerprint/login → Autenticar por huella (solo template, sin userId)
router.post('/login', validateRequest(loginSchema), fpController.login)

export default router
