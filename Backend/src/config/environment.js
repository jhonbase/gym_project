import 'dotenv/config'

const config = {
  port:           parseInt(process.env.PORT, 10) || 3000,
  groqApiKey:     process.env.GROQ_API_KEY || null,
  nodeEnv:        process.env.NODE_ENV || 'development',
  // JWT — usado para firmar/verificar tokens de sesión
  jwtSecret:      process.env.JWT_SECRET || 'cambiar-en-produccion',
  jwtExpiresIn:   process.env.JWT_EXPIRES_IN || '8h',
  // CORS — origins permitidos (separados por coma si son varios)
  allowedOrigin:  process.env.ALLOWED_ORIGIN || 'http://localhost:3000',
}

export default config
