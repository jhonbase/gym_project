import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import request from 'supertest'
import app from '../../app.js'
import prisma from '../../config/database.js'

// Se testean los endpoints completos:
// Request HTTP → Router → Middleware → Controller → Service → BD
// =============================================

let createdUserId = null
let createdAssessmentId = null

describe('API Integration Tests', () => {

  // Limpieza de BD antes de todas las pruebas
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
          carrera: 'Ingeniería',
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
          contactoEmergencia: 'Pedro - 3001110000',
          carrera: 'Derecho',
          jornada: 'nocturna',
          semestre: 1,
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
          grupoSanguineo: 'Z+',
          contactoEmergencia: 'ab',
          carrera: '',
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
      const res = await request(app).get('/api/users')
      expect(res.status).toBe(200)
      expect(res.body.success).toBe(true)
      expect(Array.isArray(res.body.data.users)).toBe(true)
      expect(res.body.data.users.length).toBeGreaterThan(0)
    })
  })

  describe('GET /api/users/:id', () => {
    it('debe retornar un usuario por ID', async () => {
      const res = await request(app).get(`/api/users/${createdUserId}`)
      expect(res.status).toBe(200)
      expect(res.body.data.user.id).toBe(createdUserId)
    })

    it('debe retornar 404 para usuario inexistente', async () => {
      const res = await request(app).get('/api/users/id-que-no-existe')
      expect(res.status).toBe(404)
    })
  })
  
  // HUELLAS
  
  describe('POST /api/fingerprint/enroll', () => {
    it('debe registrar huella para un usuario existente', async () => {
      const res = await request(app)
        .post('/api/fingerprint/enroll')
        .send({ userId: createdUserId })

      expect(res.status).toBe(201)
      expect(res.body.data.template).toBeDefined()
      expect(res.body.data.template).toHaveLength(64)
      expect(res.body.data.source).toBe('local')
    })

    it('debe rechazar userId inválido', async () => {
      const res = await request(app)
        .post('/api/fingerprint/enroll')
        .send({ userId: 'no-es-uuid' })

      expect(res.status).toBe(400)
    })
  })

  describe('POST /api/fingerprint/login', () => {
    it('debe autenticar con template similar (>90%)', async () => {
      // Obtener el template original del usuario
      const user = await prisma.fingerprint.findFirst({
        where: { userId: createdUserId },
      })

      // Mutar solo 2 caracteres (similitud ~96.8%)
      const mutated = user.template.split('')
      mutated[0] = mutated[0] === 'A' ? 'B' : 'A'
      mutated[1] = mutated[1] === 'Z' ? 'Y' : 'Z'

      const res = await request(app)
        .post('/api/fingerprint/login')
        .send({ template: mutated.join('') })

      expect(res.status).toBe(200)
      expect(res.body.data.access).toBe(true)
      expect(res.body.data.similarity).toBeGreaterThan(90)
      expect(res.body.data.user.nombre).toBe('Carlos Test')
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
    it('debe crear una valoración con datos válidos', async () => {
      const res = await request(app)
        .post('/api/assessments')
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
    it('debe retornar una valoración por ID', async () => {
      const res = await request(app).get(`/api/assessments/${createdAssessmentId}`)
      expect(res.status).toBe(200)
      expect(res.body.data.assessment.peso).toBe(72.5)
    })
  })

  describe('GET /api/assessments/user/:userId', () => {
    it('debe retornar las valoraciones de un usuario', async () => {
      const res = await request(app).get(`/api/assessments/user/${createdUserId}`)
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
