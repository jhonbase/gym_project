import { describe, it, expect } from 'vitest'
import { createUserSchema } from '../../validations/user.validation.js'
import { createAssessmentSchema } from '../../validations/assessment.validation.js'
import { enrollSchema, loginSchema } from '../../validations/fingerprint.validation.js'

// =============================================
// CAJA BLANCA: Validamos todos los caminos
// de cada schema Zod
// =============================================

describe('Validaciones Zod - User', () => {

  const validUser = {
    nombre: 'Juan Pérez',
    documento: '1234567890',
    tipoDocumento: 'CC',
    fechaNacimiento: '2000-05-15',
    email: 'juan@correo.com',
    telefono: '3001234567',
    eps: 'Sura',
    grupoSanguineo: 'O+',
    contactoEmergencia: 'María López - 3009876543',
    programa: 'Ingeniería de Sistemas',
    numeroCarnet: '202012345',
    modalidad: 'Presencial',
    jornada: 'diurna',
    semestre: 5,
  }

  it('debe aceptar un usuario válido', () => {
    const result = createUserSchema.safeParse(validUser)
    expect(result.success).toBe(true)
  })

  it('debe rechazar nombre vacío', () => {
    const result = createUserSchema.safeParse({ ...validUser, nombre: '' })
    expect(result.success).toBe(false)
  })

  it('debe rechazar nombre con menos de 2 caracteres', () => {
    const result = createUserSchema.safeParse({ ...validUser, nombre: 'A' })
    expect(result.success).toBe(false)
  })

  it('debe rechazar documento con menos de 5 caracteres', () => {
    const result = createUserSchema.safeParse({ ...validUser, documento: '123' })
    expect(result.success).toBe(false)
  })

  it('debe rechazar email inválido', () => {
    const result = createUserSchema.safeParse({ ...validUser, email: 'noesuncorreo' })
    expect(result.success).toBe(false)
  })

  it('debe convertir email a minúsculas', () => {
    const result = createUserSchema.safeParse({ ...validUser, email: 'JUAN@CORREO.COM' })
    expect(result.success).toBe(true)
    expect(result.data.email).toBe('juan@correo.com')
  })

  it('debe rechazar teléfono menor a 10 dígitos', () => {
    const result = createUserSchema.safeParse({ ...validUser, telefono: '123' })
    expect(result.success).toBe(false)
  })

  it('debe rechazar grupo sanguíneo inválido', () => {
    const result = createUserSchema.safeParse({ ...validUser, grupoSanguineo: 'Z+' })
    expect(result.success).toBe(false)
  })

  it('debe aceptar todos los grupos sanguíneos válidos', () => {
    const valid = ['O+', 'O-', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-']
    valid.forEach(g => {
      const result = createUserSchema.safeParse({ ...validUser, grupoSanguineo: g })
      expect(result.success).toBe(true)
    })
  })

  it('debe rechazar semestre fuera de rango', () => {
    expect(createUserSchema.safeParse({ ...validUser, semestre: 0 }).success).toBe(false)
    expect(createUserSchema.safeParse({ ...validUser, semestre: 13 }).success).toBe(false)
  })

  it('debe rechazar semestre decimal', () => {
    const result = createUserSchema.safeParse({ ...validUser, semestre: 3.5 })
    expect(result.success).toBe(false)
  })

  it('debe rechazar si falta un campo obligatorio', () => {
    const { nombre, ...sinNombre } = validUser
    const result = createUserSchema.safeParse(sinNombre)
    expect(result.success).toBe(false)
  })
})

describe('Validaciones Zod - Fingerprint', () => {

  it('debe aceptar un UUID válido para enroll', () => {
    const result = enrollSchema.safeParse({ userId: '550e8400-e29b-41d4-a716-446655440000' })
    expect(result.success).toBe(true)
  })

  it('debe aceptar un userId que no sea UUID', () => {
    const result = enrollSchema.safeParse({ userId: 'no-es-uuid' })
    expect(result.success).toBe(true)
  })

  it('debe aceptar un template válido de 64 caracteres para login', () => {
    const template = 'A'.repeat(64)
    const result = loginSchema.safeParse({ template })
    expect(result.success).toBe(true)
  })

  it('debe rechazar template de longitud incorrecta', () => {
    const result = loginSchema.safeParse({ template: 'ABC' })
    expect(result.success).toBe(false)
  })

  it('debe rechazar template con caracteres inválidos', () => {
    const result = loginSchema.safeParse({ template: 'a'.repeat(64) })
    expect(result.success).toBe(false)
  })
})

describe('Validaciones Zod - Assessment', () => {

  const validAssessment = {
    userId: '550e8400-e29b-41d4-a716-446655440000',
    peso: 70.5,
    estatura: 175,
    grasaCorporal: 18.5,
    masaMuscular: 32,
    imc: 23.1,
    masaMagra: 57.5,
    aguaCorporal: 55,
    grasaVisceral: 8,
    presionArterial: '120/80',
    edadMetabolica: 25,
    fuerzaAgarre: 40,
    resistenciaMuscular: 'Buena',
    rmEstimado: 80,
    ppm: 72,
    nivelActividadFisica: 'moderado',
    objetivoUsuario: 'Ganar masa muscular',
  }

  it('debe aceptar una valoración válida', () => {
    const result = createAssessmentSchema.safeParse(validAssessment)
    expect(result.success).toBe(true)
  })

  it('debe aceptar observación opcional', () => {
    const result = createAssessmentSchema.safeParse({
      ...validAssessment,
      observacion: 'Paciente con lesión previa',
    })
    expect(result.success).toBe(true)
  })

  it('debe rechazar grasa corporal mayor a 100%', () => {
    const result = createAssessmentSchema.safeParse({ ...validAssessment, grasaCorporal: 101 })
    expect(result.success).toBe(false)
  })

  it('debe rechazar ppm fuera de rango', () => {
    expect(createAssessmentSchema.safeParse({ ...validAssessment, ppm: 29 }).success).toBe(false)
    expect(createAssessmentSchema.safeParse({ ...validAssessment, ppm: 251 }).success).toBe(false)
  })

  it('debe rechazar grasa visceral fuera de rango', () => {
    expect(createAssessmentSchema.safeParse({ ...validAssessment, grasaVisceral: 0 }).success).toBe(false)
    expect(createAssessmentSchema.safeParse({ ...validAssessment, grasaVisceral: 60 }).success).toBe(false)
  })

  it('debe rechazar presión arterial con formato inválido', () => {
    const result = createAssessmentSchema.safeParse({ ...validAssessment, presionArterial: 'alta' })
    expect(result.success).toBe(false)
  })

  it('debe rechazar peso negativo', () => {
    const result = createAssessmentSchema.safeParse({ ...validAssessment, peso: -5 })
    expect(result.success).toBe(false)
  })
})
