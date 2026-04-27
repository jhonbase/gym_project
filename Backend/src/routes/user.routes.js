import { Router } from 'express'
import * as userController from '../controllers/user.controller.js'
import { validateRequest } from '../middlewares/validateRequest.js'
import { authenticate } from '../middlewares/authenticate.js'
import { authorize } from '../middlewares/authorize.js'
import { createUserSchema } from '../validations/user.validation.js'
import upload from '../config/multer.js'

const router = Router()

// Rutas públicas
router.post('/', upload.single('certificado'), validateRequest(createUserSchema), userController.createUser)

// Rutas protegidas - Solo entrenador/admin pueden acceder
const protectRoutes = (req, res, next) => {
  authenticate(req, res, next)
}

router.get('/', protectRoutes, authorize('entrenador', 'admin'), userController.getUsers)
router.get('/:id', protectRoutes, authorize('entrenador', 'admin'), userController.getUserById)
router.put('/:id', protectRoutes, authorize('entrenador', 'admin'), userController.updateUser)
router.post('/:id/certificado', protectRoutes, authorize('entrenador', 'admin'), upload.single('certificado'), userController.uploadCertificado)
router.get('/:id/certificado', protectRoutes, authorize('entrenador', 'admin'), userController.downloadCertificado)
router.delete('/:id', protectRoutes, authorize('entrenador', 'admin'), userController.deleteUser)

export default router
