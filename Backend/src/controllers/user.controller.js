import * as userService from '../services/user.service.js'
import * as response from '../utils/apiResponse.js'
import path from 'path'
import fs from 'fs'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

/**
 * POST /api/users
 * Crea un nuevo usuario con todos los datos del registro universitario.
 */
async function createUser(req, res, next) {
  try {
    const data = req.body
    
    if (req.file) {
      data.certificadoEps = `/uploads/certificados/${req.file.filename}`
    }
    
    if (data.eps) {
      data.eps = data.eps.trim().toLowerCase()
    }
    
    if (data.fechaNacimiento && data.fechaNacimiento.trim()) {
      const fecha = new Date(data.fechaNacimiento)
      if (!isNaN(fecha.getTime())) {
        data.fechaNacimiento = fecha
      }
    }
    
    const user = await userService.createUser(data)
    return response.success(res, { user }, 201)
  } catch (error) {
    next(error)
  }
}

/**
 * GET /api/users
 * Obtiene todos los usuarios con sus huellas.
 * Soporta filtro por rol: /api/users?rol=usuario
 */
async function getUsers(req, res, next) {
  try {
    const { rol } = req.query
    const users = await userService.getAllUsers(rol)
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

async function updateUser(req, res, next) {
  try {
    const data = req.body
    
    if (data.eps) {
      data.eps = data.eps.trim().toLowerCase()
    }
    
    if (data.fechaNacimiento && data.fechaNacimiento.trim()) {
      const fecha = new Date(data.fechaNacimiento)
      if (!isNaN(fecha.getTime())) {
        data.fechaNacimiento = fecha
      }
    }
    
    const user = await userService.updateUser(req.params.id, data)

    if (!user) {
      return response.error(res, 'Usuario no encontrado.', 404)
    }

    return response.success(res, { user })
  } catch (error) {
    next(error)
  }
}

async function uploadCertificado(req, res, next) {
  try {
    if (!req.file) {
      return response.error(res, 'No se ha proporcionado ningún archivo.', 400)
    }

    const filePath = `/uploads/certificados/${req.file.filename}`
    const user = await userService.updateUser(req.params.id, { certificadoEps: filePath })

    return response.success(res, { 
      user,
      certificadoUrl: filePath 
    })
  } catch (error) {
    next(error)
  }
}

async function downloadCertificado(req, res, next) {
  try {
    const user = await userService.getUserById(req.params.id)

    if (!user) {
      return response.error(res, 'Usuario no encontrado.', 404)
    }

    if (!user.certificadoEps) {
      return response.error(res, 'El usuario no tiene certificado de EPS.', 404)
    }

    const absolutePath = path.join(__dirname, '../../', user.certificadoEps)

    if (!fs.existsSync(absolutePath)) {
      return response.error(res, 'El archivo no existe.', 404)
    }

    res.download(absolutePath, `certificado_eps_${user.nombre}.pdf`)
  } catch (error) {
    next(error)
  }
}

async function deleteUser(req, res, next) {
  try {
    const { id } = req.params
    
    const user = await userService.getUserById(id)
    if (!user) {
      return response.error(res, 'Usuario no encontrado.', 404)
    }
    
    await userService.deleteUser(id)
    
    return response.success(res, { message: 'Usuario eliminado correctamente.' })
  } catch (error) {
    next(error)
  }
}

const ESTADOS_VALIDOS = ['DISPONIBLE', 'OCUPADO', 'NO_DISPONIBLE']

async function getUserStatus(req, res, next) {
  try {
    const { id } = req.params
    const user = await userService.getUserDisponibilidad(id)

    if (!user) {
      return response.error(res, 'Usuario no encontrado.', 404)
    }

    return response.success(res, { 
      disponibilidad: user.disponibilidad,
      trainer: user.nombre
    })
  } catch (error) {
    next(error)
  }
}

async function getMyStatus(req, res, next) {
  try {
    if (!req.user) {
      return response.error(res, 'No autorizado.', 401)
    }
    const user = await userService.getUserDisponibilidad(req.user.sub)
    if (!user) {
      return response.error(res, 'Usuario no encontrado.', 404)
    }
    return response.success(res, { 
      disponibilidad: user.disponibilidad,
      trainer: user.nombre
    })
  } catch (error) {
    next(error)
  }
}

async function updateMyStatus(req, res, next) {
  try {
    if (!req.user) {
      return response.error(res, 'No autorizado.', 401)
    }

    const { disponibilidad } = req.body

    if (!disponibilidad || !ESTADOS_VALIDOS.includes(disponibilidad)) {
      return response.error(res, 'Estado inválido. Debe ser: DISPONIBLE, OCUPADO o NO_DISPONIBLE', 400)
    }

    const updated = await userService.updateDisponibilidad(req.user.sub, disponibilidad)
    return response.success(res, { disponibilidad: updated.disponibilidad })
  } catch (error) {
    next(error)
  }
}

/**
 * GET /api/users/me
 * Obtiene los datos del usuario actualmente autenticado.
 */
async function getMe(req, res, next) {
  try {
    const userId = req.user.sub
    const user = await userService.getUserById(userId)
    
    if (!user) {
      return response.error(res, 'Usuario no encontrado.', 404)
    }

    return response.success(res, {
      user: {
        id: user.id,
        nombre: user.nombre,
        email: user.email,
        rol: user.rol,
        avatar: user.avatar,
        documento: user.documento,
        telefono: user.telefono,
        eps: user.eps,
        programa: user.programa,
        modalidad: user.modalidad,
        jornada: user.jornada,
        semestre: user.semestre,
      }
    })
  } catch (error) {
    next(error)
  }
}

/**
 * PATCH /api/users/me/avatar
 * Sube la foto de perfil del usuario autenticado.
 */
async function uploadAvatar(req, res, next) {
  try {
    if (!req.file) {
      return response.error(res, 'No se ha proporcionado la imagen.', 400)
    }

    const userId = req.user.sub
    const avatarUrl = req.file.path

    const updated = await userService.updateUser(userId, { avatar: avatarUrl })
    
    return response.success(res, {
      user: {
        id: updated.id,
        nombre: updated.nombre,
        avatar: updated.avatar
      }
    })
  } catch (error) {
    next(error)
  }
}

export { createUser, getUsers, getUserById, updateUser, uploadCertificado, downloadCertificado, deleteUser, getUserStatus, getMyStatus, updateMyStatus, getMe, uploadAvatar }
