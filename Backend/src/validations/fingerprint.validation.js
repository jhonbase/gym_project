import { z } from 'zod/v4'

// Para el enrolamiento: solo necesitamos el userId
const enrollSchema = z.object({
  userId: z
    .string({ required_error: 'El userId es obligatorio.' })
    .uuid('Debe ser un UUID válido.'),
})

const loginSchema = z.object({
  template: z
    .string({ required_error: 'El template es obligatorio.' })
    .length(64, 'El template debe tener exactamente 64 caracteres.')
    .regex(/^[A-Z0-9]+$/, 'El template solo puede contener letras mayúsculas y números.'),
})

export { enrollSchema, loginSchema }
