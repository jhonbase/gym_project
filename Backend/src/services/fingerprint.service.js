import prisma from '../config/database.js'
import { calculateSimilarity } from '../utils/fingerprintHelpers.js'

// Umbral de similitud: 90% significa que al menos 58 de 64
// caracteres deben coincidir. Con 3 mutaciones (~95.3% similitud),
// el usuario legítimo siempre supera este umbral.
const SIMILARITY_THRESHOLD = 90

/**
 * Registra una huella en la BD asociada a un usuario.
 */
async function enrollFingerprint(userId, template) {
  return prisma.fingerprint.create({
    data: { userId, template },
  })
}

/**
 * Busca el mejor match para un template escaneado.
 * Compara contra TODAS las huellas almacenadas.
 *
 * @param {string} scannedTemplate - Template que viene del "escaneo" (frontend)
 * @returns {{ matched: boolean, user?: object, similarity: number }}
 */
async function matchFingerprint(scannedTemplate) {
  // Traemos TODAS las huellas de la BD con los datos del usuario
  const allFingerprints = await prisma.fingerprint.findMany({
    include: { user: true },
  })

  let bestMatch = null
  let bestSimilarity = 0

  // Comparamos el template escaneado contra cada huella almacenada
  for (const stored of allFingerprints) {
    const similarity = calculateSimilarity(scannedTemplate, stored.template)

    if (similarity > bestSimilarity) {
      bestSimilarity = similarity
      bestMatch = stored
    }
  }

  // Si el mejor match supera el umbral → autenticación exitosa
  if (bestSimilarity >= SIMILARITY_THRESHOLD && bestMatch) {
    return {
      matched: true,
      user: bestMatch.user,
      similarity: bestSimilarity,
    }
  }

  // Si no → acceso denegado
  return {
    matched: false,
    similarity: bestSimilarity,
  }
}

export { enrollFingerprint, matchFingerprint, SIMILARITY_THRESHOLD }
