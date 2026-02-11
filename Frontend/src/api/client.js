// Cliente Axios preconfigurado.
// baseURL '/api' funciona gracias al proxy de Vite
// que redirige /api/* → http://localhost:3000/api/*
import axios from 'axios'

const apiClient = axios.create({
  baseURL: '/api',
  timeout: 10000,
  headers: { 'Content-Type': 'application/json' },
})

export default apiClient