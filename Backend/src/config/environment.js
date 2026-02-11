import 'dotenv/config'

const config = {
  port: parseInt(process.env.PORT, 10) || 3000,
  csharpUrl: process.env.CSHARP_URL || 'http://localhost:5000',
  openaiApiKey: process.env.OPENAI_API_KEY || null,
  nodeEnv: process.env.NODE_ENV || 'development',
}

export default config
