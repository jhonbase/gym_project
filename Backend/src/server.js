import app from './app.js'
import config from './config/environment.js'
import * as logger from './utils/logger.js'

app.listen(config.port, () => {
  logger.info(`Backend corriendo en: http://localhost:${config.port}`)
})
