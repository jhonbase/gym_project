import Groq from 'groq-sdk'
import { readFileSync } from 'fs'
import { join } from 'path'
import * as logger from '../utils/logger.js'

// Leer API key de Groq directamente del .env
const envContent = readFileSync(join(process.cwd(), '.env'), 'utf-8')
const groqMatch = envContent.match(/GROQ_API_KEY=(.+)/)
const apiKey = groqMatch ? groqMatch[1].trim() : null

let groqClient = null

if (apiKey) {
  groqClient = new Groq({ apiKey })
  logger.info('Cliente Groq inicializado correctamente.')
} else {
  logger.warn('GROQ_API_KEY no encontrada en .env. Las funciones de IA estarán deshabilitadas.')
}

async function generateAssessmentAnalysis(assessmentData) {
  if (!groqClient) {
    logger.warn('Análisis IA omitido: cliente Groq no disponible.')
    return null
  }

  const prompt = buildAnalysisPrompt(assessmentData)

  try {
    const chatCompletion = await groqClient.chat.completions.create({
      model: 'llama-3.1-8b-instant',
      messages: [
        {
          role: 'system',
          content: `Eres un asistente de análisis para entrenadores profesionales certificados. 
Tu audiencia es el ENTRENADOR, no el paciente. 
Analiza los siguientes datos de valoración física y genera un informe técnico en español 
dirigido al entrenador para que tome decisiones sobre el plan de entrenamiento del paciente. 
Incluye: resumen del estado físico del paciente, factores de riesgo que el entrenador debe 
considerar, recomendaciones de tipo de ejercicio y carga apropiada, consideraciones 
nutricionales a sugerir, y metas a corto plazo recomendadas para este paciente. 
Usa un tono técnico, directo y profesional. Refiérete al sujeto como "el paciente".`,
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: 0.7,
      max_tokens: 2048,
    })

    return chatCompletion.choices[0]?.message?.content || null
  } catch (error) {
    logger.error(`Error en Groq API (análisis): ${error.message}`)
    return null
  }
}

async function generateTrainingPlan(assessmentData) {
  if (!groqClient) {
    logger.warn('Plan de entrenamiento omitido: cliente Groq no disponible.')
    return null
  }

  const prompt = buildTrainingPlanPrompt(assessmentData)
  logger.info(`Generando plan de entrenamiento para objetivo: ${assessmentData.objetivoUsuario}`)

  try {
    const chatCompletion = await groqClient.chat.completions.create({
      model: 'llama-3.1-8b-instant',
      messages: [
        {
          role: 'system',
          content: `Eres un Entrenador Personal Certificado con más de 10 años de experiencia. 
Genera planes de entrenamiento detallados en español.`,
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: 0.7,
      max_tokens: 4096,
    })

    const plan = chatCompletion.choices[0]?.message?.content || null
    logger.info(`Plan de entrenamiento generado: ${plan ? 'OK (' + plan.length + ' chars)' : 'VACÍO'}`)
    return plan
  } catch (error) {
    logger.error(`Error en Groq API (plan): ${error.message}`)
    return null
  }
}

function buildAnalysisPrompt(data) {
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
${data.lesionDescripcion ? `- Lesiónreportada: ${data.lesionDescripcion}` : ''}
${data.anteCardiovascular ? '- Antecedente cardiovascular' : ''}
${data.anteOsteomuscular ? '- Antecedente osteomuscular' : ''}
${data.anteRespiratorio ? '- Antecedente respiratorio' : ''}
${data.anteMetabolico ? '- Antecedente metabólico' : ''}
`.trim()
}

function buildTrainingPlanPrompt(data) {
  const objetivo = data.objetivoUsuario || 'mantenerse'
  const nivel = data.nivelActividadFisica || 'sedentario'
  const peso = data.peso || 0
  const imc = data.imc || 0
  const grasa = data.grasaCorporal || 0
  const masaMuscular = data.masaMuscular || 0
  const diasDisponibles = data.diasDisponibles || []
  
  let adaptaciones = ''
  if (data.lesionDescripcion) adaptaciones += `- Lesión actual: ${data.lesionDescripcion}\n`
  if (data.anteCardiovascular) adaptaciones += '- Tiene antecedente cardiovascular: adaptar intensidad y evitar ejercicios de alto impacto\n'
  if (data.anteOsteomuscular) adaptaciones += `- Tiene antecedente osteomuscular: ${data.anteOsteomuscularDesc || 'evitar ejercicios de alto impacto'}\n`
  if (data.anteRespiratorio) adaptaciones += '- Tiene antecedente respiratorio: evitar ejercicios de alta intensidad sostenida\n'
  if (data.anteMetabolico) adaptaciones += '- Tiene antecedente metabólico: monitorear respuesta al ejercicio\n'

  const objetivoLower = objetivo.toLowerCase()
  let objetivoTexto = ''
  if (objetivoLower.includes('peso') || objetivoLower.includes('bajar') || objetivoLower.includes('adelgazar')) {
    objetivoTexto = 'Pérdida de peso y grasa corporal'
  } else if (objetivoLower.includes('músculo') || objetivoLower.includes('ganar') || objetivoLower.includes('aumentar')) {
    objetivoTexto = 'Ganancia de masa muscular'
  } else if (objetivoLower.includes('resistencia') || objetivoLower.includes('cardio')) {
    objetivoTexto = 'Mejora de resistencia cardiovascular'
  } else {
    objetivoTexto = 'Mantenimiento y mejora general'
  }

  const diasTexto = diasDisponibles.length > 0 
    ? `Días disponibles para entrenar: ${diasDisponibles.map(d => d.charAt(0).toUpperCase() + d.slice(1)).join(', ')}`
    : 'Días disponibles para entrenar: Lunes a Viernes (todos los días)'

  return `
Eres un Entrenador Personal Certificado con más de 10 años de experiencia. 
Genera un plan de entrenamiento semanal completo y detallado en ESPAÑOL.

DATOS DEL CLIENTE:
- Objetivo: ${objetivoTexto}
- Peso actual: ${peso} kg
- IMC: ${imc}
- Grasa corporal: ${grasa}%
- Masa muscular: ${masaMuscular} kg
- Nivel de actividad actual: ${nivel}
- ${diasTexto}
${adaptaciones ? '\nCONSIDERACIONES ESPECIALES:\n' + adaptaciones : ''}

INSTRUCCIONES:
1. Genera un plan de entrenamiento para los días ${diasDisponibles.length > 0 ? 'específicos' : '4-5'} que el cliente tiene disponibles
2. Incluye: día de entrenamiento, grupo muscular principal, ejercicios específicos, series, repeticiones, tiempo de descanso
3. Considera el objetivo del usuario para definir intensidad y tipo de ejercicios
4. Incluye recomendaciones de calentamiento y enfriamiento
5. Adapta los ejercicios según las lesiones/antecedentes del usuario
6. El plan debe ser realista y progresivo
7. USA SOLO LOS DÍAS QUE EL CLIENTE TIENE DISPONIBLES - NO inventes días adicionales

FORMAT DE RESPUESTA (usa este formato de tabla):
| Día | Grupo Muscular | Ejercicio | Series | Reps | Descanso |
|-----|----------------|-----------|--------|------|----------|
| Lunes | Pierna | Sentadilla | 4 | 10-12 | 90s |
| Martes | Pecho | Press Banca | 3 | 8-10 | 60s |

Agrega también una sección de "Notas" al final con recomendaciones adicionales para el entrenamiento de este cliente específico.
`.trim()
}

export { generateAssessmentAnalysis, generateTrainingPlan }