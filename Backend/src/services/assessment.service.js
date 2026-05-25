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
 * Obtiene todas las valoraciones con datos del usuario.
 */
async function getAll() {
  return prisma.assessment.findMany({
    orderBy: { createdAt: 'desc' },
    include: { user: true },
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
 * Actualiza la evidencia de lesión de una valoración (para append).
 */
async function updateLesion(id, data) {
  return prisma.assessment.update({
    where: { id },
    data,
  })
}

/**
 * Actualiza el historial clínico de una valoración.
 */
async function updateHistorial(id, data) {
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
 * Obtiene datos de progreso para un usuario en el formato esperado por el frontend.
 */
async function getProgress(userId) {
  // Obtener todas las valoraciones del usuario ordenadas por fecha ascendente
  const assessments = await prisma.assessment.findMany({
    where: { userId },
    orderBy: { createdAt: 'asc' },
  })

  if (assessments.length === 0) {
    return {
      sidebar: {},
      objective: {},
      indications: [],
      evolution: [],
      assessments: [],
      totalAssessments: 0
    }
  }

  // La valoración más reciente es la última en la lista ordenada ascendentemente
  const latest = assessments[assessments.length - 1]

  // Construir objeto sidebar con los datos más recientes
  const sidebar = {
    pesoActual: latest.peso,
    grasaCorporal: latest.grasaCorporal,
    imc: latest.imc,
    masaMuscular: latest.masaMuscular,
    aguaCorporal: latest.aguaCorporal,
    grasaVisceral: latest.grasaVisceral,
    presionArterial: latest.presionArterial,
    ppm: latest.ppm,
    edadMetabolica: latest.edadMetabolica,
  }

  // Construir objeto objective
  const objective = {
    objetivo: latest.objetivoUsuario,
    proximaFecha: latest.proximaFechaValoracion,
    estado: latest.estadoValoracion,
  }

  // Indicaciones del último assessment (campo JSON)
  const indications = latest.indicaciones || []

  // Construir evolución (todos los assessments ordenados por fecha)
  const evolution = assessments.map(assessment => ({
    fecha: assessment.createdAt,
    peso: assessment.peso,
    grasaCorporal: assessment.grasaCorporal,
    masaMuscular: assessment.masaMuscular,
    imc: assessment.imc,
  }))

  // Construir lista de assessments para el selector de comparación
  const assessmentsForSelector = assessments.map(assessment => ({
    id: assessment.id,
    fecha: assessment.createdAt,
    objetivo: assessment.objetivoUsuario,
    peso: assessment.peso,
    grasaCorporal: assessment.grasaCorporal,
    masaMuscular: assessment.masaMuscular,
    imc: assessment.imc,
    grasaVisceral: assessment.grasaVisceral,
  }))

  return {
    sidebar,
    objective,
    indications,
    evolution,
    assessments: assessmentsForSelector,
    totalAssessments: assessments.length
  }
}

/**
 * Elimina una valoración.
 */
async function deleteAssessment(id) {
  return prisma.assessment.delete({
    where: { id },
  })
}

export { create, getById, getByUserId, getAll, updateAnalysis, updatePlanEntrenamiento, updateAnalysisAndPlan, updateLesion, updateHistorial, update, deleteAssessment, getProgress }
