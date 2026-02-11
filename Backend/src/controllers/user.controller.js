import * as userService from '../services/user.service.js'
import * as response from '../utils/apiResponse.js'

/**
 * POST /api/users
 * Crea un nuevo usuario con todos los datos del registro universitario.
 */
async function createUser(req, res, next) {
  try {
    const user = await userService.createUser(req.body)
    return response.success(res, { user }, 201)
  } catch (error) {
    next(error) // → va al errorHandler global
  }
}

/**
 * GET /api/users
 * Obtiene todos los usuarios con sus huellas.
 */
async function getUsers(req, res, next) {
  try {
    const users = await userService.getAllUsers()
    return response.success(res, { users })
  } catch (error) {
    next(error)
  }
}

/**
 * GET /api/users/:id
 * Obtiene un usuario por ID con huellas y valoraciones.
 */
async function getUserById(req, res, next) {
  try {
    const user = await userService.getUserById(req.params.id)

    if (!user) {
      return response.error(res, 'Usuario no encontrado.', 404)
    }

    return response.success(res, { user })
  } catch (error) {
    next(error)
  }
}

export { createUser, getUsers, getUserById }
