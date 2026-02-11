const CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
const TEMPLATE_LENGTH = 64

/**
 * Genera un template de huella simulado.
 * @returns {string} Template de 64 caracteres (A-Z, 0-9)
 */
export function generateTemplate() {
  let template = ''
  for (let i = 0; i < TEMPLATE_LENGTH; i++) {
    template += CHARS.charAt(Math.floor(Math.random() * CHARS.length))
  }
  return template
}

/**
 * Muta un template para simular variación natural del escaneo.
 * @param {string} template - Template original
 * @returns {string} Template mutado (3 caracteres cambiados)
 */
export function mutateTemplate(template) {
  const mutated = template.split('')
  const mutations = 3

  for (let i = 0; i < mutations; i++) {
    const pos = Math.floor(Math.random() * mutated.length)
    mutated[pos] = CHARS.charAt(Math.floor(Math.random() * CHARS.length))
  }

  return mutated.join('')
}

/**
 * Calcula el porcentaje de similitud entre dos templates.
 * Compara carácter por carácter y devuelve el % de coincidencia.
 *
 * Ejemplo:
 *   "ABCDEF" vs "ABCXYZ" → 3/6 coinciden → 50%
 *   "ABCDEF" vs "ABCDEF" → 6/6 coinciden → 100%
 *
 * @param {string} t1 - Primer template
 * @param {string} t2 - Segundo template
 * @returns {number} Porcentaje de similitud (0-100)
 */
export function calculateSimilarity(t1, t2) {
  if (!t1 || !t2 || t1.length !== t2.length) return 0

  let matches = 0
  for (let i = 0; i < t1.length; i++) {
    if (t1[i] === t2[i]) matches++
  }

  return (matches / t1.length) * 100
}