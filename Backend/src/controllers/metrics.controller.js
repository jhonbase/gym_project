import * as metricsService from '../services/metrics.service.js'
import * as response from '../utils/apiResponse.js'
import { authenticate } from '../middlewares/authenticate.js'

async function getUserMetrics(req, res, next) {
  try {
    const { from, to } = req.query
    const userId = req.params.id

    const metricas = await metricsService.getByUserId(userId, { from, to })

    return response.success(res, { metricas })
  } catch (error) {
    next(error)
  }
}

export { getUserMetrics }
