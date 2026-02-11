import OpenAI from 'openai'
import config from '../config/environment.js'
import * as logger from '../utils/logger.js'

// Solo creamos el cliente OpenAI si hay API key configurada.
// Si no hay key → openaiClient es null → las funciones devuelven null.
let openaiClient = null

if (config.openaiApiKey) {
  openaiClient = new OpenAI({ apiKey: config.openaiApiKey })
  logger.info('Cliente OpenAI inicializado correctamente.')
} else {
  logger.warn('OPENAI_API_KEY no configurada. Las funciones de IA estarán deshabilitadas.')
}

/**
 * Genera un análisis de valoración física usando GPT-4o mini.
 *
 * @param {object} assessmentData - Todos los datos de la valoración
 * @returns {string|null} Análisis en texto, o null si no hay internet/key
 */
async function generateAssessmentAnalysis(assessmentData) {
  if (!openaiClient) {
    logger.warn('Análisis IA omitido: cliente OpenAI no disponible.')
    return null
  }

  const prompt = buildPrompt(assessmentData)

  try {
    const response = await openaiClient.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content:
            'Eres un entrenador profesional certificado y especialista en evaluación física. ' +
            'Analiza los siguientes datos de valoración física y proporciona un análisis completo ' +
            'en español. Incluye: resumen general de salud, factores de riesgo identificados, ' +
            'tipo de ejercicio recomendado, sugerencias de nutrición, y metas a corto plazo. ' +
            'Sé motivador pero honesto. Usa un lenguaje claro y profesional.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      max_tokens: 1000,
      temperature: 0.7,
    })

    return response.choices[0].message.content
  } catch (error) {
    logger.error(`Error en OpenAI API: ${error.message}`)
    return null
  }
}

/**
 * Construye el prompt con los datos de la valoración.
 * Formateado para que GPT-4o mini entienda claramente cada dato.
 */
function buildPrompt(data) {
  return `
Datos de valoración física:
- Peso: ${data.peso} kg
- Estatura: ${data.estatura} cm
- IMC: ${data.imc}
- Grasa corporal: ${data.grasaCorporal}%
- Masa muscular: ${data.masaMuscular} kg
- Masa magra: ${data.masaMagra} kg
- Agua corporal: ${data.aguaCorporal}%
- Grasa visceral: nivel ${data.grasaVisceral}
- Presión arterial: ${data.presionArterial}
- Edad metabólica: ${data.edadMetabolica} años
- Fuerza de agarre: ${data.fuerzaAgarre} kg
- Resistencia muscular: ${data.resistenciaMuscular}
- RM estimado: ${data.rmEstimado}
- PPM (frecuencia cardíaca): ${data.ppm}
- Nivel de actividad física: ${data.nivelActividadFisica}
- Objetivo del usuario: ${data.objetivoUsuario}
${data.observacion ? `- Observaciones adicionales: ${data.observacion}` : ''}
  `.trim()
}

export { generateAssessmentAnalysis }
