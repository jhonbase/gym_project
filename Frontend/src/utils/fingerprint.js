// ====================================================
// fingerprint.js - Simulación de huella dactilar
// ====================================================
// Este archivo maneja el localStorage como si fuera un
// lector de huellas. La idea:
//
// VIDA REAL:          SIMULACIÓN:
// Tu dedo             → template guardado en localStorage
// Poner dedo          → leer template + mutarlo
// Sensor compara      → backend compara contra la BD
//
// Cuando tengas un lector real, este archivo se ELIMINA.
// ====================================================

const STORAGE_KEY = 'gym_enrolled_fingerprint'
const CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'

// Guarda el template después del registro
export function saveEnrolledTemplate(template) {
  localStorage.setItem(STORAGE_KEY, template)
}

// Lee el template guardado (simula "poner el dedo")
export function getEnrolledTemplate() {
  return localStorage.getItem(STORAGE_KEY)
}

// ¿Hay una huella registrada en este dispositivo?
export function hasEnrolledFingerprint() {
  return localStorage.getItem(STORAGE_KEY) !== null
}

// Borra la huella (para testing)
export function clearEnrolledFingerprint() {
  localStorage.removeItem(STORAGE_KEY)
}

// Simula la variación natural del escaneo.
// Cada vez que pones tu dedo real, la lectura varía un poco.
// Aquí cambiamos 3 caracteres aleatorios (~95% similitud).
export function mutateTemplate(template) {
  const mutated = template.split('')
  for (let i = 0; i < 3; i++) {
    const pos = Math.floor(Math.random() * mutated.length)
    mutated[pos] = CHARS.charAt(Math.floor(Math.random() * CHARS.length))
  }
  return mutated.join('')
}

// Genera un template aleatorio de 64 caracteres (simula escaneo)
export function generateRandomTemplate() {
  let template = ''
  for (let i = 0; i < 64; i++) {
    template += CHARS.charAt(Math.floor(Math.random() * CHARS.length))
  }
  return template
}