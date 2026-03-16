import { Router } from 'express'
import * as userController from '../controllers/user.controller.js'
import { validateRequest } from '../middlewares/validateRequest.js'
import { authenticate } from '../middlewares/authenticate.js'
import { createUserSchema } from '../validations/user.validation.js'

const router = Router()

// POST /api/users → Crear usuario (público — es el registro)
router.post('/', validateRequest(createUserSchema), userController.createUser)

// GET /api/users → Listar todos los usuarios (PROTEGIDO)
// Sin authenticate: cualquiera puede ver datos médicos de todos los usuarios
router.get('/', authenticate, userController.getUsers)

// GET /api/users/:id → Obtener un usuario por ID (PROTEGIDO)
// Sin authenticate: cualquiera puede ver datos médicos de cualquier usuario con su ID
router.get('/:id', authenticate, userController.getUserById)

export default router
