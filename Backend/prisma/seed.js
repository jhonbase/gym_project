import prisma from '../src/config/database.js'
import bcrypt from 'bcrypt'

const SALT_ROUNDS = 10

async function main() {
  const email = 'entrenadOR@unifit.edu'
  const password = 'gym2024'
  const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS)

  const existingUser = await prisma.user.findUnique({
    where: { email },
  })

  if (existingUser) {
    console.log('El usuario ya existe:', email)
    return
  }

  const user = await prisma.user.create({
    data: {
      nombre: 'Entrenador',
      documento: '9999999999',
      numeroCarnet: '9999999999',
      email,
      telefono: '3000000000',
      eps: 'no aplica',
      grupoSanguineo: 'N/A',
      contactoEmergencia: 'no aplica',
      programa: 'no aplica',
      modalidad: 'no aplica',
      jornada: 'no aplica',
      semestre: 0,
      esEgresado: false,
      rol: 'entrenador',
      password: hashedPassword,
      tipoDocumento: 'no aplica'
    },
  })

  console.log('Usuario creado:', user.email, '- Rol:', user.rol)
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error('Error:', e)
    await prisma.$disconnect()
    process.exit(1)
  })