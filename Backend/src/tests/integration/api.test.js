import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import request from 'supertest'
import app from '../../app.js'
import prisma from '../../config/database.js'

// Se testean los endpoints completos:
// Request HTTP → Router → Middleware → Controller → Service → BD
// =============================================

let createdUserId = null
let createdAssessmentId = null
let trainerToken = null

describe.skip('API Integration Tests', () => {

  // Limpieza de BD y crear entrenador para auth
  beforeAll(async () => {
    await prisma.assessment.deleteMany()
    await prisma.fingerprint.deleteMany()
    await prisma.user.deleteMany()

    const bcrypt = await import('bcrypt')
    const hashed = await bcrypt.hash('testpass123', 12)
    await prisma.user.create({
      data: {
        nombre: 'Entrenador Test',
        documento: 'CC 0000000001',
        email: 'entrenador.test@correo.com',
        telefono: '3000000001',
        eps: 'Sura',
        grupoSanguineo: 'A+',
        tipoDocumento: 'CC',
        contactoEmergencia: 'Test - 3000000001',
        programa: 'Educación Física',
        numeroCarnet: 'ENTR001',
        modalidad: 'presencial',
        jornada: 'diurna',
        semestre: 1,
        rol: 'entrenador',
        password: hashed,
        cuentaActivada: true,
      },
    })

    const loginRes = await request(app).post('/api/auth/login').send({
      email: 'entrenador.test@correo.com',
      password: 'testpass123',
    })
    trainerToken = loginRes.body.data?.token || null
  })

  afterAll(async () => {
    await prisma.assessment.deleteMany()
    await prisma.fingerprint.deleteMany()
    await prisma.user.deleteMany()
    await prisma.$disconnect()
  })
  
  // Health Check
  
  describe('GET /health', () => {
    it('debe retornar status ok', async () => {
      const res = await request(app).get('/health')
      expect(res.status).toBe(200)
      expect(res.body.status).toBe('ok')
      expect(res.body.timestamp).toBeDefined()
    })
  })
  
  // USUARIOS
  
  describe('POST /api/users', () => {
    it('debe crear un usuario con datos válidos', async () => {
      const res = await request(app)
        .post('/api/users')
        .send({
          nombre: 'Carlos Test',
          documento: 'CC 9988776655',
          email: 'carlos.test@correo.com',
          telefono: '3001112233',
          eps: 'Sura',
          grupoSanguineo: 'A+',
          contactoEmergencia: 'Ana Test - 3004445566',
          tipoDocumento: 'CC',
        programa: 'Ingeniería',
          numeroCarnet: '2020123456',
          modalidad: 'presencial',
          jornada: 'diurna',
          semestre: 3,
        })

      expect(res.status).toBe(201)
      expect(res.body.success).toBe(true)
      expect(res.body.data.user.nombre).toBe('Carlos Test')
      expect(res.body.data.user.id).toBeDefined()

      createdUserId = res.body.data.user.id
    })

    it('debe rechazar email duplicado', async () => {
      const res = await request(app)
        .post('/api/users')
        .send({
          nombre: 'Otro Usuario',
          documento: 'CC 1122334455',
          email: 'carlos.test@correo.com', // duplicado
          telefono: '3007778899',
          eps: 'Nueva EPS',
grupoSanguineo: 'B-',
        tipoDocumento: 'CC',
        contactoEmergencia: 'Pedro - 3001110000',
        programa: 'Derecho',
          numeroCarnet: '2020654321',
          modalidad: 'presencial',
          jornada: 'nocturna',
          semestre: 2,
        })

      expect(res.status).toBe(409)
    })

    it('debe rechazar datos inválidos con detalles de error', async () => {
      const res = await request(app)
        .post('/api/users')
        .send({
          nombre: 'X',
          documento: '12',
          email: 'noescorreo',
          telefono: '123',
          eps: '',
tipoDocumento: 'CC',
        grupoSanguineo: 'Z+',
        contactoEmergencia: 'ab',
        programa: '',
          numeroCarnet: '',
          modalidad: '',
          jornada: '',
          semestre: 99,
        })

      expect(res.status).toBe(400)
      expect(res.body.success).toBe(false)
      expect(res.body.details).toBeDefined()
      expect(res.body.details.length).toBeGreaterThan(0)
    })
  })

  describe('GET /api/users', () => {
    it('debe retornar lista de usuarios', async () => {
      const res = await request(app).get('/api/users').set('Authorization', `Bearer ${trainerToken}`)
      expect(res.status).toBe(200)
      expect(res.body.success).toBe(true)
      expect(Array.isArray(res.body.data.users)).toBe(true)
      expect(res.body.data.users.length).toBeGreaterThan(0)
    })
  })

  describe('GET /api/users/:id', () => {
    it('debe retornar un usuario por ID', async () => {
      const res = await request(app).get(`/api/users/${createdUserId}`).set('Authorization', `Bearer ${trainerToken}`)
      expect(res.status).toBe(200)
      expect(res.body.data.user.id).toBe(createdUserId)
    })

    it('debe retornar 404 para usuario inexistente', async () => {
      const res = await request(app).get('/api/users/id-que-no-existe').set('Authorization', `Bearer ${trainerToken}`)
      expect(res.status).toBe(404)
    })
  })
  
  // HUELLAS
  
  describe('POST /api/fingerprint/enroll', () => {
    it('debe registrar huella para un usuario existente', async () => {
      const fp = await prisma.fingerprint.findFirst({ where: { userId: createdUserId } })
      const template = fp?.template || 'A'.repeat(64)
      const res = await request(app)
        .post('/api/fingerprint/enroll')
        .set('Authorization', `Bearer ${trainerToken}`)
        .send({ userId: createdUserId, template })
      expect(res.status).toBe(201)
      expect(res.body.data.template).toBeDefined()
      expect(res.body.data.template).toHaveLength(64)
    })

    it('debe rechazar userId inválido', async () => {
      const res = await request(app)
        .post('/api/fingerprint/enroll')
        .set('Authorization', `Bearer ${trainerToken}`)
        .send({ userId: 'no-es-uuid' })

      expect(res.status).toBe(400)
    })
  })

  describe('POST /api/fingerprint/login', () => {
    it('debe autenticar con template similar (>90%)', async () => {
      const template = 'B'.repeat(64)
      await request(app)
        .post('/api/fingerprint/enroll')
        .set('Authorization', `Bearer ${trainerToken}`)
        .send({ userId: createdUserId, template })

      const mutated = template.split('')
      mutated[0] = 'C'
      mutated[1] = 'D'

      const res = await request(app)
        .post('/api/fingerprint/login')
        .send({ template: mutated.join('') })

      expect(res.status).toBe(200)
      expect(res.body.data.access).toBe(true)
      expect(res.body.data.similarity).toBeGreaterThan(90)
    })

    it('debe denegar acceso con template muy diferente', async () => {
      const fakeTemplate = 'X'.repeat(64)
      const res = await request(app)
        .post('/api/fingerprint/login')
        .send({ template: fakeTemplate })

      expect(res.status).toBe(200)
      expect(res.body.data.access).toBe(false)
    })

    it('debe rechazar template con longitud incorrecta', async () => {
      const res = await request(app)
        .post('/api/fingerprint/login')
        .send({ template: 'ABC' })

      expect(res.status).toBe(400)
    })
  })
  
  // VALORACIONES
  
  describe('POST /api/assessments', () => {
    it.skip('debe crear una valoración con datos válidos', async () => {
      const res = await request(app)
        .post('/api/assessments')
        .set('Authorization', `Bearer ${trainerToken}`)
        .send({
          userId: createdUserId,
          peso: 72.5,
          estatura: 175,
          grasaCorporal: 18.5,
          masaMuscular: 32,
          imc: 23.7,
          masaMagra: 59,
          aguaCorporal: 55.2,
          grasaVisceral: 7,
          presionArterial: '120/80',
          edadMetabolica: 24,
          fuerzaAgarre: 42,
          resistenciaMuscular: 'Buena',
          rmEstimado: 85,
          ppm: 68,
          nivelActividadFisica: 'moderado',
          objetivoUsuario: 'Mejorar resistencia',
        })

      expect(res.status).toBe(201)
      expect(res.body.success).toBe(true)
      expect(res.body.data.assessment.id).toBeDefined()

      createdAssessmentId = res.body.data.assessment.id
    })

    it('debe rechazar valoración con campos inválidos', async () => {
      const res = await request(app)
        .post('/api/assessments')
        .set('Authorization', `Bearer ${trainerToken}`)
        .send({
          userId: createdUserId,
          peso: -10,
          estatura: 0,
          grasaCorporal: 150,
          ppm: 500,
        })

      expect(res.status).toBe(400)
      expect(res.body.details).toBeDefined()
    })
  })

  describe('GET /api/assessments/:id', () => {
    it.skip('debe retornar una valoración por ID', async () => {
      const res = await request(app).get(`/api/assessments/${createdAssessmentId}`).set('Authorization', `Bearer ${trainerToken}`)
      expect(res.status).toBe(200)
      expect(res.body.data.assessment.peso).toBe(72.5)
    })
  })

  describe('GET /api/assessments/user/:userId', () => {
    it.skip('debe retornar las valoraciones de un usuario', async () => {
      const res = await request(app).get(`/api/assessments/user/${createdUserId}`).set('Authorization', `Bearer ${trainerToken}`)
      expect(res.status).toBe(200)
      expect(Array.isArray(res.body.data.assessments)).toBe(true)
      expect(res.body.data.assessments.length).toBeGreaterThan(0)
    })
  })
  
  // 404 - Ruta inexistente
  
  describe('Ruta inexistente', () => {
    it('debe retornar 404 para rutas no definidas', async () => {
      const res = await request(app).get('/api/ruta-que-no-existe')
      expect(res.status).toBe(404)
    })
  })
})
