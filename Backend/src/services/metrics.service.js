import prisma from '../config/database.js'

async function getByUserId(userId, options = {}) {
  const { from, to } = options

  const where = { userId }

  if (from || to) {
    where.createdAt = {}
    if (from) where.createdAt.gte = new Date(from)
    if (to) where.createdAt.lte = new Date(to)
  }

  return prisma.assessment.findMany({
    where,
    orderBy: { createdAt: 'asc' },
    select: {
      id: true,
      peso: true,
      grasaCorporal: true,
      masaMuscular: true,
      masaMagra: true,
      aguaCorporal: true,
      grasaVisceral: true,
      edadMetabolica: true,
      imc: true,
      createdAt: true,
    },
  })
}

export { getByUserId }
