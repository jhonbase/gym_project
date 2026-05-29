import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase.js'
import { DEFAULT_TRAINER_ID } from '../constants/App.js'

export function useTrainerStatus() {
  const [status, setStatus] = useState(null)
  const [trainerName, setTrainerName] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!DEFAULT_TRAINER_ID || DEFAULT_TRAINER_ID === 'ID-REAL-DEL-TRAINER-AQUI') {
      setLoading(false)
      setError('Trainer no configurado')
      return
    }

    fetchStatus()

    if (!supabase) return

    const channel = supabase
      .channel(`trainer-status-${DEFAULT_TRAINER_ID}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'User',
          filter: `id=eq.${DEFAULT_TRAINER_ID}`
        },
        (payload) => {
          if (payload.new.disponibilidad) {
            setStatus(payload.new.disponibilidad)
          }
          if (payload.new.nombre) {
            setTrainerName(payload.new.nombre)
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  async function fetchStatus() {
    try {
      setLoading(true)
      if (!supabase) {
        const API_BASE = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000/api'
        const res = await fetch(`${API_BASE}/users/${DEFAULT_TRAINER_ID}/status`)
        const body = await res.json()
        if (body.success && body.data) {
          setStatus(body.data.disponibilidad)
          setTrainerName(body.data.trainer)
        }
        return
      }
      const { data, error } = await supabase
        .from('User')
        .select('disponibilidad, nombre')
        .eq('id', DEFAULT_TRAINER_ID)
        .single()

      if (error) throw error
      if (data) {
        setStatus(data.disponibilidad)
        setTrainerName(data.nombre)
      }
    } catch (err) {
      console.error('Error fetching trainer status:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return { status, trainerName, loading, error, refetch: fetchStatus }
}
