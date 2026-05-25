import { z } from 'zod/v4'

const baseSchema = {
  peso: z.number().positive().max(500).optional(),
  estatura: z.number().positive().max(300).optional(),
  grasaCorporal: z.number().min(0).max(100).optional(),
  masaMuscular: z.number().positive().optional(),
  imc: z.number().positive().optional(),
  masaMagra: z.number().positive().optional().nullable(),
  aguaCorporal: z.number().min(0).max(100).optional().nullable(),
  grasaVisceral: z.number().int().min(1).max(59).optional(),
  presionArterial: z.string().regex(/^\d{2,3}\/\d{2,3}$/).optional(),
  edadMetabolica: z.number().int().positive().optional(),
  fuerzaAgarre: z.number().positive().optional(),
  resistenciaMuscular: z.string().min(1).optional(),
  rmEstimado: z.number().positive().optional(),
  ppm: z.number().int().min(30).max(250).optional(),
  lesionesEvidencia: z.array(z.string()).optional(),
  lesionDescripcion: z.string().optional().nullable(),
  historialClinico: z.string().optional().nullable(),
  anteOsteomuscular: z.coerce.boolean().optional(),
  anteOsteomuscularDesc: z.string().optional().nullable(),
  anteCardiovascular: z.coerce.boolean().optional(),
  anteCardiovascularDesc: z.string().optional().nullable(),
  anteRespiratorio: z.coerce.boolean().optional(),
  anteRespiratorioDesc: z.string().optional().nullable(),
  anteMetabolico: z.coerce.boolean().optional(),
  anteMetabolicoDesc: z.string().optional().nullable(),
  antePsiquiatrico: z.coerce.boolean().optional(),
  antePsiquiatricoDesc: z.string().optional().nullable(),
  antePsicologico: z.coerce.boolean().optional(),
  antePsicologicoDesc: z.string().optional().nullable(),
  nivelActividadFisica: z.string().optional(),
  diasDisponibles: z.array(z.string()).optional(),
  observacion: z.string().optional().nullable(),
  objetivoUsuario: z.string().min(1).optional(),
  proximaFechaValoracion: z.string().datetime().optional().nullable(),
  indicaciones: z.array(z.object({
    tipo: z.enum(['mejora', 'restriccion', 'recomendacion', 'seguir']),
    texto: z.string().min(1)
  })).optional()
}

const createAssessmentSchema = z.object({
  userId: z.string({ required_error: 'El userId es obligatorio.' }).uuid('Debe ser un UUID válido.'),
  ...baseSchema,
})

const updateAssessmentSchema = z.object(baseSchema)

export { createAssessmentSchema, updateAssessmentSchema }