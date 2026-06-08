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

    const channelName = `trainer-status-${DEFAULT_TRAINER_ID}`
    const existing = supabase.getChannels().find(c => c.topic === `realtime:${channelName}`)
    if (existing) supabase.removeChannel(existing)

    const channel = supabase
      .channel(channelName)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'User',
          filter: `id=eq.${DEFAULT_TRAINER_ID}`
        },
        (payload) => {
          if (payload.new.disponibilidad) setStatus(payload.new.disponibilidad)
          if (payload.new.nombre) setTrainerName(payload.new.nombre)
        }
      )

    channel.subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  async function fetchStatus() {
    try {
      setLoading(true)
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