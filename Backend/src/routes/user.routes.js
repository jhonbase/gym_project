import { Router } from 'express'
import * as userController from '../controllers/user.controller.js'
import { validateRequest } from '../middlewares/validateRequest.js'
import { authenticate } from '../middlewares/authenticate.js'
import { createUserSchema } from '../validations/user.validation.js'
import upload from '../config/multer.js'

const router = Router()

router.post('/', upload.single('certificado'), validateRequest(createUserSchema), userController.createUser)

// GET /api/users → Listar todos los usuarios (PROTEGIDO)
router.get('/', authenticate, userController.getUsers)

// GET /api/users/:id → Obtener un usuario por ID (PROTEGIDO)
router.get('/:id', authenticate, userController.getUserById)

// PUT /api/users/:id → Actualizar usuario (PROTEGIDO)
router.put('/:id', authenticate, userController.updateUser)

// POST /api/users/:id/certificado → Subir certificado de EPS (PROTEGIDO)
router.post('/:id/certificado', authenticate, upload.single('certificado'), userController.uploadCertificado)

// GET /api/users/:id/certificado → Descargar certificado de EPS (PROTEGIDO)
router.get('/:id/certificado', authenticate, userController.downloadCertificado)

// DELETE /api/users/:id → Eliminar usuario (PROTEGIDO)
router.delete('/:id', authenticate, userController.deleteUser)

export default router
