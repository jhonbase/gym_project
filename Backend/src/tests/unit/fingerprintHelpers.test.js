import { describe, it, expect } from 'vitest'
import {
  generateTemplate,
  mutateTemplate,
  calculateSimilarity,
} from '../../utils/fingerprintHelpers.js'

describe('fingerprintHelpers', () => {
  
  // generar Template
  
  describe('generateTemplate', () => {
    it('debe generar un template de exactamente 64 caracteres', () => {
      const template = generateTemplate()
      expect(template).toHaveLength(64)
    })

    it('debe contener solo caracteres A-Z y 0-9', () => {
      const template = generateTemplate()
      expect(template).toMatch(/^[A-Z0-9]+$/)
    })

    it('debe generar templates diferentes en cada llamada', () => {
      const t1 = generateTemplate()
      const t2 = generateTemplate()
      // Estadísticamente imposible que sean iguales
      expect(t1).not.toBe(t2)
    })
  })
  
  // mutar Template

  describe('mutateTemplate', () => {
    it('debe retornar un template de la misma longitud', () => {
      const original = generateTemplate()
      const mutated = mutateTemplate(original)
      expect(mutated).toHaveLength(original.length)
    })

    it('debe diferir del original en máximo 3 posiciones', () => {
      const original = generateTemplate()
      const mutated = mutateTemplate(original)

      let differences = 0
      for (let i = 0; i < original.length; i++) {
        if (original[i] !== mutated[i]) differences++
      }

      expect(differences).toBeLessThanOrEqual(3)
    })

    it('debe mantener similitud mayor al 90%', () => {
      const original = generateTemplate()
      const mutated = mutateTemplate(original)
      const similarity = calculateSimilarity(original, mutated)
      expect(similarity).toBeGreaterThanOrEqual(90)
    })

    it('debe contener solo caracteres válidos A-Z y 0-9', () => {
      const original = generateTemplate()
      const mutated = mutateTemplate(original)
      expect(mutated).toMatch(/^[A-Z0-9]+$/)
    })
  })
  
  // calcular Similaridad
  
  describe('calculateSimilarity', () => {
    it('debe retornar 100% para templates idénticos', () => {
      const template = generateTemplate()
      expect(calculateSimilarity(template, template)).toBe(100)
    })

    it('debe retornar 0% para templates completamente diferentes', () => {
      const t1 = 'A'.repeat(64)
      const t2 = '0'.repeat(64)
      expect(calculateSimilarity(t1, t2)).toBe(0)
    })

    it('debe retornar 50% cuando la mitad coincide', () => {
      const t1 = 'A'.repeat(32) + '0'.repeat(32)
      const t2 = 'A'.repeat(32) + '1'.repeat(32)
      expect(calculateSimilarity(t1, t2)).toBe(50)
    })

    it('debe retornar 0 si un template es null', () => {
      expect(calculateSimilarity(null, 'ABC')).toBe(0)
    })

    it('debe retornar 0 si un template es undefined', () => {
      expect(calculateSimilarity(undefined, 'ABC')).toBe(0)
    })

    it('debe retornar 0 si los templates tienen diferente longitud', () => {
      expect(calculateSimilarity('ABC', 'ABCD')).toBe(0)
    })

    it('debe calcular correctamente con strings cortos', () => {
      // 5 de 6 coinciden = 83.33%
      expect(calculateSimilarity('ABCDEF', 'ABCDEX')).toBeCloseTo(83.33, 1)
    })
  })
})
