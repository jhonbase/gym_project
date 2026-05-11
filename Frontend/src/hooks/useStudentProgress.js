/**
 * Hook para obtener y manejar datos de progreso del estudiante
 * Maneja estados de loading, error y lógica reutilizable
 */

import { useState, useEffect, useCallback } from 'react'
import * as progressService from '../services/progressService.js'
import { dateRanges, metrics } from '../mocks/progressMock.js'

export function useStudentProgress(studentId) {
  // Estados principales
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [data, setData] = useState(null)

  // Estados de filtros
  const [metric, setMetric] = useState('peso')
  const [dateRange, setDateRange] = useState('1m')

  // Estados de comparación
  const [assessments, setAssessments] = useState([])
  const [compareMode, setCompareMode] = useState(false)
  const [compareIds, setCompareIds] = useState({ id1: null, id2: null })

  // Cargar datos iniciales
  useEffect(() => {
    loadAllData()
    loadAssessments()
  }, [studentId])

  // Recargar evolution cuando cambia metric o dateRange
  useEffect(() => {
    if (data) {
      loadEvolution()
    }
  }, [metric, dateRange])

  // Cargar todos los datos
  async function loadAllData() {
    setLoading(true)
    setError(null)

    try {
      const progressData = await progressService.getProgressData(studentId)
      setData(progressData)
    } catch (err) {
      setError(err.message || 'Error al cargar datos de progreso')
    } finally {
      setLoading(false)
    }
  }

  // Cargar solo evolución (para filtros)
  async function loadEvolution() {
    try {
      const evolution = await progressService.getEvolutionData(studentId, metric, dateRange)
      setData(prev => ({ ...prev, evolution }))
    } catch (err) {
      console.error('Error cargando evolución:', err)
    }
  }

  // Cargar lista de valoraciones
  async function loadAssessments() {
    try {
      const list = await progressService.getAssessments(studentId)
      setAssessments(list)
    } catch (err) {
      console.error('Error cargando valoraciones:', err)
    }
  }

  // Cambiar métrica
  const changeMetric = useCallback((newMetric) => {
    setMetric(newMetric)
  }, [])

  // Cambiar rango de fechas
  const changeDateRange = useCallback((newRange) => {
    setDateRange(newRange)
  }, [])

  // Activar modo comparación
  const startCompare = useCallback((id1, id2) => {
    setCompareIds({ id1, id2 })
    setCompareMode(true)
  }, [])

  // Limpiar comparación
  const clearComparison = useCallback(() => {
    setCompareMode(false)
    setCompareIds({ id1: null, id2: null })
  }, [])

  // Obtener label de métrica actual
  const getMetricLabel = useCallback(() => {
    return metrics.find(m => m.value === metric)?.label || metric
  }, [metric])

  // Obtener label de rango actual
  const getDateRangeLabel = useCallback(() => {
    return dateRanges.find(r => r.value === dateRange)?.label || dateRange
  }, [dateRange])

  return {
    loading,
    error,
    data,
    metric,
    dateRange,
    dateRanges,
    metrics,
    changeMetric,
    changeDateRange,
    getMetricLabel,
    getDateRangeLabel,
    reload: loadAllData,
    // Comparación
    assessments,
    compareMode,
    compareIds,
    startCompare,
    clearComparison
  }
}