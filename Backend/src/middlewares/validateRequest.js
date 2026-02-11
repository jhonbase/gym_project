import { z } from 'zod/v4'

function validateRequest(schema) {
  return (req, res, next) => {
    try {
      // schema.parse() lanza un error si los datos son inválidos
      // Si son válidos, devuelve los datos "limpios" (trimmed, lowercase, etc.)
      req.body = schema.parse(req.body)
      next()
    } catch (error) {
      // Zod v4 usa 'issues' (no 'errors') y z.ZodError para la clase
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
