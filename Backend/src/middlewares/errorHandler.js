import * as logger from '../utils/logger.js'

function errorHandler(err, req, res, _next) {
  // Registrar el error con contexto (qué endpoint falló)
  logger.error(`${err.message} | ${req.method} ${req.originalUrl}`)

  // Mapeo de nombres de campos para mensajes legibles
const fieldLabels = {
  numeroCarnet: 'número de carnet',
  documento: 'documento',
  email: 'correo electrónico',
  telefono: 'teléfono',
}

// Prisma: violación de constraint unique (ej: email ya existe)
// Código P2002 = "Unique constraint failed"
  if (err.code === 'P2002') {
    const rawField = err.meta?.target?.join(', ') || 'campo'
    const label = fieldLabels[rawField] || rawField
    return res.status(409).json({
      success: false,
      error: `Ya existe un registro con ese ${label}.`,
    })
  }

  // Prisma: registro no encontrado
  // Código P2025 = "Record to update/delete not found"
  if (err.code === 'P2025') {
    return res.status(404).json({
      success: false,
      error: 'Registro no encontrado.',
    })
  }

  // Error genérico del servidor
  // En desarrollo mostramos el mensaje real; en producción ocultamos detalles
  const statusCode = err.statusCode || 500
  return res.status(statusCode).json({
    success: false,
    error: process.env.NODE_ENV === 'development'
      ? err.message
      : 'Error interno del servidor.',
  })
}

export default errorHandler
