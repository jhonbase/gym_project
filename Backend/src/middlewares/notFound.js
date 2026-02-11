function notFound(req, res) {
  res.status(404).json({
    success: false,
    error: `Ruta ${req.originalUrl} no encontrada.`,
  })
}

export default notFound
