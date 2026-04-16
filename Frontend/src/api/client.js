/**
 * cliente Axios preconfigurado.
 * baseURL '/api' funciona gracias al proxy de Vite:
 *   /api/* → http://localhost:3000/api/*
 *
 * SEGURIDAD — Interceptor de request:
 * Agrega automáticamente el header "Authorization: Bearer <token>" en TODAS
 * las peticiones. Sin esto, el backend rechazaría las rutas protegidas con 401.
 * El token se lee de localStorage en cada request (no en el momento de crear
 * el cliente), así siempre se usa el token más reciente.
 */
import axios from 'axios'

const apiClient = axios.create({
  baseURL: '/api',
  timeout: 60000, // 60 segundos para dar tiempo a la IA
  headers: { 'Content-Type': 'application/json' },
})

// Interceptor: adjunta el JWT en cada petición saliente
apiClient.interceptors.request.use(config => {
  const token = localStorage.getItem('gym_token')
  if (token) {
    config.headers['Authorization'] = `Bearer ${token}`
  }
  return config
})

// Interceptor: si el servidor devuelve 401, borramos el token inválido/expirado
apiClient.interceptors.response.use(
  res => res,
  err => {
    if (err.response?.status === 401) {
      localStorage.removeItem('gym_token')
      // Redirigir al login si no estamos ya ahí
      if (!window.location.pathname.includes('/login')) {
        window.location.href = '/login'
      }
    }
    return Promise.reject(err)
  }
)

export default apiClient
