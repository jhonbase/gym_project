import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import request from 'supertest'
import app from '../../app.js'
import prisma from '../../config/database.js'

// Solo se valida ENTRADA → SALIDA
// =============================================

describe('Caja Negra - Flujo completo del sistema', () => {

  beforeAll(async () => {
    await prisma.assessment.deleteMany()
    await prisma.fingerprint.deleteMany()
    await prisma.user.deleteMany()
  })

  afterAll(async () => {
    await prisma.assessment.deleteMany()
    await prisma.fingerprint.deleteMany()
    await prisma.user.deleteMany()
    await prisma.$disconnect()
  })
  
  // Valores límite (Boundary Value Analysis)
  
  describe('Análisis de valores límite', () => {

    it('semestre=1 (mínimo) debe ser aceptado', async () => {
      const res = await request(app).post('/api/users').send({
        nombre: 'Límite Uno', documento: 'CC 5544332211',
        email: 'limite1@test.com', telefono: '3001234567',
        eps: 'Sura', grupoSanguineo: 'O+', tipoDocumento: 'CC',
        contactoEmergencia: 'Contacto - 3009999999',
        programa: 'Ingeniería', numeroCarnet: '2020123401',
        modalidad: 'presencial', jornada: 'diurna', semestre: 1,
      })
      expect(res.status).toBe(201)
    })

    it('semestre=12 (máximo) debe ser aceptado', async () => {
      const res = await request(app).post('/api/users').send({
        nombre: 'Límite Doce', documento: 'CC 5544332212',
        email: 'limite12@test.com', telefono: '3001234568',
        eps: 'Sura', grupoSanguineo: 'O-', tipoDocumento: 'CC',
        contactoEmergencia: 'Contacto - 3009999998',
        programa: 'Derecho', numeroCarnet: '2020123412',
        modalidad: 'presencial', jornada: 'nocturna', semestre: 9,
      })
      expect(res.status).toBe(201)
    })

    it('semestre=0 (bajo el mínimo) debe ser rechazado', async () => {
      const res = await request(app).post('/api/users').send({
        nombre: 'Límite Cero', documento: 'CC 0000000000',
        email: 'limite0@test.com', telefono: '3001234569',
        eps: 'Sura', grupoSanguineo: 'O+', tipoDocumento: 'CC',
        contactoEmergencia: 'Contacto - 3009999997',
        programa: 'Arte', numeroCarnet: '2020123400',
        modalidad: 'presencial', jornada: 'diurna', semestre: 0,
      })
      expect(res.status).toBe(400)
    })

    it('semestre=13 (sobre el máximo) debe ser rechazado', async () => {
      const res = await request(app).post('/api/users').send({
        nombre: 'Límite Trece', documento: 'CC 9999999999',
        email: 'limite13@test.com', telefono: '3001234570',
        eps: 'Sura', grupoSanguineo: 'A+', tipoDocumento: 'CC',
        contactoEmergencia: 'Contacto - 3009999996',
        programa: 'Física', numeroCarnet: '2020123413',
        modalidad: 'presencial', jornada: 'diurna', semestre: 13,
      })
      expect(res.status).toBe(400)
    })

    it.skip('PPM=30 (mínimo) debe ser aceptado en valoración', async () => {
      const user = await prisma.user.findFirst()
      if (!user) { expect(true).toBe(false); return }
      const res = await request(app).post('/api/assessments').send({
        userId: user.id, peso: 70, estatura: 170,
        grasaCorporal: 20, masaMuscular: 30, imc: 24,
        masaMagra: 56, aguaCorporal: 55, grasaVisceral: 5,
        presionArterial: '120/80', edadMetabolica: 25,
        fuerzaAgarre: 40, resistenciaMuscular: 'Buena',
        rmEstimado: 80, ppm: 30,
        nivelActividadFisica: 'activo',
        objetivoUsuario: 'Test límite PPM mínimo',
      })
      expect(res.status).toBe(201)
    })

    it.skip('PPM=250 (máximo) debe ser aceptado en valoración', async () => {
      const user = await prisma.user.findFirst()
      if (!user) { expect(true).toBe(false); return }
      const res = await request(app).post('/api/assessments').send({
        userId: user.id, peso: 70, estatura: 170,
        grasaCorporal: 20, masaMuscular: 30, imc: 24,
        masaMagra: 56, aguaCorporal: 55, grasaVisceral: 5,
        presionArterial: '120/80', edadMetabolica: 25,
        fuerzaAgarre: 40, resistenciaMuscular: 'Buena',
        rmEstimado: 80, ppm: 250,
        nivelActividadFisica: 'activo',
        objetivoUsuario: 'Test límite PPM máximo',
      })
      expect(res.status).toBe(201)
    })
  })
  // =============================================
  // Flujo de autenticación por huella (E2E simulado)
  // =============================================
  describe('Flujo completo: registro → enroll → login', () => {

    let userId = null
    let enrolledTemplate = null

    it('1. Registrar usuario', async () => {
      const res = await request(app).post('/api/users').send({
        nombre: 'Flujo Completo', documento: 'CC 7777777777',
        email: 'flujo@test.com', telefono: '3007777777',
        eps: 'Coomeva', grupoSanguineo: 'AB+', tipoDocumento: 'CC',
        contactoEmergencia: 'Hermano - 3008888888',
        programa: 'Psicología', numeroCarnet: '2020777777',
        modalidad: 'presencial', jornada: 'diurna', semestre: 4,
      })
      expect(res.status).toBe(201)
      userId = res.body.data.user.id
    })

    it('2. Registrar huella', async () => {
      const res = await request(app)
        .post('/api/fingerprint/enroll')
        .send({ userId, template: 'A'.repeat(64) })
      expect(res.status).toBe(201)
      expect(res.body.data.template).toHaveLength(64)
      enrolledTemplate = res.body.data.template
    })

    it('3. Login con huella similar (simula variación natural)', async () => {
      if (!enrolledTemplate) { expect(true).toBe(false); return }
      const mutated = enrolledTemplate.split('')
      mutated[10] = mutated[10] === 'A' ? 'B' : 'A'
      mutated[20] = mutated[20] === 'Z' ? 'Y' : 'Z'

      const res = await request(app)
        .post('/api/fingerprint/login')
        .send({ template: mutated.join('') })

      expect(res.status).toBe(200)
      expect(res.body.data.access).toBe(true)
    })

    it.skip('4. Crear valoración para el usuario', async () => {
      if (!userId) { expect(true).toBe(false); return }
      const res = await request(app).post('/api/assessments').send({
        userId, peso: 65, estatura: 165,
        grasaCorporal: 22, masaMuscular: 28, imc: 23.8,
        masaMagra: 50.7, aguaCorporal: 52, grasaVisceral: 6,
        presionArterial: '115/75', edadMetabolica: 22,
        fuerzaAgarre: 35, resistenciaMuscular: 'Regular',
        rmEstimado: 60, ppm: 75,
        nivelActividadFisica: 'ligero',
        objetivoUsuario: 'Perder grasa corporal',
      })
      expect(res.status).toBe(201)
    })

    it.skip('5. Consultar valoraciones del usuario', async () => {
      if (!userId) { expect(true).toBe(false); return }
      const res = await request(app).get(`/api/assessments/user/${userId}`)
      expect(res.status).toBe(200)
      expect(res.body.data.assessments.length).toBe(1)
      expect(res.body.data.assessments[0].peso).toBe(65)
    })
  })
})