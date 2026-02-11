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
    .string({ required_error: 'El contacto de emergencia es obligatorio.' })
    .min(5, 'El contacto de emergencia debe tener al menos 5 caracteres.')
    .max(200, 'El contacto de emergencia debe tener máximo 200 caracteres.')
    .trim(),

  carrera: z
    .string({ required_error: 'La carrera es obligatoria.' })
    .min(2, 'La carrera debe tener al menos 2 caracteres.')
    .max(100, 'La carrera debe tener máximo 100 caracteres.')
    .trim(),

  jornada: z
    .string({ required_error: 'La jornada es obligatoria.' })
    .trim(),

  semestre: z
    .number({ required_error: 'El semestre es obligatorio.' })
    .int('El semestre debe ser un número entero.')
    .min(1, 'El semestre mínimo es 1.')
    .max(12, 'El semestre máximo es 12.'),
})

export { createUserSchema }
