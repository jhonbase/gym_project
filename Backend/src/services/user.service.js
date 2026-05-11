import prisma from '../config/database.js'

/**
 * Crea un nuevo usuario con todos los campos del registro universitario.
 */
async function createUser(data) {
  return prisma.user.create({ data })
}

/**
 * Obtiene todos los usuarios con sus huellas asociadas.
 * Soporta filtro por rol.
 */
async function getAllUsers(rol = null) {
  const where = rol ? { rol } : {}
  return prisma.user.findMany({
    where,
    include: { fingerprints: true, assessments: true },
  })
}

/**
 * Obtiene un usuario por su ID, incluyendo huellas y valoraciones.
 */
async function getUserById(id) {
  return prisma.user.findUnique({
    where: { id },
    include: {
      fingerprints: true,
      assessments: {
        orderBy: { createdAt: 'desc' },
      },
    },
  })
}

/**
 * Obtiene un usuario por su email.
 */
async function getUserByEmail(email) {
  return prisma.user.findUnique({
    where: { email },
  })
}

async function updateUser(id, data) {
  return prisma.user.update({
    where: { id },
    data,
  })
}

async function deleteUser(id) {
  return prisma.user.delete({
    where: { id },
  })
}

async function generarTokenActivacion(id) {
  const token = crypto.randomUUID()
  const expira = new Date(Date.now() + 60 * 60 * 1000)
  return prisma.user.update({
    where: { id },
    data: { tokenActivacion: token, tokenActivacionExpira: expira },
  })
}

async function validarTokenActivacion(token) {
  console.log('=== VALIDAR TOKEN SERVICE ===')
  console.log('buscando token:', token)
  console.log('expira después de:', new Date())
  
  const result = await prisma.user.findFirst({
    where: {
      tokenActivacion: token,
      tokenActivacionExpira: { gt: new Date() },
    },
  })
  
  console.log('resultado:', result ? result.email : 'NO ENCONTRADO')
  return result
}

async function activarCuenta(token, password) {
  console.log('=== SERVICIO ACTIVAR CUENTA ===')
  console.log('1. Buscando usuario con token:', token)
  
  const user = await prisma.user.findFirst({
    where: { tokenActivacion: token },
  })
  
  console.log('2. Usuario encontrado:', user ? user.email : 'NULL')
  if (!user) return null
  
  console.log('3. Password a guardar (sin hash):', password ? 'YES' : 'NO')
  console.log('4. Actualizando usuario en BD...')
  
  try {
    const result = await prisma.user.update({
      where: { id: user.id },
      data: {
        cuentaActivada: true,
        password,
        tokenActivacion: null,
        tokenActivacionExpira: null,
      },
    })
    console.log('5. Usuario actualizado:', result.email)
    return result
  } catch (error) {
    console.log('ERROR en actualizar:', error.message)
    throw error
  }
}

export { createUser, getAllUsers, getUserById, getUserByEmail, updateUser, deleteUser, generarTokenActivacion, validarTokenActivacion, activarCuenta }
