/**
 * Data Generator - Generador centralizado de datos mock aleatorios
 * Lista para futura integración con backend real
 */

const TODAY = new Date()
TODAY.setHours(23, 59, 59, 999)

/**
 * Utilidad: fecha hace X días
 */
function daysAgo(days) {
  const date = new Date(TODAY)
  date.setDate(date.getDate() - days)
  return date.toISOString().split('T')[0]
}

/**
 * Utilidad: formatear fecha
 */
function formatDate(date) {
  return new Date(date).toISOString().split('T')[0]
}

/**
 * Valores base por métrica (punto de partida realista)
 */
const BASE_VALUES = {
  peso: { min: 55, max: 100 },
  grasaCorporal: { min: 15, max: 35 },
  masaMuscular: { min: 25, max: 45 },
  imc: { min: 18, max: 32 }
}

/**
 * Tendencias por métrica (cómo cambia normalmente)
 */
const TRENDS = {
  peso: -0.03,        // disminuye ~0.03 kg por día
  grasaCorporal: -0.05, // decreases
  masaMuscular: +0.02,   // aumenta
  imc: -0.02           // decrease
}

/**
 * Genera datos de evolución para una métrica específica
 * @param {string} studentId - ID del estudiante
 * @param {string} metric - Métrica (peso, grasaCorporal, masaMuscular, imc)
 * @param {number} daysBack - Días hacia atrás
 */
export function generateEvolutionData(studentId, metric, daysBack = 30) {
  const base = BASE_VALUES[metric]
  const trend = TRENDS[metric] || 0
  
  // Valor inicial aleatorio dentro del rango
  let currentValue = base.min + Math.random() * (base.max - base.min)
  
  const data = []
  const today = new Date(TODAY)
  
  for (let i = daysBack; i >= 0; i--) {
    const date = new Date(today)
    date.setDate(date.getDate() - i)
    
    // Variación aleatoria diaria + tendencia
    const dailyVariation = (Math.random() - 0.5) * 0.4
    currentValue += trend + dailyVariation
    
    // Mantener dentro de límites razonables
    currentValue = Math.max(base.min * 0.8, Math.min(base.max * 1.2, currentValue))
    
    data.push({
      date: formatDate(date),
      value: Math.round(currentValue * 10) / 10
    })
  }
  
  return data
}

/**
 * Genera tabla comparativa
 * @param {string} studentId
 */
export function generateMetricsComparison(studentId) {
  const peso = generateEvolutionData(studentId, 'peso', 180)
  const grasa = generateEvolutionData(studentId, 'grasaCorporal', 180)
  const masa = generateEvolutionData(studentId, 'masaMuscular', 180)
  const imc = generateEvolutionData(studentId, 'imc', 180)
  
  const getChange = (arr) => Math.round((arr[arr.length - 1].value - arr[0].value) * 10) / 10
  const getUnit = (metric) => metric === 'imc' || metric === 'grasaCorporal' ? '%' : 'kg'
  
  return {
    peso: { start: peso[0].value, current: peso[peso.length - 1].value, change: getChange(peso), unit: 'kg' },
    grasaCorporal: { start: grasa[0].value, current: grasa[grasa.length - 1].value, change: getChange(grasa), unit: '%' },
    masaMuscular: { start: masa[0].value, current: masa[masa.length - 1].value, change: getChange(masa), unit: 'kg' },
    imc: { start: imc[0].value, current: imc[imc.length - 1].value, change: getChange(imc), unit: '' }
  }
}

/**
 * Genera datos de salud
 * @param {string} studentId
 */
export function generateHealthData(studentId) {
  const generatePPM = () => Math.floor(55 + Math.random() * 35)
  const generatePresion = () => {
    const sist = Math.floor(100 + Math.random() * 30)
    const diast = Math.floor(60 + Math.random() * 20)
    return `${sist}/${diast}`
  }
  
  const ppm = generatePPM()
  const presion = generatePresion()
  
  // Estados aleatorios pero realistas
  const getStatus = (value, low, high) => value < low ? 'warning' : value > high ? 'danger' : 'normal'
  
  return {
    presionArterial: { 
      value: presion, 
      status: getStatus(parseInt(presion.split('/')[0]), 100, 130), 
      label: 'Normal' 
    },
    ppm: { 
      value: ppm, 
      status: getStatus(ppm, 50, 100), 
      label: 'Normal' 
    },
    edadMetabolica: { 
      value: Math.floor(20 + Math.random() * 20), 
      status: 'good', 
      label: '优于 cronológica' 
    },
    grasaVisceral: { 
      value: Math.floor(1 + Math.random() * 15), 
      status: 'normal', 
      label: 'Normal' 
    }
  }
}

/**
 * Genera objetivo del estudiante
 * @param {string} studentId
 */
export function generateObjectiveData(studentId) {
  const objetivos = [
    { objetivo: 'Reducir grasa corporal', objetivoDetalle: 'Reducir grasa corporal de 28% a 15%' },
    { objetivo: 'Aumentar masa muscular', objetivoDetalle: 'Incrementar masa muscular en 5kg' },
    { objetivo: 'Bajar de peso', objetivoDetalle: 'Alcanzar peso saludable de 75kg' },
    { objetivo: 'Mejorar composición corporal', objetivoDetalle: 'Reducir grasa y ganar músculo' }
  ]
  
  const objetivo = objetivos[Math.floor(Math.random() * objetivos.length)]
  const progreso = Math.floor(Math.random() * 80) + 10
  
  const estado = progreso < 25 ? 'estancado' : progreso >= 80 ? 'logrado' : 'en-progreso'
  
  return {
    ...objetivo,
    progreso,
    estado,
    valorInicial: 28,
    valorActual: 28 - (progreso / 100 * 13),
    valorObjetivo: 15,
    unit: '%'
  }
}

/**
 * Genera datos del sidebar
 * @param {string} studentId
 */
export function generateSidebarData(studentId) {
  const peso = Math.round(50 + Math.random() * 40 * 10) / 10
  const cambio = Math.round((Math.random() - 0.5) * 2 * 10) / 10
  const grasa = Math.round(10 + Math.random() * 20 * 10) / 10
  const cambioGrasa = Math.round((Math.random() - 0.5) * 3 * 10) / 10
  const imc = Math.round(18 + Math.random() * 12 * 10) / 10
  
  let categoria, rango
  if (imc < 18.5) { categoria = 'Bajo peso'; rango = '<18.5' }
  else if (imc < 25) { categoria = 'Normal'; rango = '18.5-24.9' }
  else if (imc < 30) { categoria = 'Sobrepeso'; rango = '25-29.9' }
  else { categoria = 'Obesidad'; rango = '≥30' }
  
  const diasEntrenados = Math.floor(20 + Math.random() * 40)
  const streakActual = Math.floor(1 + Math.random() * 20)
  
  return {
    peso: { actual: peso, cambio, periodoSemana: 1 },
    grasa: { actual: grasa, cambio: cambioGrasa },
    imc: { actual: imc, categoria, rango },
    diasEntrenados,
    streakActual
  }
}

/**
 * Genera indicaaciones de entrenamiento
 * @param {string} studentId
 */
export function generateTrainingIndications(studentId) {
  const indications = [
    { tipo: 'restriccion', texto: 'Evitar ejercicios de alto impacto durante sesiones de cardio' },
    { tipo: 'restriccion', texto: 'No realizar sentadillas profundas por molestia en rodilla' },
    { tipo: 'restriccion', texto: 'Evitar presses de banca por molestia en hombro' },
    { tipo: 'restriccion', texto: 'Limitar ejercicios con pesas pesadas' },
    { tipo: 'recomendacion', texto: 'Priorizar trabajo cardiovascular de intensidad baja a moderada' },
    { tipo: 'recomendacion', texto: 'Incorporar ejercicios de movilidad articular antes de cada sesión' },
    { tipo: 'recomendacion', texto: 'Mantener frecuencia de 3 sesiones semanales' },
    { tipo: 'recomendacion', texto: 'Incluir estiramientos al final de cada sesión' },
    { tipo: 'mejora', texto: 'Mejorar técnica de sentadilla' },
    { tipo: 'mejora', texto: 'Trabajar zona lumbar con ejercicios de estabilidad' },
    { tipo: 'mejora', texto: 'Fortalecer core regularmente' },
    { tipo: 'mejora', texto: 'Incorporar ejercicios de propiocepción' },
    { tipo: 'seguir', texto: 'Continuar con la frecuencia actual de entrenamiento' },
    { tipo: 'seguir', texto: 'Mantener buena adherencia al plan nutricional' },
    { tipo: 'seguir', texto: 'Seguir hidratándose correctamente' }
  ]
  
  // Seleccionar 3-4 indicaciones aleatorias
  const selected = []
  const copy = [...indications]
  
  for (let i = 0; i < 4; i++) {
    if (copy.length === 0) break
    const index = Math.floor(Math.random() * copy.length)
    selected.push(copy.splice(index, 1)[0])
  }
  
  return selected
}

/**
 * Genera próxima valoración
 * @param {string} studentId
 */
export function generateNextAssessment(studentId) {
  const diasRestantes = Math.floor(1 + Math.random() * 45)
  const fecha = new Date(TODAY)
  fecha.setDate(fecha.getDate() + diasRestantes)
  
  let estado = 'proximamente'
  if (diasRestantes <= 0) estado = 'vencida'
  else if (diasRestantes <= 7) estado = 'soon'
  
  return {
    fecha: formatDate(fecha),
    diasRestantes,
    estado
  }
}

/**
 * Genera todos los datos de progreso
 * @param {string} studentId
 */
export function generateProgressData(studentId) {
  const [evolution, comparison, health, objective, sidebar, indications, next] = Promise.all([
    generateEvolutionData(studentId, 'peso', 30),
    generateMetricsComparison(studentId),
    generateHealthData(studentId),
    generateObjectiveData(studentId),
    generateSidebarData(studentId),
    generateTrainingIndications(studentId),
    generateNextAssessment(studentId)
  ])
  
  return {
    studentId,
    evolution,
    comparison,
    health,
    objective,
    sidebar,
    indications,
    next,
    generatedAt: new Date().toISOString()
  }
}

/**
 * Rangos de fechas disponibles
 */
export const dateRanges = [
  { value: '7d', label: '7 días', days: 7 },
  { value: '1m', label: '1 mes', days: 30 },
  { value: '3m', label: '3 meses', days: 90 },
  { value: '6m', label: '6 meses', days: 180 }
]

/**
 * Métricas disponibles
 */
export const metrics = [
  { value: 'peso', label: 'Peso', unit: 'kg' },
  { value: 'grasaCorporal', label: 'Grasa corporal', unit: '%' },
  { value: 'masaMuscular', label: 'Masa muscular', unit: 'kg' },
  { value: 'imc', label: 'IMC', unit: '' }
]