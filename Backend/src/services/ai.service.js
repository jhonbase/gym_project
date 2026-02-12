import Groq from 'groq-sdk'
import config from '../config/environment.js'
import * as logger from '../utils/logger.js'

// Solo creamos el cliente Groq si hay API key configurada.
// Si no hay key → groqClient es null → las funciones devuelven null.
let groqClient = null

if (config.groqApiKey) {
  groqClient = new Groq({ apiKey: config.groqApiKey })
  logger.info('Cliente Groq inicializado correctamente.')
} else {
  logger.warn('GROQ_API_KEY no configurada. Las funciones de IA estarán deshabilitadas.')
}

/**
 * Genera un análisis de valoración física usando Llama 3.
 *
 * @param {object} assessmentData - Todos los datos de la valoración
 * @returns {string|null} Análisis en texto, o null si no hay internet/key
 */
async function generateAssessmentAnalysis(assessmentData) {
  if (!groqClient) {
    logger.warn('Análisis IA omitido: cliente Groq no disponible.')
    return null
  }

  const prompt = buildPrompt(assessmentData)

  try {
    const response = await groqClient.chat.completions.create({
      model: 'llama-3.1-8b-instant',
      messages: [
        {
          role: 'system',
          content:
            'Eres un asistente de análisis para entrenadores profesionales certificados. ' +
            'Tu audiencia es el ENTRENADOR, no el paciente. ' +
            'Analiza los siguientes datos de valoración física y genera un informe técnico en español ' +
            'dirigido al entrenador para que tome decisiones sobre el plan de entrenamiento del paciente. ' +
            'Incluye: resumen del estado físico del paciente, factores de riesgo que el entrenador debe ' +
            'considerar, recomendaciones de tipo de ejercicio y carga apropiada, consideraciones ' +
            'nutricionales a sugerir, y metas a corto plazo recomendadas para este paciente. ' +
            'Usa un tono técnico, directo y profesional. Refiérete al sujeto como "el paciente".',
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
    logger.error(`Error en Groq API: ${error.message}`)
    return null
  }
}

/**
 * Construye el prompt con los datos de la valoración.
 * Formateado para que Llama 3 entienda claramente cada dato.
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