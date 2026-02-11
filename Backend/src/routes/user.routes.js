import { Router } from 'express'
import * as userController from '../controllers/user.controller.js'
import { validateRequest } from '../middlewares/validateRequest.js'
import { createUserSchema } from '../validations/user.validation.js'

const router = Router()

// POST /api/users → Crear usuario (con validación Zod)
router.post('/', validateRequest(createUserSchema), userController.createUser)

// GET /api/users → Listar todos los usuarios
router.get('/', userController.getUsers)

// GET /api/users/:id → Obtener un usuario por ID
router.get('/:id', userController.getUserById)

export default router
