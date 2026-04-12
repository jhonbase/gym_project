import { z } from 'zod/v4'

function validateRequest(schema) {
  return (req, res, next) => {
    try {
      const dataToValidate = { ...req.body }
      
      if (dataToValidate.semestre !== undefined) {
        dataToValidate.semestre = parseInt(dataToValidate.semestre, 10)
      }
      if (dataToValidate.esEgresado !== undefined) {
        dataToValidate.esEgresado = dataToValidate.esEgresado === 'true' || dataToValidate.esEgresado === true
      }

      req.body = schema.parse(dataToValidate)
      next()
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          success: false,
          error: 'Error de validación.',
          details: error.issues.map((issue) => ({
            field: issue.path.join('.'),
            message: issue.message,
          })),
        })
      }
      next(error)
    }
  }
}

export { validateRequest }
