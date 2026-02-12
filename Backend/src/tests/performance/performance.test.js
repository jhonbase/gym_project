import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import request from 'supertest'
import app from '../../app.js'
import prisma from '../../config/database.js'

describe('Pruebas de Rendimiento', () => {

  let userId = null

  beforeAll(async () => {
    await prisma.assessment.deleteMany()
    await prisma.fingerprint.deleteMany()
    await prisma.user.deleteMany()

    // Crear usuario base para las pruebas

    const res = await request(app).post('/api/users').send({
      nombre: 'Perf Test User', documento: 'CC 6666666666',
      email: 'perf@test.com', telefono: '3006666666',
      eps: 'Sura', grupoSanguineo: 'O+',
      contactoEmergencia: 'Emergencia - 3009999999',
      carrera: 'Sistemas', jornada: 'diurna', semestre: 5,
    })
    userId = res.body.data.user.id

    // Enrollar huella
    await request(app).post('/api/fingerprint/enroll').send({ userId })
  })

  afterAll(async () => {
    await prisma.assessment.deleteMany()
    await prisma.fingerprint.deleteMany()
    await prisma.user.deleteMany()
    await prisma.$disconnect()
  })
  
  // Tiempo de respuesta individual
  
  describe('Tiempos de respuesta', () => {

    it('GET /health debe responder en menos de 100ms', async () => {
      const start = performance.now()
      await request(app).get('/health')
      const elapsed = performance.now() - start

      expect(elapsed).toBeLessThan(100)
      console.log(`  → /health: ${elapsed.toFixed(1)}ms`)
    })

    it('GET /api/users debe responder en menos de 500ms', async () => {
      const start = performance.now()
      await request(app).get('/api/users')
      const elapsed = performance.now() - start

      expect(elapsed).toBeLessThan(500)
      console.log(`  → GET /api/users: ${elapsed.toFixed(1)}ms`)
    })

    it('GET /api/users/:id debe responder en menos de 300ms', async () => {
      const start = performance.now()
      await request(app).get(`/api/users/${userId}`)
      const elapsed = performance.now() - start

      expect(elapsed).toBeLessThan(300)
      console.log(`  → GET /api/users/:id: ${elapsed.toFixed(1)}ms`)
    })

    it('POST /api/users debe responder en menos de 500ms', async () => {
      const start = performance.now()
      await request(app).post('/api/users').send({
        nombre: 'Speed Test', documento: 'CC 1231231230',
        email: 'speed@test.com', telefono: '3001231230',
        eps: 'Sura', grupoSanguineo: 'A+',
        contactoEmergencia: 'Speed Contact - 3009876543',
        carrera: 'Química', jornada: 'diurna', semestre: 2,
      })
      const elapsed = performance.now() - start

      expect(elapsed).toBeLessThan(500)
      console.log(`  → POST /api/users: ${elapsed.toFixed(1)}ms`)
    })

    it('POST /api/fingerprint/login debe responder en menos de 500ms', async () => {
      const fp = await prisma.fingerprint.findFirst({ where: { userId } })
      const mutated = fp.template.split('')
      mutated[0] = mutated[0] === 'A' ? 'B' : 'A'

      const start = performance.now()
      await request(app).post('/api/fingerprint/login').send({ template: mutated.join('') })
      const elapsed = performance.now() - start

      expect(elapsed).toBeLessThan(500)
      console.log(`  → POST /fingerprint/login: ${elapsed.toFixed(1)}ms`)
    })
  })
  
  // Carga concurrente
  
  describe('Pruebas de carga concurrente', () => {

    it('debe manejar 20 requests GET simultáneos a /health', async () => {
      const concurrency = 20

      const start = performance.now()
      const promises = Array.from({ length: concurrency }, () =>
        request(app).get('/health')
      )
      const results = await Promise.all(promises)
      const elapsed = performance.now() - start

      // Todos deben ser exitosos
      results.forEach(res => {
        expect(res.status).toBe(200)
      })

      // Todos deben resolverse en menos de 2 segundos
      expect(elapsed).toBeLessThan(2000)
      console.log(`  → ${concurrency} requests concurrentes /health: ${elapsed.toFixed(1)}ms (${(elapsed / concurrency).toFixed(1)}ms/req)`)
    })

    it('debe manejar 10 requests GET simultáneos a /api/users', async () => {
      const concurrency = 10

      const start = performance.now()
      const promises = Array.from({ length: concurrency }, () =>
        request(app).get('/api/users')
      )
      const results = await Promise.all(promises)
      const elapsed = performance.now() - start

      results.forEach(res => {
        expect(res.status).toBe(200)
      })

      expect(elapsed).toBeLessThan(3000)
      console.log(`  → ${concurrency} requests concurrentes /api/users: ${elapsed.toFixed(1)}ms (${(elapsed / concurrency).toFixed(1)}ms/req)`)
    })

    it('debe manejar 10 requests de login simultáneos', async () => {
      const fp = await prisma.fingerprint.findFirst({ where: { userId } })
      const concurrency = 10

      const start = performance.now()
      const promises = Array.from({ length: concurrency }, (_, i) => {
        const mutated = fp.template.split('')
        mutated[i % 64] = mutated[i % 64] === 'A' ? 'B' : 'A'
        return request(app).post('/api/fingerprint/login').send({ template: mutated.join('') })
      })
      const results = await Promise.all(promises)
      const elapsed = performance.now() - start

      results.forEach(res => {
        expect(res.status).toBe(200)
      })

      expect(elapsed).toBeLessThan(5000)
      console.log(`  → ${concurrency} logins concurrentes: ${elapsed.toFixed(1)}ms (${(elapsed / concurrency).toFixed(1)}ms/req)`)
    })
  })
  
  // Creación masiva de registros
  
  describe('Carga de escritura', () => {

    it('debe crear 15 valoraciones secuenciales en menos de 10s', async () => {
      const start = performance.now()

      for (let i = 0; i < 15; i++) {
        const res = await request(app).post('/api/assessments').send({
          userId, peso: 70 + i, estatura: 170,
          grasaCorporal: 18, masaMuscular: 30, imc: 24,
          masaMagra: 57, aguaCorporal: 55, grasaVisceral: 5,
          presionArterial: '120/80', edadMetabolica: 25,
          fuerzaAgarre: 40, resistenciaMuscular: 'Buena',
          rmEstimado: 80, ppm: 70,
          nivelActividadFisica: 'moderado',
          objetivoUsuario: `Test rendimiento ${i + 1}`,
        })
        expect(res.status).toBe(201)
      }

      const elapsed = performance.now() - start
      expect(elapsed).toBeLessThan(10000)
      console.log(`  → 15 valoraciones secuenciales: ${elapsed.toFixed(1)}ms (${(elapsed / 15).toFixed(1)}ms/valoración)`)
    })
  })
})