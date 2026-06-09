import { useState, useEffect } from 'react'
import api from '../services/api.js'
import { DEFAULT_TRAINER_ID } from '../constants/App.js'

export function useTrainerStatus() {
  const [status, setStatus] = useState(null)
  const [trainerName, setTrainerName] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!DEFAULT_TRAINER_ID) {
      setLoading(false)
      setError('Trainer no configurado')
      return
    }
    fetchStatus()

    const interval = setInterval(() => {
      fetchStatus()
    }, 60000)

    return () => clearInterval(interval)
  }, [])

  async function fetchStatus() {
    try {
      setLoading(true)
      const res = await api.get(`/users/${DEFAULT_TRAINER_ID}/status`)
      setStatus(res.data.data.disponibilidad)
      setTrainerName(res.data.data.trainer)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return { status, trainerName, loading, error, refetch: fetchStatus }
}