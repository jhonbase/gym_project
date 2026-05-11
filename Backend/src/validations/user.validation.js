import { z } from 'zod/v4'

const createUserSchema = z.object({
  nombre: z
    .string({ required_error: 'El nombre es obligatorio.' })
    .min(2, 'El nombre debe tener al menos 2 caracteres.')
    .max(100, 'El nombre debe tener máximo 100 caracteres.')
    .trim(),

  documento: z
    .string({ required_error: 'El documento es obligatorio.' })
    .min(5, 'El documento debe tener al menos 5 caracteres.')
    .max(20, 'El documento debe tener máximo 20 caracteres.')
    .trim(),

  tipoDocumento: z
    .string()
    .optional(),

  fechaNacimiento: z
    .string()
    .optional(),

  email: z
    .string({ required_error: 'El correo es obligatorio.' })
    .email('Debe ser un correo electrónico válido.')
    .trim()
    .toLowerCase(),

  telefono: z
    .string({ required_error: 'El teléfono es obligatorio.' })
    .min(7, 'El teléfono debe tener al menos 7 dígitos.')
    .max(15, 'El teléfono debe tener máximo 15 dígitos.')
    .trim(),

  eps: z
    .string({ required_error: 'La EPS es obligatoria.' })
    .min(2, 'La EPS debe tener al menos 2 caracteres.')
    .max(100, 'La EPS debe tener máximo 100 caracteres.')
    .trim(),

  grupoSanguineo: z
    .string({ required_error: 'El grupo sanguíneo es obligatorio.' })
    .regex(
      /^(A|B|AB|O)[+-]$/,
      'El grupo sanguíneo debe ser: A+, A-, B+, B-, AB+, AB-, O+, O-'
    ),

  contactoEmergencia: z
    .string()
    .optional(),

  programa: z
    .string({ required_error: 'El programa es obligatorio.' })
    .min(2, 'El programa debe tener al menos 2 caracteres.')
    .max(100, 'El programa debe tener máximo 100 caracteres.')
    .trim(),

  numeroCarnet: z
    .string({ required_error: 'El número de carnet es obligatorio.' })
    .min(1, 'El número de carnet no puede estar vacío.')
    .max(50, 'El número de carnet debe tener máximo 50 caracteres.')
    .trim(),

  modalidad: z
    .string({ required_error: 'La modalidad es obligatoria.' })
    .min(2, 'La modalidad debe tener al menos 2 caracteres.')
    .max(50, 'La modalidad debe tener máximo 50 caracteres.')
    .trim(),

  jornada: z
    .string({ required_error: 'La jornada es obligatoria.' })
    .trim(),

  semestre: z
    .coerce
    .number({ required_error: 'El semestre es obligatorio.' })
    .int('El semestre debe ser un número entero.')
    .min(1, 'El semestre mínimo es 1.')
    .max(9, 'El semestre máximo es 9.'),

  esEgresado: z
    .coerce
    .boolean({ required_error: 'El estado de egresado es obligatorio.' })
    .optional()
    .default(false),

  certificadoEps: z
    .string()
    .optional(),

  genero: z
    .enum(['masculino', 'femenino', 'otro'])
    .optional(),

  generoOtro: z
    .string()
    .max(100)
    .trim()
    .optional(),

  institucion: z
    .enum(['Universitaria de Colombia', 'Universitaria de Bogotá'])
    .optional(),
})

export { createUserSchema }
