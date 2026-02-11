import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    // Proxy: redirige /api/* al backend (puerto 3000)
    // Así en el frontend puedes hacer fetch('/api/users')
    // sin preocuparte por CORS ni por el puerto
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      },
    },
  },
})
