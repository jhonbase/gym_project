import apiClient from '../api/client.js'

const progressCache = new Map()

async function fetchProgressData(studentId) {
  const cached = progressCache.get(studentId)
  const now = Date.now()
  if (cached && now - cached.timestamp < 5000) {
    return cached.response
  }
  const response = await apiClient.get(`/assessments/user/${studentId}/progress`)
  progressCache.set(studentId, { response, timestamp: now })
  return response
}

export async function getEvolutionData(studentId, metric, dateRange) {
  const progressData = await fetchProgressData(studentId)
  const raw = progressData.data.data
  const evolution = raw.evolution || []

  const daysMap = {
    '7d': 7,
    '1m': 30,
    '3m': 90,
    '6m': 180,
  }

  const days = daysMap[dateRange] || 30
  const cutoffDate = new Date()
  cutoffDate.setDate(cutoffDate.getDate() - days)

  const filteredEvolution = evolution.filter((item) => new Date(item.fecha) >= cutoffDate)

  return filteredEvolution.map((item) => ({
    date: item.fecha,
    value: item[metric.toLowerCase()],
  }))
}

export async function getMetricsComparison(studentId) {
  const progressData = await fetchProgressData(studentId)
  const assessments = progressData.data.data.assessments || []

  if (assessments.length < 2) {
    return {
      peso: { start: 0, current: 0, change: 0, unit: 'kg' },
      grasaCorporal: { start: 0, current: 0, change: 0, unit: '%' },
      masaMuscular: { start: 0, current: 0, change: 0, unit: 'kg' },
      imc: { start: 0, current: 0, change: 0, unit: '' },
      grasaVisceral: { start: 0, current: 0, change: 0, unit: 'nivel' },
    }
  }

  const first = assessments[0]
  const last = assessments[assessments.length - 1]

  return {
    peso: { start: first.peso, current: last.peso, change: last.peso - first.peso, unit: 'kg' },
    grasaCorporal: { start: first.grasaCorporal, current: last.grasaCorporal, change: last.grasaCorporal - first.grasaCorporal, unit: '%' },
    masaMuscular: { start: first.masaMuscular, current: last.masaMuscular, change: last.masaMuscular - first.masaMuscular, unit: 'kg' },
    imc: { start: first.imc, current: last.imc, change: last.imc - first.imc, unit: '' },
    grasaVisceral: { start: first.grasaVisceral, current: last.grasaVisceral, change: last.grasaVisceral - first.grasaVisceral, unit: 'nivel' },
  }
}

export async function getHealthData(studentId) {
  const progressData = await fetchProgressData(studentId)
  const sidebar = progressData.data.data.sidebar

  if (!sidebar || !sidebar.pesoActual) {
    return {
      presionArterial: { value: '', status: 'normal', label: 'Normal' },
      ppm: { value: 0, status: 'normal', label: 'Normal' },
      edadMetabolica: { value: 0, status: 'normal', label: 'Mejor que cronológica' },
      grasaVisceral: { value: 0, status: 'normal', label: 'Normal' },
    }
  }

  const getStatus = (value, low, high) => {
    if (value < low) return 'warning'
    if (value > high) return 'danger'
    return 'normal'
  }

    const sistolica = sidebar.presionArterial
      ? parseInt(sidebar.presionArterial.split('/')[0])
      : 0

    return {
      presionArterial: {
        value: sidebar.presionArterial,
        status: getStatus(sistolica, 100, 130),
        label: 'Normal',
      },
    ppm: {
      value: sidebar.ppm,
      status: getStatus(sidebar.ppm, 50, 100),
      label: 'Normal',
    },
    edadMetabolica: {
      value: sidebar.edadMetabolica,
      status: sidebar.edadMetabolica < 25 ? 'good' : 'normal',
      label: 'Mejor que cronológica',
    },
    grasaVisceral: {
      value: sidebar.grasaVisceral,
      status: getStatus(sidebar.grasaVisceral, 1, 10),
      label: 'Normal',
    },
  }
}

export async function getObjectiveData(studentId) {
  const progressData = await fetchProgressData(studentId)
  const objective = progressData.data.data.objective

  if (!objective || !objective.objetivo) {
    return {
      objetivo: '',
      objetivoDetalle: '',
      estado: 'en-progreso',
      proximaFecha: null,
    }
  }

  return {
    objetivo: objective.objetivo,
    objetivoDetalle: objective.objetivo,
    estado: objective.estado || 'en-progreso',
    proximaFecha: objective.proximaFecha || null,
  }
}

export async function getSidebarData(studentId) {
  const progressData = await fetchProgressData(studentId)
  const sidebar = progressData.data.data.sidebar

  if (!sidebar || !sidebar.pesoActual) {
    return {
      peso: { actual: 0, cambio: 0, periodoSemana: 1 },
      grasa: { actual: 0, cambio: 0 },
      imc: { actual: 0, categoria: '', rango: '' },
      diasEntrenados: 0,
      streakActual: 0,
    }
  }

  const cambio = 0
  const cambioGrasa = 0

  let categoria, rango
  if (sidebar.imc < 18.5) {
    categoria = 'Bajo peso'
    rango = '<18.5'
  } else if (sidebar.imc < 25) {
    categoria = 'Normal'
    rango = '18.5-24.9'
  } else if (sidebar.imc < 30) {
    categoria = 'Sobrepeso'
    rango = '25-29.9'
  } else {
    categoria = 'Obesidad'
    rango = '≥30'
  }

  const diasEntrenados = 0
  const streakActual = 0

  return {
    peso: { actual: sidebar.pesoActual, cambio, periodoSemana: 1 },
    grasa: { actual: sidebar.grasaCorporal, cambio: cambioGrasa },
    imc: { actual: sidebar.imc, categoria, rango },
    diasEntrenados,
    streakActual,
  }
}

export async function getTrainingIndications(studentId) {
  const progressData = await fetchProgressData(studentId)
  const indications = progressData.data.data.indications
  return indications || []
}

export async function getNextAssessment(studentId) {
  const progressData = await fetchProgressData(studentId)
  const objective = progressData.data.data.objective

  if (!objective || !objective.objetivo) {
    return { fecha: '', diasRestantes: 0, estado: 'proximamente' }
  }

  let diasRestantes = 0
  let estado = 'proximamente'

  if (objective.proximaFecha) {
    const fechaProxima = new Date(objective.proximaFecha)
    const hoy = new Date()
    const diffTime = fechaProxima - hoy
    diasRestantes = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

    if (diasRestantes <= 0) estado = 'vencida'
    else if (diasRestantes <= 7) estado = 'soon'
  }

  return {
    fecha: objective.proximaFecha ? new Date(objective.proximaFecha).toISOString().split('T')[0] : '',
    diasRestantes,
    estado,
  }
}

export async function getProgressData(studentId) {
  const progressData = await fetchProgressData(studentId)
  const raw = progressData.data.data

  const sidebar = raw.sidebar
  const assessments = raw.assessments || []
  const evolution = raw.evolution || []
  const objective = raw.objective

  // Evolution data (default metric: peso, range: 1m)
  const days = 30
  const cutoffDate = new Date()
  cutoffDate.setDate(cutoffDate.getDate() - days)
  const filteredEvolution = evolution.filter((item) => new Date(item.fecha) >= cutoffDate)
  const evolutionData = filteredEvolution.map((item) => ({ date: item.fecha, value: item.peso }))

  // Metrics comparison
  let comparisonData
  if (assessments.length >= 2) {
    const first = assessments[0]
    const last = assessments[assessments.length - 1]
    comparisonData = {
      peso: { start: first.peso, current: last.peso, change: last.peso - first.peso, unit: 'kg' },
      grasaCorporal: { start: first.grasaCorporal, current: last.grasaCorporal, change: last.grasaCorporal - first.grasaCorporal, unit: '%' },
      masaMuscular: { start: first.masaMuscular, current: last.masaMuscular, change: last.masaMuscular - first.masaMuscular, unit: 'kg' },
      imc: { start: first.imc, current: last.imc, change: last.imc - first.imc, unit: '' },
      grasaVisceral: { start: first.grasaVisceral, current: last.grasaVisceral, change: last.grasaVisceral - first.grasaVisceral, unit: 'nivel' },
    }
  } else {
    comparisonData = {
      peso: { start: 0, current: 0, change: 0, unit: 'kg' },
      grasaCorporal: { start: 0, current: 0, change: 0, unit: '%' },
      masaMuscular: { start: 0, current: 0, change: 0, unit: 'kg' },
      imc: { start: 0, current: 0, change: 0, unit: '' },
      grasaVisceral: { start: 0, current: 0, change: 0, unit: 'nivel' },
    }
  }

  // Health data
  let healthData
  if (!sidebar || !sidebar.pesoActual) {
    healthData = {
      presionArterial: { value: '', status: 'normal', label: 'Normal' },
      ppm: { value: 0, status: 'normal', label: 'Normal' },
      edadMetabolica: { value: 0, status: 'normal', label: 'Mejor que cronológica' },
      grasaVisceral: { value: 0, status: 'normal', label: 'Normal' },
    }
  } else {
    const getStatus = (value, low, high) => {
      if (value < low) return 'warning'
      if (value > high) return 'danger'
      return 'normal'
    }
    healthData = {
      presionArterial: {
        value: sidebar.presionArterial,
        status: sidebar.presionArterial
          ? getStatus(parseInt(sidebar.presionArterial.split('/')[0]), 100, 130)
          : 'normal',
        label: 'Normal',
      },
      ppm: {
        value: sidebar.ppm,
        status: getStatus(sidebar.ppm, 50, 100),
        label: 'Normal',
      },
      edadMetabolica: {
        value: sidebar.edadMetabolica,
        status: sidebar.edadMetabolica < 25 ? 'good' : 'normal',
        label: 'Mejor que cronológica',
      },
      grasaVisceral: {
        value: sidebar.grasaVisceral,
        status: getStatus(sidebar.grasaVisceral, 1, 10),
        label: 'Normal',
      },
    }
  }

  // Objective data
  let objectiveData
  if (!objective || !objective.objetivo) {
    objectiveData = {
      objetivo: '',
      objetivoDetalle: '',
      estado: 'en-progreso',
      proximaFecha: null,
    }
  } else {
    objectiveData = {
      objetivo: objective.objetivo,
      objetivoDetalle: objective.objetivo,
      estado: objective.estado || 'en-progreso',
      proximaFecha: objective.proximaFecha || null,
    }
  }

  // Sidebar data
  let sidebarData
  if (!sidebar || !sidebar.pesoActual) {
    sidebarData = {
      peso: { actual: 0, cambio: 0, periodoSemana: 1 },
      grasa: { actual: 0, cambio: 0 },
      imc: { actual: 0, categoria: '', rango: '' },
      diasEntrenados: 0,
      streakActual: 0,
    }
  } else {
    const cambio = 0
    const cambioGrasa = 0
    let categoria, rango
    if (sidebar.imc < 18.5) {
      categoria = 'Bajo peso'
      rango = '<18.5'
    } else if (sidebar.imc < 25) {
      categoria = 'Normal'
      rango = '18.5-24.9'
    } else if (sidebar.imc < 30) {
      categoria = 'Sobrepeso'
      rango = '25-29.9'
    } else {
      categoria = 'Obesidad'
      rango = '≥30'
    }
    const diasEntrenados = 0
    const streakActual = 0
    sidebarData = {
      peso: { actual: sidebar.pesoActual, cambio, periodoSemana: 1 },
      grasa: { actual: sidebar.grasaCorporal, cambio: cambioGrasa },
      imc: { actual: sidebar.imc, categoria, rango },
      diasEntrenados,
      streakActual,
    }
  }

  // Training indications
  const indicationsData = raw.indications || []

  // Next assessment
  let nextData
  if (!objective || !objective.objetivo) {
    nextData = { fecha: '', diasRestantes: 0, estado: 'proximamente' }
  } else {
    let diasRestantes = 0
    let estado = 'proximamente'
    if (objective.proximaFecha) {
      const fechaProxima = new Date(objective.proximaFecha)
      const hoy = new Date()
      const diffTime = fechaProxima - hoy
      diasRestantes = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
      if (diasRestantes <= 0) estado = 'vencida'
      else if (diasRestantes <= 7) estado = 'soon'
    }
    nextData = {
      fecha: objective.proximaFecha ? new Date(objective.proximaFecha).toISOString().split('T')[0] : '',
      diasRestantes,
      estado,
    }
  }

  return {
    evolution: evolutionData,
    comparison: comparisonData,
    health: healthData,
    objective: objectiveData,
    sidebar: sidebarData,
    indications: indicationsData,
    next: nextData,
  }
}

export async function getAssessments(studentId) {
  const progressData = await fetchProgressData(studentId)
  const assessments = progressData.data.data.assessments || []
  return assessments.map((assessment) => ({
    id: assessment.id,
    fecha: assessment.fecha,
    fechaRaw: assessment.fecha,
    peso: assessment.peso,
    grasaCorporal: assessment.grasaCorporal,
    masaMuscular: assessment.masaMuscular,
    imc: assessment.imc,
    grasaVisceral: assessment.grasaVisceral,
  }))
}
