import { useState, useCallback, useMemo } from 'react'

/**
 * Intervalos de duración para clasificación de sesiones
 */
const DURATION_LEVELS = {
  NONE: 0,
  SHORT: 45,    // < 45 min
  MEDIUM: 75,    // 45-75 min
  LONG: 120     // > 75 min
}

/**
 * Niveles de intensidad para el color del gráfico
 */
export function getIntensityLevel(duration) {
  if (duration === 0) return 0
  if (duration < 45) return 1
  if (duration < 75) return 2
  return 3
}

/**
 * Genera una fecha aleatoria dentro de un rango
 */
function randomDate(startDate, endDate) {
  const start = startDate.getTime()
  const end = endDate.getTime()
  const randomTime = start + Math.random() * (end - start)
  return new Date(randomTime)
}

/**
 * Genera sesiones de entrenamiento mock
 * Estructura lista para futura integración con backend real
 */
export function generateMockSessions(studentId, daysBack = 30) {
  const sessions = []
  const endDate = new Date()
  const startDate = new Date()
  startDate.setDate(startDate.getDate() - daysBack)

  // Generar entre 40-80% de asistencia basada en días
  const targetSessions = Math.floor(daysBack * (0.4 + Math.random() * 0.4))

  for (let i = 0; i < targetSessions; i++) {
    const date = randomDate(startDate, endDate)
    const duration = Math.floor(30 + Math.random() * 90) // 30-120 min

    sessions.push({
      id: `session_${studentId}_${i}_${Date.now()}`,
      date: date.toISOString(),
      duration: duration,
      type: ['cardio', 'strength', 'mixed'][Math.floor(Math.random() * 3)],
      completed: true
    })
  }

  // Ordenar por fecha descending
  return sessions.sort((a, b) => new Date(b.date) - new Date(a.date))
}

/**
 * Calcula el porcentaje de constancia
 */
export function calculateConsistency(sessions, totalDays) {
  if (totalDays <= 0) return 0
  const uniqueDays = new Set(
    sessions.map(s => new Date(s.date).toDateString())
  ).size
  return Math.round((uniqueDays / totalDays) * 100)
}

/**
 * Hook principal para el historial de entrenamiento
 * Diseñado para ser reemplazado fácilmente por llamada API real
 */
export function useTrainingHistory(studentId) {
  const [filter, setFilter] = useState('1m') // 7d, 1m, 3m, 6m

  // Mapear filtro a días
  const filterDays = useMemo(() => {
    switch (filter) {
      case '7d': return 7
      case '1m': return 30
      case '3m': return 90
      case '6m': return 180
      default: return 30
    }
  }, [filter])

  // Generar sesiones mock (reemplazar con API real cuando exista)
  const sessions = useMemo(() => {
    return generateMockSessions(studentId, filterDays)
  }, [studentId, filterDays])

  // Obtener sesiones del mes actual (últimos 30 días)
  const currentMonthSessions = useMemo(() => {
    const now = new Date()
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

    return sessions.filter(s => new Date(s.date) >= thirtyDaysAgo)
  }, [sessions])

  // Calcular estadísticas
  const stats = useMemo(() => {
    const totalSessions = currentMonthSessions.length
    const totalMinutes = currentMonthSessions.reduce((acc, s) => acc + s.duration, 0)
    const avgDuration = totalSessions > 0 ? Math.round(totalMinutes / totalSessions) : 0
    const consistency = calculateConsistency(currentMonthSessions, 30)

    return {
      totalSessions,
      totalMinutes,
      avgDuration,
      consistency
    }
  }, [currentMonthSessions])

  // Cambiar filtro
  const changeFilter = useCallback((newFilter) => {
    setFilter(newFilter)
  }, [])

  return {
    sessions,
    stats,
    filter,
    changeFilter,
    filterDays
  }
}

/**
 * Genera datos para el gráfico estilo GitHub
 * @param {Array} sessions - Lista de sesiones
 * @param {number} daysBack - Cuántos días hacia atrás mostrar
 */
export function useContribGraphData(sessions, daysBack = 30) {
  const graphData = useMemo(() => {
    const weeks = []
    const today = new Date()
    today.setHours(23, 59, 59, 999)

    // Calcular fecha de inicio: hoy - daysBack
    const startDate = new Date(today)
    startDate.setDate(startDate.getDate() - daysBack)
    
    // Ajustar para empezar desde el lunes
    const dayOfWeek = startDate.getDay()
    const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek
    startDate.setDate(startDate.getDate() + mondayOffset)

    // Calcular semanas necesarias
    const totalDays = Math.ceil((today - startDate) / (1000 * 60 * 60 * 24))
    const numWeeks = Math.ceil(totalDays / 7)

    // Generar semanas
    for (let w = 0; w < numWeeks; w++) {
      const weekStart = new Date(startDate)
      weekStart.setDate(weekStart.getDate() + (w * 7))

      const days = []
      for (let d = 0; d < 7; d++) {
        const day = new Date(weekStart)
        day.setDate(day.getDate() + d)

        // Solo incluir días hasta hoy (inclusive)
        if (day > today) {
          days.push({ date: day, duration: null, level: 0 })
          continue
        }

        // Buscar sesión en este día
        const dayStr = day.toDateString()
        const daySessions = sessions.filter(
          s => new Date(s.date).toDateString() === dayStr
        )

        const totalDuration = daySessions.reduce((acc, s) => acc + s.duration, 0)
        const level = getIntensityLevel(totalDuration)

        days.push({
          date: day,
          duration: totalDuration,
          level
        })
      }

      weeks.push({
        startDate: weekStart,
        days
      })
    }

    return weeks
  }, [sessions, daysBack])

  return graphData
}

export { DURATION_LEVELS }