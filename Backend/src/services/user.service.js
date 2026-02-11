import prisma from '../config/database.js'

/**
 * Crea un nuevo usuario con todos los campos del registro universitario.
 */
async function createUser(data) {
  return prisma.user.create({ data })
}

/**
 * Obtiene todos los usuarios con sus huellas asociadas.
 */
async function getAllUsers() {
  return prisma.user.findMany({
    include: { fingerprints: true },
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

export { createUser, getAllUsers, getUserById }
