import { Router } from 'express'
import { login, solicitarActivacion, activarCuenta } from '../controllers/auth.controller.js'

const router = Router()

router.post('/login', login)
router.post('/solicitar-activacion', solicitarActivacion)
router.post('/activar-cuenta', activarCuenta)

export default router