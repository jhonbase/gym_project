import { z } from 'zod/v4'

const createAssessmentSchema = z.object({
  userId: z
    .string({ required_error: 'El userId es obligatorio.' })
    .uuid('Debe ser un UUID válido.'),

  // Medidas corporales
  peso: z
    .number({ required_error: 'El peso es obligatorio.' })
    .positive('El peso debe ser positivo.')
    .max(500, 'El peso máximo es 500 kg.'),

  estatura: z
    .number({ required_error: 'La estatura es obligatoria.' })
    .positive('La estatura debe ser positiva.')
    .max(300, 'La estatura máxima es 300 cm.'),

  grasaCorporal: z
    .number({ required_error: 'La grasa corporal es obligatoria.' })
    .min(0, 'La grasa corporal mínima es 0%.')
    .max(100, 'La grasa corporal máxima es 100%.'),

  masaMuscular: z
    .number({ required_error: 'La masa muscular es obligatoria.' })
    .positive('La masa muscular debe ser positiva.'),

  imc: z
    .number({ required_error: 'El IMC es obligatorio.' })
    .positive('El IMC debe ser positivo.'),

  masaMagra: z
    .number({ required_error: 'La masa magra es obligatoria.' })
    .positive('La masa magra debe ser positiva.'),

  aguaCorporal: z
    .number({ required_error: 'El agua corporal es obligatoria.' })
    .min(0, 'El agua corporal mínima es 0%.')
    .max(100, 'El agua corporal máxima es 100%.'),

  grasaVisceral: z
    .number({ required_error: 'La grasa visceral es obligatoria.' })
    .int('La grasa visceral debe ser un número entero.')
    .min(1, 'La grasa visceral mínima es nivel 1.')
    .max(59, 'La grasa visceral máxima es nivel 59.'),

  // Datos clínicos
  presionArterial: z
    .string({ required_error: 'La presión arterial es obligatoria.' })
    .regex(/^\d{2,3}\/\d{2,3}$/, 'Formato: 120/80'),

  edadMetabolica: z
    .number({ required_error: 'La edad metabólica es obligatoria.' })
    .int('La edad metabólica debe ser un número entero.')
    .positive('La edad metabólica debe ser positiva.'),

  fuerzaAgarre: z
    .number({ required_error: 'La fuerza de agarre es obligatoria.' })
    .positive('La fuerza de agarre debe ser positiva.'),

  resistenciaMuscular: z
    .string({ required_error: 'La resistencia muscular es obligatoria.' })
    .min(1, 'La resistencia muscular no puede estar vacía.'),

  rmEstimado: z
    .number({ required_error: 'El RM estimado es obligatorio.' })
    .positive('El RM estimado debe ser positivo.'),

  ppm: z
    .number({ required_error: 'Las PPM son obligatorias.' })
    .int('Las PPM deben ser un número entero.')
    .min(30, 'Las PPM mínimas son 30.')
    .max(250, 'Las PPM máximas son 250.'),

  // Contexto
  nivelActividadFisica: z
    .string({ required_error: 'El nivel de actividad física es obligatorio.' }),

  observacion: z
    .string()
    .optional(),

  objetivoUsuario: z
    .string({ required_error: 'El objetivo del usuario es obligatorio.' })
    .min(1, 'El objetivo del usuario no puede estar vacío.'),
})

export { createAssessmentSchema }
