import { useState, useEffect } from 'react'
import apiClient from '../api/client.js'

const ESTADOS = {
  DISPONIBLE: { label: 'Disponible', color: '#22c55e' },
  OCUPADO: { label: 'Ocupado', color: '#eab308' },
  NO_DISPONIBLE: { label: 'No disponible', color: '#ef4444' }
}

export function useTrainerStatus(trainerId) {
  const [status, setStatus] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!trainerId) { setLoading(false); return }
    fetchStatus()
  }, [trainerId])

  async function fetchStatus() {
    try {
      const res = await apiClient.get(`/users/${trainerId}/status`)
      setStatus(res.data.data.disponibilidad)
    } catch (err) { console.error('Error fetching status:', err) }
    finally { setLoading(false) }
  }

  async function updateStatus(nuevoEstado) {
    try {
      const res = await apiClient.patch('/users/me/status', { disponibilidad: nuevoEstado })
      setStatus(res.data.data.disponibilidad)
      return true
    } catch (err) { console.error('Error updating status:', err); return false }
  }

  return { 
    status, 
    loading, 
    updateStatus, 
    getStatusColor: () => ESTADOS[status]?.color || ESTADOS.NO_DISPONIBLE.color 
  }
}

export { ESTADOS }