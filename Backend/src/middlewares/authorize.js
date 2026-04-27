export function authorize(...roles) {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.rol)) {
      return res.status(403).json({
        success: false,
        error: 'Sin permisos para esta acción.',
      })
    }
    next()
  }
}