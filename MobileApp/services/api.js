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
  const res = await api.get(`/metrics/${userId}/metricas`, { params })
  return res.data.data.metricas || []
}

async function getMyTrainingPlan() {
  const res = await api.get('/assessments/my/training-plan')
  return res.data.data
}

async function getMe() {
  const res = await api.get('/users/me')
  return res.data.data.user
}

async function uploadAvatar(imageUri) {
  const formData = new FormData()
  const filename = imageUri.split('/').pop()
  const match = /\.(\w+)$/.exec(filename)
  const type = match ? `image/${match[1]}` : 'image'

  formData.append('avatar', {
    uri: imageUri,
    name: filename,
    type,
  })

  const res = await api.patch('/users/me/avatar', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  })
  return res.data.data.user
}

async function getMyAssessments() {
  const res = await api.get('/assessments/my/assessments')
  return res.data.data.assessments || []
}

export { getUserMetrics, getMyTrainingPlan, getMe, uploadAvatar, getMyAssessments }
export default api
