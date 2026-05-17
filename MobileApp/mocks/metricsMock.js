const today = new Date()

function weeksAgo(n) {
  const d = new Date(today)
  d.setDate(d.getDate() - n * 7)
  return d.toISOString()
}

export const mockUser = {
  nombre: 'Carlos',
  genero: 'masculino',
}

const mockMetricas = [
  {
    createdAt: weeksAgo(3),
    peso: 75.0,
    grasaCorporal: 28,
    imc: 25.5,
    masaMuscular: 32.0,
    masaMagra: 54.0,
    aguaCorporal: 58,
    grasaVisceral: 12,
    edadMetabolica: 28,
  },
  {
    createdAt: weeksAgo(2),
    peso: 74.5,
    grasaCorporal: 26,
    imc: 25.2,
    masaMuscular: 32.3,
    masaMagra: 54.5,
    aguaCorporal: 59,
    grasaVisceral: 11,
    edadMetabolica: 27,
  },
  {
    createdAt: weeksAgo(1),
    peso: 74.2,
    grasaCorporal: 24,
    imc: 24.9,
    masaMuscular: 32.5,
    masaMagra: 54.8,
    aguaCorporal: 60,
    grasaVisceral: 10,
    edadMetabolica: 26,
  },
  {
    createdAt: weeksAgo(0),
    peso: 74.0,
    grasaCorporal: 22,
    imc: 24.7,
    masaMuscular: 32.8,
    masaMagra: 55.2,
    aguaCorporal: 48,
    grasaVisceral: 11,
    edadMetabolica: 25,
  },
]

export default mockMetricas