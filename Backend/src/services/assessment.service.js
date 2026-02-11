import prisma from '../config/database.js'

/**
 * Crea una nueva valoración física.
 */
async function create(data) {
  return prisma.assessment.create({ data })
}

/**
 * Obtiene una valoración por su ID, incluyendo datos del usuario.
 */
async function getById(id) {
  return prisma.assessment.findUnique({
    where: { id },
    include: { user: true },
  })
}

/**
 * Obtiene todas las valoraciones de un usuario, ordenadas por fecha (más reciente primero).
 */
async function getByUserId(userId) {
  return prisma.assessment.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
  })
}

/**
 * Actualiza una valoración con el análisis generado por la IA.
 * Cambia el estado de "completada" a "analizada".
 */
async function updateAnalysis(id, analysis) {
  return prisma.assessment.update({
    where: { id },
    data: {
      analisisIA: analysis,
      estadoValoracion: 'analizada',
    },
  })
}

export { create, getById, getByUserId, updateAnalysis }
