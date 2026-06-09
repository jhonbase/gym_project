import { useState, useCallback, useMemo, useEffect } from 'react'
import apiClient from '../api/client.js'

export const MONTHS = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre']
export const DAY_NAMES = ['Domingo','Lunes','Martes','Miércoles','Jueves','Viernes','Sábado']
export const SHORT_DAYS = ['Dom','Lun','Mar','Mié','Jue','Vie','Sáb']

export const TIPO_INFO = {
  valoracion:  { label: 'Valoración física',  color: '#3B82F6', icon: '📋' },
  plan:        { label: 'Plan entrenamiento',  color: '#22c55e', icon: '🏋️' },
  seguimiento: { label: 'Seguimiento',        color: '#7b1fa2', icon: '📈' },
  otro:        { label: 'Otro',               color: '#f97316', icon: '📌' },
}

export function toISO(y, m, d) {
  return `${y}-${String(m + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`
}

export function fmt12(t) {
  if (!t) return ''
  const [h, m] = t.split(':').map(Number)
  const suffix = h >= 12 ? 'pm' : 'am'
  const h12 = h % 12 || 12
  return `${h12}:${String(m).padStart(2, '0')}${suffix}`
}

const DEFAULT_HORARIO = [
  { open: false, desde: '13:00', hasta: '20:00' },
  { open: true,  desde: '13:00', hasta: '20:00' },
  { open: true,  desde: '13:00', hasta: '20:00' },
  { open: true,  desde: '13:00', hasta: '20:00' },
  { open: true,  desde: '13:00', hasta: '20:00' },
  { open: true,  desde: '13:00', hasta: '20:00' },
  { open: true,  desde: '13:00', hasta: '18:00' },
]

export default function useAgenda() {
  const [currentDate, setCurrentDate] = useState(() => {
    const d = new Date()
    d.setDate(1)
    return d
  })
  const [selectedDayIso, setSelectedDayIso] = useState(null)
  const [events, setEvents] = useState({})
  const [horario, setHorario] = useState(DEFAULT_HORARIO)
  const [students, setStudents] = useState([])
  const [loadingStudents, setLoadingStudents] = useState(true)

  useEffect(() => {
    let cancelled = false
    async function load() {
      try {
        const res = await apiClient.get('/users?rol=usuario')
        if (!cancelled) setStudents(res.data.data.users || [])
      } catch {
        if (!cancelled) setStudents([])
      } finally {
        if (!cancelled) setLoadingStudents(false)
      }
    }
    load()
    return () => { cancelled = true }
  }, [])

  const festivos = useMemo(() => [], [])

  const isClosed = useCallback((date) => {
    const day = date.getDay()
    // TODO API: GET /api/agenda/horario
    if (!horario[day].open) return true
    // TODO API: GET /api/agenda/festivos
    const iso = date.toISOString().slice(0, 10)
    return festivos.includes(iso)
  }, [horario, festivos])

  const changeMonth = useCallback((dir) => {
    setCurrentDate((prev) => {
      const d = new Date(prev)
      d.setMonth(d.getMonth() + dir)
      d.setDate(1)
      return d
    })
    setSelectedDayIso(null)
  }, [])

  const goToday = useCallback(() => {
    const now = new Date()
    const d = new Date(now.getFullYear(), now.getMonth(), 1)
    setCurrentDate(d)
    const iso = toISO(now.getFullYear(), now.getMonth(), now.getDate())
    setSelectedDayIso(iso)
  }, [])

  const addEvent = useCallback((iso, eventData) => {
    // TODO API: POST /api/agenda/citas
    setEvents((prev) => {
      const dayEvents = [...(prev[iso] || []), eventData]
      return { ...prev, [iso]: dayEvents }
    })
  }, [])

  const removeEvent = useCallback((iso, index) => {
    // TODO API: DELETE /api/agenda/citas/:id
    setEvents((prev) => {
      const dayEvents = prev[iso].filter((_, i) => i !== index)
      if (dayEvents.length === 0) {
        const { [iso]: _, ...rest } = prev
        return rest
      }
      return { ...prev, [iso]: dayEvents }
    })
  }, [])

  return {
    currentDate,
    selectedDayIso,
    setSelectedDayIso,
    events,
    horario,
    setHorario,
    festivos,
    isClosed,
    changeMonth,
    goToday,
    addEvent,
    removeEvent,
    students,
    loadingStudents,
  }
}
