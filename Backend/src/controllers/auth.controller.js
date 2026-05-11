import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import * as userService from '../services/user.service.js'
import { enviarCorreoActivacion } from '../services/email.service.js'
import * as response from '../utils/apiResponse.js'
import config from '../config/environment.js'

/**
 * POST /api/auth/login
 * Login con email y password (para entrenadores)
 */
export async function login(req, res, next) {
  try {
    const { email, password } = req.body

    if (!email || !password) {
      return response.error(res, 'Email y password son requeridos.', 400)
    }

    const user = await userService.getUserByEmail(email)

    if (!user) {
      return response.error(res, 'Credenciales inválidas.', 401)
    }

    if (!user.password) {
      return response.error(res, 'Esta cuenta no tiene password configurado.', 401)
    }

    const platform = req.headers['x-platform']

    if (!platform) {
      return response.error(res, 'Plataforma no identificada.', 400)
    }

    if (platform === 'web' && user.rol === 'usuario') {
      return response.error(res, 'Los estudiantes deben usar la app móvil.', 400)
    }

    if (platform === 'mobile' && user.rol === 'entrenador') {
      return response.error(res, 'Los entrenadores deben usar el portal web.', 400)
    }

    if (user.rol === 'usuario' && !user.cuentaActivada) {
      return response.error(res, 'Cuenta no activada. Revisa tu correo.', 401)
    }

    const validPassword = await bcrypt.compare(password, user.password)

    if (!validPassword) {
      return response.error(res, 'Credenciales inválidas.', 401)
    }

    const token = jwt.sign(
      { sub: user.id, nombre: user.nombre, rol: user.rol },
      config.jwtSecret,
      { expiresIn: '24h' }
    )

    return response.success(res, {
      token,
      user: {
        id: user.id,
        nombre: user.nombre,
        email: user.email,
        rol: user.rol
      }
    })
  } catch (error) {
    next(error)
  }
}

export async function solicitarActivacion(req, res, next) {
  try {
    const { email } = req.body
    if (!email) return response.error(res, 'El email es requerido.', 400)

    const user = await userService.getUserByEmail(email)
    if (!user) return response.error(res, 'No existe usuario con ese email.', 404)
    if (user.rol !== 'usuario') return response.error(res, 'Esta cuenta no es de estudiante.', 400)
    if (user.cuentaActivada && user.password) return response.error(res, 'Esta cuenta ya está activada.', 400)

    await userService.generarTokenActivacion(user.id)
    const updated = await userService.getUserByEmail(email)
    await enviarCorreoActivacion(updated.email, updated.nombre, updated.tokenActivacion)

    return response.success(res, { message: 'Enlace de activación enviado a tu correo.' })
  } catch (error) {
    next(error)
  }
}

export async function activarCuenta(req, res, next) {
  try {
    const { token, password } = req.body
    console.log('=== ACTIVAR CUENTA BACKEND ===')
    console.log('token recibido:', token)
    console.log('password length:', password?.length)

    if (!token || !password) return response.error(res, 'Token y password son requeridos.', 400)
    if (password.length < 6) return response.error(res, 'La contraseña debe tener al menos 6 caracteres.', 400)

    const user = await userService.validarTokenActivacion(token)
    console.log('user encontrado:', user ? user.email : 'NULL')
    if (!user) return response.error(res, 'Token inválido o expirado.', 400)

    console.log('Generando hash...')
    const hashed = await bcrypt.hash(password, 12)
    console.log('Hash generado, actualizando cuenta...')
    await userService.activarCuenta(token, hashed)
    console.log('Cuenta activada!')
    console.log('=== ANTES DEL SUCCESS ===')
    console.log('Enviando respuesta exitosa...')

    return response.success(res, { message: 'Cuenta activada correctamente.' })
  } catch (error) {
    console.log('=== ERROR EN CONTROLLER ===')
    console.log('Error:', error)
    console.log('Error message:', error.message)
    if (error.stack) console.log('Error stack:', error.stack)
    next(error)
  }
}