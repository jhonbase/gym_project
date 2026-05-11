const today = new Date()

function daysAgo(n) {
  const d = new Date(today)
  d.setDate(d.getDate() - n)
  return d.toISOString()
}

function weeksAgo(n) {
  const d = new Date(today)
  d.setDate(d.getDate() - n * 14)
  return d.toISOString()
}

function clamp(val, min, max) {
  return Math.max(min, Math.min(max, val))
}

function step(val, range) {
  return clamp(val + (Math.random() - 0.5) * 2 * range, val - range, val + range)
}

let lastPeso = 30
let lastGrasa = 30
let lastImc = 30
let lastMasaMuscular = 30
let lastMasaMagra = 30
let lastAgua = 30
let lastGrasaVisceral = 30
let lastEdad = 30

const timestamps = [
  daysAgo(3),
  daysAgo(10),
  weeksAgo(10),
  weeksAgo(9),
  weeksAgo(8),
  weeksAgo(7),
  weeksAgo(6),
  weeksAgo(5),
  weeksAgo(4),
  weeksAgo(3),
  weeksAgo(2),
  weeksAgo(1),
  weeksAgo(0),
]

const mockMetricas = []

for (let i = 0; i < timestamps.length; i++) {
  const currPeso = parseFloat(step(lastPeso, 1.5).toFixed(1))
  const currGrasa = parseFloat(step(lastGrasa, 1.5).toFixed(1))
  const currImc = parseFloat(step(lastImc, 1.5).toFixed(1))
  const currMasaMuscular = parseFloat(step(lastMasaMuscular, 1.5).toFixed(1))
  const currMasaMagra = parseFloat(step(lastMasaMagra, 1.5).toFixed(1))
  const currAgua = parseFloat(step(lastAgua, 1.5).toFixed(1))
  const currGrasaVisceral = Math.round(step(lastGrasaVisceral, 1.5))
  const currEdad = Math.round(step(lastEdad, 1.5))

  mockMetricas.push({
    createdAt: timestamps[i],
    peso: currPeso,
    grasaCorporal: currGrasa,
    imc: currImc,
    masaMuscular: currMasaMuscular,
    masaMagra: currMasaMagra,
    aguaCorporal: currAgua,
    grasaVisceral: currGrasaVisceral,
    edadMetabolica: currEdad,
  })

  lastPeso = currPeso
  lastGrasa = currGrasa
  lastImc = currImc
  lastMasaMuscular = currMasaMuscular
  lastMasaMagra = currMasaMagra
  lastAgua = currAgua
  lastGrasaVisceral = currGrasaVisceral
  lastEdad = currEdad
}

export default mockMetricas
