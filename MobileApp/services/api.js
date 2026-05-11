import axios from 'axios'
import AsyncStorage from '@react-native-async-storage/async-storage'

const API_BASE = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000/api'

console.log('=== API DEBUG ===')
console.log('EXPO_PUBLIC_API_URL:', process.env.EXPO_PUBLIC_API_URL)
console.log('API_BASE:', API_BASE)
console.log('==================')

const api = axios.create({
  baseURL: API_BASE,
  timeout: 60000,
  headers: { 'Content-Type': 'application/json' },
})

api.interceptors.request.use(async config => {
  const token = await AsyncStorage.getItem('gym_token')
  if (token) {
    config.headers['Authorization'] = `Bearer ${token}`
  }
  config.headers['X-Platform'] = 'mobile'
  return config
})

api.interceptors.response.use(
  res => res,
  async err => {
    if (err.response?.status === 401) {
      await AsyncStorage.removeItem('gym_token')
    }
    return Promise.reject(err)
  }
)

async function getUserMetrics(userId, from, to) {
  const params = {}
  if (from) params.from = from
  if (to) params.to = to
  const res = await api.get(`/users/${userId}/metricas`, { params })
  return res.data.data.metricas || []
}

export { getUserMetrics }
export default api
