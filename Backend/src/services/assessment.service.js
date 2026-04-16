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

/**
 * Actualiza el plan de entrenamiento de una valoración.
 */
async function updatePlanEntrenamiento(id, plan) {
  return prisma.assessment.update({
    where: { id },
    data: {
      planEntrenamiento: plan,
    },
  })
}

/**
 * Actualiza análisis y plan de entrenamiento simultáneamente.
 * Cambia el estado de "completada" a "analizada".
 */
async function updateAnalysisAndPlan(id, analysis, trainingPlan) {
  return prisma.assessment.update({
    where: { id },
    data: {
      analisisIA: analysis,
      planEntrenamiento: trainingPlan,
      estadoValoracion: 'analizada',
    },
  })
}

/**
 * Actualiza la evidencia de lesión de una valoración.
 */
async function updateLesion(id, data) {
  return prisma.assessment.update({
    where: { id },
    data,
  })
}

/**
 * Actualiza una valoración completa.
 */
async function update(id, data) {
  return prisma.assessment.update({
    where: { id },
    data,
  })
}

/**
 * Elimina una valoración.
 */
async function deleteAssessment(id) {
  return prisma.assessment.delete({
    where: { id },
  })
}

export { create, getById, getByUserId, updateAnalysis, updatePlanEntrenamiento, updateAnalysisAndPlan, updateLesion, update, deleteAssessment }
