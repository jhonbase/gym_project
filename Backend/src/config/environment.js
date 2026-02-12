import 'dotenv/config'

const config = {
  port: parseInt(process.env.PORT, 10) || 3000,
  groqApiKey: process.env.GROQ_API_KEY || null,
  nodeEnv: process.env.NODE_ENV || 'development',
}

export default config
