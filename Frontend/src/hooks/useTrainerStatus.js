import { useState, useEffect } from 'react'
import apiClient from '../api/client.js'

const ESTADOS = {
  DISPONIBLE: { label: 'Disponible', color: '#22c55e' },
  OCUPADO: { label: 'Ocupado', color: '#eab308' },
  NO_DISPONIBLE: { label: 'No disponible', color: '#ef4444' }
}

export function useTrainerStatus(isEntrenador) {
  const [status, setStatus] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!isEntrenador) { setLoading(false); return }
    fetchStatus()
  }, [isEntrenador])

  async function fetchStatus() {
    try {
      const res = await apiClient.get('/users/me/status')
      setStatus(res.data.data.disponibilidad)
    } catch {
      setStatus('NO_DISPONIBLE')
    } finally {
      setLoading(false)
    }
  }

  async function updateStatus(nuevoEstado) {
    try {
      const res = await apiClient.patch('/users/me/status', { disponibilidad: nuevoEstado })
      setStatus(res.data.data.disponibilidad)
      return true
    } catch { return false }
  }

  return { 
    status, 
    loading, 
    updateStatus, 
    getStatusColor: () => ESTADOS[status]?.color || ESTADOS.NO_DISPONIBLE.color 
  }
}

export { ESTADOS }