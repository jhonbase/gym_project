import 'dotenv/config'

const nodeEnv = process.env.NODE_ENV || 'development'

const config = {
  port:           parseInt(process.env.PORT, 10) || 3000,
  groqApiKey:     process.env.GROQ_API_KEY || null,
  geminiApiKey:   process.env.GEMINI_API_KEY || null,
  nodeEnv,
  // Entorno: permite verificar si es desarrollo
  isDevelopment:  nodeEnv === 'development',
  // JWT — usado para firmar/verificar tokens de sesión
  jwtSecret:      process.env.JWT_SECRET || 'cambiar-en-produccion',
  jwtExpiresIn:   process.env.JWT_EXPIRES_IN || '8h',
  // CORS — solo se usa en producción (development permite todo automáticamente)
  gmailUser:       process.env.GMAIL_USER || null,
  gmailPassword:   process.env.GMAIL_PASSWORD || null,
  frontendUrl:     process.env.FRONTEND_URL || 'http://localhost:5173',
  // Deep Links — URLs para abrir la app móvil desde el correo
  expoDevUrl:      process.env.EXPO_DEV_URL || null,
  expoProdUrl:     process.env.EXPO_PROD_URL || null,
  expoDevWebUrl:   process.env.EXPO_DEV_WEB_URL || null,
  allowedOriginsList: process.env.ALLOWED_ORIGINS
    ? process.env.ALLOWED_ORIGINS.split(',').map(o => o.trim())
    : [],
  // Cloudinary — almacenamiento de archivos (obligatorio para Netlify)
  cloudinaryCloudName: process.env.CLOUDINARY_CLOUD_NAME || null,
  cloudinaryApiKey:    process.env.CLOUDINARY_API_KEY || null,
  cloudinaryApiSecret: process.env.CLOUDINARY_API_SECRET || null,
}

export default config
