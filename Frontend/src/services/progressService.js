/**
 * Progress Service
 * Encargado de obtener y preparar datos de progreso del estudiante
 * 
 * Por ahora usa generateProgressData del generador
 * Para integrar con backend real, reemplazar los returns por llamadas API
 */

import { generateEvolutionData, generateMetricsComparison, generateHealthData, generateObjectiveData, generateSidebarData, generateTrainingIndications, generateNextAssessment } from '../mocks/progressMock.js'

/**
 * Obtiene datos de evolución filtrados por métrica y rango de fechas
 */
export async function getEvolutionData(studentId, metric, dateRange) {
  // Simular delay de API
  await new Promise(resolve => setTimeout(resolve, 300))

  const daysMap = {
    '7d': 7,
    '1m': 30,
    '3m': 90,
    '6m': 180
  }
  
  const days = daysMap[dateRange] || 30
  return generateEvolutionData(studentId, metric, days)
}

/**
 * Obtiene tabla comparativa de métricas
 */
export async function getMetricsComparison(studentId) {
  await new Promise(resolve => setTimeout(resolve, 200))
  return generateMetricsComparison(studentId)
}

/**
 * Obtiene datos de salud
 */
export async function getHealthData(studentId) {
  await new Promise(resolve => setTimeout(resolve, 200))
  return generateHealthData(studentId)
}

/**
 * Obtiene objetivo del estudiante
 */
export async function getObjectiveData(studentId) {
  await new Promise(resolve => setTimeout(resolve, 200))
  return generateObjectiveData(studentId)
}

/**
 * Obtiene datos del sidebar
 */
export async function getSidebarData(studentId) {
  await new Promise(resolve => setTimeout(resolve, 200))
  return generateSidebarData(studentId)
}

/**
 * Obtiene indicaciones de entrenamiento
 */
export async function getTrainingIndications(studentId) {
  await new Promise(resolve => setTimeout(resolve, 200))
  return generateTrainingIndications(studentId)
}

/**
 * Obtiene próxima valoración
 */
export async function getNextAssessment(studentId) {
  await new Promise(resolve => setTimeout(resolve, 200))
  return generateNextAssessment(studentId)
}

/**
 * Obtiene todos los datos de progreso
 * Método unificado para cargar todo de una vez
 */
export async function getProgressData(studentId) {
  const [evolution, comparison, health, objective, sidebar, indications, next] = await Promise.all([
    getEvolutionData(studentId, 'peso', '1m'),
    getMetricsComparison(studentId),
    getHealthData(studentId),
    getObjectiveData(studentId),
    getSidebarData(studentId),
    getTrainingIndications(studentId),
    getNextAssessment(studentId)
  ])

  return {
    evolution,
    comparison,
    health,
    objective,
    sidebar,
    indications,
    next
  }
}