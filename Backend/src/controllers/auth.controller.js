import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import * as userService from '../services/user.service.js'
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