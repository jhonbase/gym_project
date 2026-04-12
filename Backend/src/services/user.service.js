import prisma from '../config/database.js'

/**
 * Crea un nuevo usuario con todos los campos del registro universitario.
 */
async function createUser(data) {
  return prisma.user.create({ data })
}

/**
 * Obtiene todos los usuarios con sus huellas asociadas.
 * Soporta filtro por rol.
 */
async function getAllUsers(rol = null) {
  const where = rol ? { rol } : {}
  return prisma.user.findMany({
    where,
    include: { fingerprints: true, assessments: true },
  })
}

/**
 * Obtiene un usuario por su ID, incluyendo huellas y valoraciones.
 */
async function getUserById(id) {
  return prisma.user.findUnique({
    where: { id },
    include: {
      fingerprints: true,
      assessments: {
        orderBy: { createdAt: 'desc' },
      },
    },
  })
}

/**
 * Obtiene un usuario por su email.
 */
async function getUserByEmail(email) {
  return prisma.user.findUnique({
    where: { email },
  })
}

async function updateUser(id, data) {
  return prisma.user.update({
    where: { id },
    data,
  })
}

async function deleteUser(id) {
  return prisma.user.delete({
    where: { id },
  })
}

export { createUser, getAllUsers, getUserById, getUserByEmail, updateUser, deleteUser }
