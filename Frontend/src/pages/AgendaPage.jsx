import { useState, useMemo, useRef } from 'react'
import useAgenda, { MONTHS, DAY_NAMES, SHORT_DAYS, TIPO_INFO, toISO, fmt12 } from '../hooks/useAgenda.js'

const DURACIONES = ['30 min', '45 min', '1 hora', '1h 30min', '2 horas']

export default function AgendaPage() {
  const {
    currentDate, selectedDayIso, setSelectedDayIso,
    events, horario, setHorario, isClosed, isHoliday,
    changeMonth, goToday, addEvent,
    students,
  } = useAgenda()

  const [showNewModal, setShowNewModal] = useState(false)
  const [showHorarioModal, setShowHorarioModal] = useState(false)
  const [toast, setToast] = useState(null)

  const [formTipo, setFormTipo] = useState('valoracion')
  const [formAsunto, setFormAsunto] = useState('')
  const [formEstudiante, setFormEstudiante] = useState('')
  const [formHora, setFormHora] = useState('14:00')
  const [formDuracion, setFormDuracion] = useState('45 min')
  const [formNotas, setFormNotas] = useState('')

  const [horarioForm, setHorarioForm] = useState([])

  const toastTimer = useRef(null)

  const year = currentDate.getFullYear()
  const month = currentDate.getMonth()
  const today = new Date()

  const cal = useMemo(() => {
    const firstDay = new Date(year, month, 1).getDay()
    const daysInMonth = new Date(year, month + 1, 0).getDate()
    const prevDays = new Date(year, month, 0).getDate()
    const cells = []
    for (let i = firstDay - 1; i >= 0; i--) {
      cells.push({ day: prevDays - i, other: true })
    }
    for (let d = 1; d <= daysInMonth; d++) {
      cells.push({ day: d, other: false })
    }
    const rem = cells.length % 7
    if (rem > 0) {
      for (let d = 1; d <= 7 - rem; d++) {
        cells.push({ day: d, other: true })
      }
    }
    return cells
  }, [year, month])

  function showToast(msg) {
    if (toastTimer.current) clearTimeout(toastTimer.current)
    setToast(msg)
    toastTimer.current = setTimeout(() => setToast(null), 2500)
  }

  function openNewModal(iso) {
    if (iso) setSelectedDayIso(iso)
    setFormTipo('valoracion')
    setFormAsunto('')
    setFormEstudiante('')
    setFormHora('14:00')
    setFormDuracion('45 min')
    setFormNotas('')
    setShowNewModal(true)
  }

  function handleSaveEvent() {
    if (!selectedDayIso) { setShowNewModal(false); return }
    if (formTipo === 'otro' && !formAsunto.trim()) return
    addEvent(selectedDayIso, {
      tipo: formTipo,
      estudiante: formEstudiante,
      hora: formHora,
      duracion: formDuracion,
      notas: formNotas,
      asunto: formAsunto,
    })
    setShowNewModal(false)
    showToast('✓ Cita guardada correctamente')
  }

  function openHorarioModal() {
    setHorarioForm(horario.map(h => ({ ...h })))
    setShowHorarioModal(true)
  }

  function saveHorario() {
    setHorario(horarioForm)
    setShowHorarioModal(false)
    showToast('✓ Horario actualizado')
  }

  function toggleHorarioDay(i) {
    setHorarioForm(prev => prev.map((h, idx) =>
      idx === i ? { ...h, open: !h.open } : h
    ))
  }

  function updateHorarioTime(i, field, value) {
    setHorarioForm(prev => prev.map((h, idx) =>
      idx === i ? { ...h, [field]: value } : h
    ))
  }

  const selectedDayEvents = selectedDayIso ? (events[selectedDayIso] || []) : []

  const monthStats = useMemo(() => {
    let val = 0, plan = 0, seg = 0, total = 0
    Object.entries(events).forEach(([iso, evs]) => {
      const d = new Date(iso + 'T12:00:00')
      if (d.getFullYear() === year && d.getMonth() === month) {
        evs.forEach(e => {
          total++
          if (e.tipo === 'valoracion') val++
          if (e.tipo === 'plan') plan++
          if (e.tipo === 'seguimiento') seg++
        })
      }
    })
    return { val, plan, seg, total }
  }, [events, year, month])

  const upcoming = useMemo(() => {
    return Object.entries(events)
      .filter(([iso]) => new Date(iso + 'T12:00:00') >= new Date())
      .sort(([a], [b]) => a.localeCompare(b))
      .flatMap(([iso, evs]) => evs.map(e => ({ ...e, iso })))
      .slice(0, 4)
  }, [events])

  const horarioChips = useMemo(() => {
    const chips = []
    const groups = []
    let cur = null
    horario.forEach((h, i) => {
      if (h.open) {
        if (cur && cur.desde === h.desde && cur.hasta === h.hasta) {
          cur.end = i
        } else {
          cur = { start: i, end: i, desde: h.desde, hasta: h.hasta }
          groups.push(cur)
        }
      }
    })
    groups.forEach(g => {
      const label = g.start === g.end ? SHORT_DAYS[g.start] : `${SHORT_DAYS[g.start]}–${SHORT_DAYS[g.end]}`
      chips.push({ label: `${label}: ${fmt12(g.desde)} – ${fmt12(g.hasta)}`, color: '#22c55e' })
    })
    const closedDays = horario.map((h, i) => h.open ? null : SHORT_DAYS[i]).filter(Boolean)
    if (closedDays.length) {
      chips.push({ label: `${closedDays.join(', ')}: Cerrado`, color: '#E10600' })
    }
    return chips
  }, [horario])

  const modalDateStr = selectedDayIso
    ? `${parseInt(selectedDayIso.split('-')[2])} de ${MONTHS[parseInt(selectedDayIso.split('-')[1]) - 1]} ${selectedDayIso.split('-')[0]}`
    : 'Completa los datos de la cita'

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', padding: '48px 40px', backgroundColor: '#0B0B0B', flex: 1 }}>
      {/* ===== PAGE HEADER ===== */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, letterSpacing: '-0.025em', color: '#FFFFFF' }}>
            Agenda <span style={{ color: '#E10600' }}>del Gimnasio</span>
          </h1>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
          {horarioChips.map((chip, i) => (
            <span key={i} style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', backgroundColor: '#1C1C1C', border: '1px solid #2A2A2A', borderRadius: '9999px', padding: '4px 12px', fontSize: '0.75rem', color: '#BFBFBF' }}>
              <span style={{ width: '6px', height: '6px', borderRadius: '50%', flexShrink: 0, backgroundColor: chip.color }} />
              {chip.label}
            </span>
          ))}
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', backgroundColor: '#1C1C1C', border: '1px solid #2A2A2A', borderRadius: '9999px', padding: '4px 12px', fontSize: '0.75rem', color: '#BFBFBF' }}>
            <span style={{ width: '6px', height: '6px', borderRadius: '50%', flexShrink: 0, backgroundColor: '#E10600' }} />
            Festivos: Cerrado
          </span>
          <button onClick={openHorarioModal} style={{ background: 'transparent', border: 'none', color: '#BFBFBF', fontSize: '0.75rem', fontWeight: 500, cursor: 'pointer', padding: '8px', display: 'flex', alignItems: 'center', gap: '4px', whiteSpace: 'nowrap' }}>
            {'⚙'} Configurar horario
          </button>
        </div>
      </div>

      {/* ===== MAIN TWO-COLUMN LAYOUT ===== */}
      <div style={{ display: 'flex', gap: '24px', alignItems: 'flex-start' }}>
        {/* ===== CALENDAR COLUMN ===== */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ backgroundColor: '#161616', border: '1px solid #2A2A2A', borderRadius: '16px', overflow: 'hidden' }}>
            {/* Calendar Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 20px', borderBottom: '1px solid #2A2A2A' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <button onClick={() => changeMonth(-1)} style={{ backgroundColor: '#1C1C1C', border: '1px solid #2A2A2A', color: '#FFFFFF', width: '28px', height: '28px', borderRadius: '6px', cursor: 'pointer', fontSize: '0.875rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {'‹'}
                </button>
                <span style={{ fontWeight: 700, fontSize: '1rem', minWidth: '160px', textAlign: 'center', color: '#FFFFFF' }}>
                  {MONTHS[month]} {year}
                </span>
                <button onClick={() => changeMonth(1)} style={{ backgroundColor: '#1C1C1C', border: '1px solid #2A2A2A', color: '#FFFFFF', width: '28px', height: '28px', borderRadius: '6px', cursor: 'pointer', fontSize: '0.875rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {'›'}
                </button>
                <button onClick={goToday} style={{ background: 'transparent', border: 'none', color: '#BFBFBF', fontSize: '0.75rem', fontWeight: 500, cursor: 'pointer', padding: '8px', marginLeft: '4px' }}>
                  Hoy
                </button>
              </div>
            </div>

            {/* Legend */}
            <div style={{ display: 'flex', gap: '16px', padding: '10px 20px', borderBottom: '1px solid #2A2A2A', flexWrap: 'wrap' }}>
              {Object.entries(TIPO_INFO).map(([key, info]) => (
                <span key={key} style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', color: '#BFBFBF' }}>
                  <span style={{ width: '8px', height: '8px', borderRadius: '4px', flexShrink: 0, backgroundColor: info.color }} />
                  {info.label}
                </span>
              ))}
              <span style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', color: '#BFBFBF' }}>
                <span style={{ width: '8px', height: '8px', borderRadius: '4px', flexShrink: 0, backgroundColor: '#E10600', opacity: 0.4 }} />
                Cerrado
              </span>
            </div>

            {/* Day Name Headers */}
            <div style={{ backgroundColor: '#1C1C1C', display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)' }}>
              {SHORT_DAYS.map((d, i) => (
                <div key={d} style={{ textAlign: 'center', padding: '10px 4px', fontSize: '0.75rem', fontWeight: 600, color: i === 0 ? '#E10600' : '#BFBFBF', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  {d}
                </div>
              ))}
            </div>

            {/* Calendar Body */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)' }}>
              {cal.map((cell, idx) => {
                if (cell.other) {
                  return (
                    <div key={idx} style={{ minHeight: '88px', borderRight: '1px solid #2A2A2A', borderBottom: '1px solid #2A2A2A', padding: '6px', opacity: 0.25, pointerEvents: 'none' }}>
                      <div style={{ width: '22px', height: '22px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: 600, color: '#BFBFBF' }}>
                        {cell.day}
                      </div>
                    </div>
                  )
                }

                const date = new Date(year, month, cell.day)
                const iso = toISO(year, month, cell.day)
                const isToday = date.toDateString() === today.toDateString()
                const closed = isClosed(date)
                const holiday = isHoliday(date)
                const isSelected = iso === selectedDayIso
                const dayEvents = events[iso] || []

                return (
                  <div
                    key={idx}
                    onClick={() => !closed && setSelectedDayIso(iso)}
                    style={{
                      minHeight: '88px',
                      borderRight: '1px solid #2A2A2A',
                      borderBottom: '1px solid #2A2A2A',
                      padding: '6px',
                      position: 'relative',
                      cursor: closed ? 'default' : 'pointer',
                      backgroundColor: closed ? '#1a0808' : (isSelected ? '#1e1414' : 'transparent'),
                      outline: isSelected ? '2px solid #E10600' : undefined,
                      outlineOffset: isSelected ? '-1px' : undefined,
                    }}
                  >
                    <div style={{
                      width: '22px',
                      height: '22px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      marginBottom: '2px',
                      ...(isToday && !closed ? { backgroundColor: '#E10600', color: '#FFFFFF', borderRadius: '50%' } : { color: '#BFBFBF' }),
                    }}>
                      {cell.day}
                    </div>
                    {!closed && (
                      <div
                        style={{ position: 'absolute', top: '4px', right: '4px', width: '18px', height: '18px', backgroundColor: 'rgba(225,6,0,0.15)', border: '1px solid #E10600', color: '#E10600', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.875rem', cursor: 'pointer', lineHeight: 1, opacity: 0.7 }}
                        onClick={(e) => { e.stopPropagation(); openNewModal(iso) }}
                      >
                        +
                      </div>
                    )}
                    {closed && (
                      <div style={{ fontSize: '9px', color: '#c62828', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 700, marginTop: '20px', textAlign: 'center', pointerEvents: 'none' }}>
                        {holiday ? 'FESTIVO' : 'Cerrado'}
                      </div>
                    )}
                    {dayEvents.slice(0, 2).map((ev, ei) => {
                      const label = ev.tipo === 'otro'
                        ? (ev.asunto || 'Otro').slice(0, 12)
                        : (ev.estudiante ? ev.estudiante.split(' ')[0] : '')
                      const info = TIPO_INFO[ev.tipo] || TIPO_INFO.otro
                      return (
                        <div
                          key={ei}
                          style={{
                            borderRadius: '3px',
                            padding: '2px 5px',
                            fontSize: '10px',
                            fontWeight: 600,
                            marginBottom: '2px',
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            borderLeft: `2px solid ${info.color}`,
                            backgroundColor: info.color + '18',
                            color: info.color,
                          }}
                        >
                          {ev.hora} {label}
                        </div>
                      )
                    })}
                    {dayEvents.length > 2 && (
                      <div style={{ fontSize: '10px', color: '#BFBFBF' }}>+{dayEvents.length - 2} más</div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        {/* ===== SIDEBAR ===== */}
        <div style={{ width: '288px', flexShrink: 0, display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Day Detail Card */}
          <div style={{ backgroundColor: '#161616', border: '1px solid #2A2A2A', borderRadius: '12px', padding: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <h3 style={{ fontWeight: 700, fontSize: '0.875rem', color: '#FFFFFF' }}>
                {selectedDayIso
                  ? `${parseInt(selectedDayIso.split('-')[2])} de ${MONTHS[parseInt(selectedDayIso.split('-')[1]) - 1]}`
                  : 'Selecciona un día'}
              </h3>
              {selectedDayIso && (
                <span
                  style={{ fontSize: '0.75rem', color: '#E10600', cursor: 'pointer' }}
                  onClick={() => openNewModal(selectedDayIso)}
                >
                  + Añadir
                </span>
              )}
            </div>
            {!selectedDayIso ? (
              <div style={{ color: '#BFBFBF', fontSize: '0.75rem', padding: '12px 0' }}>Haz click en cualquier día para ver sus citas</div>
            ) : selectedDayEvents.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '20px 0', color: '#BFBFBF', fontSize: '0.75rem' }}>
                Sin citas.{' '}
                <span style={{ color: '#E10600', cursor: 'pointer' }} onClick={() => openNewModal(selectedDayIso)}>
                  + Agregar
                </span>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0px' }}>
                {selectedDayEvents.map((ev, i) => {
                  const info = TIPO_INFO[ev.tipo] || TIPO_INFO.otro
                  const title = ev.tipo === 'otro' ? (ev.asunto || 'Sin asunto') : (ev.estudiante || 'Sin estudiante')
                  return (
                    <div key={i} style={{ display: 'flex', gap: '10px', padding: '8px 0', borderBottom: i < selectedDayEvents.length - 1 ? '1px solid #2A2A2A' : 'none' }}>
                      <span style={{ width: '8px', height: '8px', borderRadius: '50%', marginTop: '4px', flexShrink: 0, backgroundColor: info.color }} />
                      <div style={{ fontSize: '0.75rem', color: '#BFBFBF', minWidth: '40px' }}>{ev.hora}</div>
                      <div>
                        <div style={{ fontSize: '0.875rem', fontWeight: 600, color: '#FFFFFF' }}>{title}</div>
                        <div style={{ fontSize: '0.75rem', color: '#BFBFBF', marginTop: '2px' }}>{info.label} · {ev.duracion}</div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          {/* Month Summary Card */}
          <div style={{ backgroundColor: '#161616', border: '1px solid #2A2A2A', borderRadius: '12px', padding: '16px' }}>
            <h3 style={{ fontWeight: 700, fontSize: '0.875rem', color: '#FFFFFF', marginBottom: '12px' }}>Resumen del mes</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {[
                { label: 'Valoraciones', value: monthStats.val, color: TIPO_INFO.valoracion.color },
                { label: 'Planes creados', value: monthStats.plan, color: TIPO_INFO.plan.color },
                { label: 'Seguimientos', value: monthStats.seg, color: TIPO_INFO.seguimiento.color },
                { label: 'Total citas', value: monthStats.total, color: '' },
              ].map((stat, idx) => (
                <div key={stat.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '6px 0', borderBottom: idx < 3 ? '1px solid #2A2A2A' : 'none' }}>
                  <span style={{ fontSize: '0.75rem', color: '#BFBFBF' }}>{stat.label}</span>
                  <span style={{ fontSize: '0.875rem', fontWeight: 700, fontFamily: "'Segoe UI', system-ui, sans-serif", color: stat.color || '#FFFFFF' }}>
                    {stat.value}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Upcoming Card */}
          <div style={{ backgroundColor: '#161616', border: '1px solid #2A2A2A', borderRadius: '12px', padding: '16px' }}>
            <h3 style={{ fontWeight: 700, fontSize: '0.875rem', color: '#FFFFFF', marginBottom: '12px' }}>Próximas citas</h3>
            {upcoming.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '20px 0', color: '#BFBFBF', fontSize: '0.75rem' }}>No hay citas próximas</div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0px' }}>
                {upcoming.map((ev, i) => {
                  const info = TIPO_INFO[ev.tipo] || TIPO_INFO.otro
                  const title = ev.tipo === 'otro' ? (ev.asunto || 'Otro') : (ev.estudiante || 'Sin título')
                  const d = new Date(ev.iso + 'T12:00:00')
                  return (
                    <div key={i} style={{ display: 'flex', gap: '10px', padding: '8px 0', borderBottom: i < upcoming.length - 1 ? '1px solid #2A2A2A' : 'none' }}>
                      <span style={{ width: '8px', height: '8px', borderRadius: '50%', marginTop: '4px', flexShrink: 0, backgroundColor: info.color }} />
                      <div>
                        <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#FFFFFF' }}>{title}</div>
                        <div style={{ fontSize: '0.75rem', color: '#BFBFBF', marginTop: '2px' }}>
                          {d.getDate()} {MONTHS[d.getMonth()].slice(0, 3)} · {ev.hora}
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ===== MODAL: NEW EVENT ===== */}
      {showNewModal && (
        <div style={{ position: 'fixed', top: 0, right: 0, bottom: 0, left: 0, backgroundColor: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(4px)', zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }} onClick={() => setShowNewModal(false)}>
          <div style={{ backgroundColor: '#161616', border: '1px solid #2A2A2A', borderRadius: '8px', padding: '28px', width: '100%', maxWidth: '448px', maxHeight: '90vh', overflowY: 'auto' }} onClick={(e) => e.stopPropagation()}>
            <div style={{ fontWeight: 700, fontSize: '1.25rem', color: '#FFFFFF', marginBottom: '4px' }}>Nueva Cita</div>
            <div style={{ color: '#BFBFBF', fontSize: '0.875rem', marginBottom: '20px' }}>{modalDateStr}</div>

            <div style={{ marginBottom: '14px' }}>
              <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 600, color: '#BFBFBF', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: '5.6px' }}>Tipo de cita</label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px' }}>
                {Object.entries(TIPO_INFO).map(([key, info]) => (
                  <div
                    key={key}
                    onClick={() => setFormTipo(key)}
                    style={{
                      backgroundColor: formTipo === key ? 'rgba(225,6,0,0.1)' : '#1C1C1C',
                      border: formTipo === key ? '2px solid #E10600' : '2px solid #2A2A2A',
                      borderRadius: '8px',
                      padding: '10px 4px',
                      cursor: 'pointer',
                      textAlign: 'center',
                    }}
                  >
                    <div style={{ fontSize: '1.125rem', marginBottom: '4px' }}>{info.icon}</div>
                    <div style={{ fontSize: '10px', color: '#BFBFBF', lineHeight: '1.25' }}>{info.label}</div>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ marginBottom: '14px', display: formTipo === 'otro' ? 'block' : 'none' }}>
              <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 600, color: '#BFBFBF', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: '5.6px' }}>
                Asunto <span style={{ color: '#E10600' }}>*</span>
              </label>
              <input
                type="text"
                placeholder="Ej: Reunión coordinación, Mantenimiento equipos..."
                value={formAsunto}
                onChange={(e) => setFormAsunto(e.target.value)}
                style={{ width: '100%', padding: '10.4px 14.4px', backgroundColor: '#1C1C1C', border: '1px solid #2A2A2A', borderRadius: '6px', color: '#FFFFFF', fontSize: '0.9rem', fontFamily: "'Segoe UI', system-ui, sans-serif", outline: 'none', boxSizing: 'border-box' }}
              />
            </div>

            <div style={{ marginBottom: '14px', display: formTipo === 'otro' ? 'none' : 'block' }}>
              <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 600, color: '#BFBFBF', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: '5.6px' }}>Estudiante</label>
              <select
                value={formEstudiante}
                onChange={(e) => setFormEstudiante(e.target.value)}
                style={{ width: '100%', padding: '10.4px 14.4px', backgroundColor: '#1C1C1C', border: '1px solid #2A2A2A', borderRadius: '6px', color: '#FFFFFF', fontSize: '0.9rem', fontFamily: "'Segoe UI', system-ui, sans-serif", outline: 'none', boxSizing: 'border-box', appearance: 'none', backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%23BFBFBF' stroke-width='2.5' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E\")", backgroundRepeat: 'no-repeat', backgroundPosition: 'right 0.75rem center', paddingRight: '36px', cursor: 'pointer' }}
              >
                <option value="">Selecciona un estudiante...</option>
                {students.map((s) => (
                  <option key={s.id} value={s.nombre || `${s.primerNombre} ${s.primerApellido}`} style={{ backgroundColor: '#1C1C1C', color: '#FFFFFF' }}>{s.nombre || `${s.primerNombre} ${s.primerApellido}`}</option>
                ))}
              </select>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '14px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 600, color: '#BFBFBF', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: '5.6px' }}>Hora inicio</label>
                <input type="time" value={formHora} onChange={(e) => setFormHora(e.target.value)} style={{ width: '100%', padding: '10.4px 14.4px', backgroundColor: '#1C1C1C', border: '1px solid #2A2A2A', borderRadius: '6px', color: '#FFFFFF', fontSize: '0.9rem', fontFamily: "'Segoe UI', system-ui, sans-serif", outline: 'none', boxSizing: 'border-box' }} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 600, color: '#BFBFBF', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: '5.6px' }}>Duración</label>
                <select value={formDuracion} onChange={(e) => setFormDuracion(e.target.value)} style={{ width: '100%', padding: '10.4px 14.4px', backgroundColor: '#1C1C1C', border: '1px solid #2A2A2A', borderRadius: '6px', color: '#FFFFFF', fontSize: '0.9rem', fontFamily: "'Segoe UI', system-ui, sans-serif", outline: 'none', boxSizing: 'border-box', appearance: 'none', backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%23BFBFBF' stroke-width='2.5' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E\")", backgroundRepeat: 'no-repeat', backgroundPosition: 'right 0.75rem center', paddingRight: '36px', cursor: 'pointer' }}>
                  {DURACIONES.map((d) => (
                    <option key={d} value={d} style={{ backgroundColor: '#1C1C1C', color: '#FFFFFF' }}>{d}</option>
                  ))}
                </select>
              </div>
            </div>

            <div style={{ marginBottom: '14px' }}>
              <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 600, color: '#BFBFBF', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: '5.6px' }}>Notas (opcional)</label>
              <textarea
                rows={2}
                placeholder="Ej: Primera valoración, traer ropa cómoda..."
                value={formNotas}
                onChange={(e) => setFormNotas(e.target.value)}
                style={{ width: '100%', padding: '10.4px 14.4px', backgroundColor: '#1C1C1C', border: '1px solid #2A2A2A', borderRadius: '6px', color: '#FFFFFF', fontSize: '0.9rem', fontFamily: "'Segoe UI', system-ui, sans-serif", outline: 'none', boxSizing: 'border-box', resize: 'none' }}
              />
            </div>

            <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end', marginTop: '20px' }}>
              <button onClick={() => setShowNewModal(false)} style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '6.4px', background: 'transparent', color: '#BFBFBF', border: '1px solid #2A2A2A', padding: '10.4px 20px', borderRadius: '6px', fontSize: '0.875rem', fontWeight: 500, cursor: 'pointer' }}>Cancelar</button>
              <button onClick={handleSaveEvent} style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '8px', background: '#E10600', color: '#FFFFFF', border: 'none', padding: '11.2px 25.6px', borderRadius: '6px', fontSize: '0.875rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', cursor: 'pointer' }}>Guardar cita</button>
            </div>
          </div>
        </div>
      )}

      {/* ===== MODAL: CONFIGURAR HORARIO ===== */}
      {showHorarioModal && (
        <div style={{ position: 'fixed', top: 0, right: 0, bottom: 0, left: 0, backgroundColor: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(4px)', zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }} onClick={() => setShowHorarioModal(false)}>
          <div style={{ backgroundColor: '#161616', border: '1px solid #2A2A2A', borderRadius: '8px', padding: '28px', width: '100%', maxWidth: '448px', maxHeight: '90vh', overflowY: 'auto' }} onClick={(e) => e.stopPropagation()}>
            <div style={{ fontWeight: 700, fontSize: '1.25rem', color: '#FFFFFF', marginBottom: '4px' }}>Horario del Gimnasio</div>
            <div style={{ color: '#BFBFBF', fontSize: '0.875rem', marginBottom: '20px' }}>Activa los días y define las horas de apertura</div>

            {horarioForm.map((h, i) => (
              <div key={i} style={{ display: 'grid', gridTemplateColumns: 'auto 1fr auto', gap: '12px', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid #2A2A2A' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: '110px' }}>
                  <label style={{ position: 'relative', width: '36px', height: '20px', cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      style={{ position: 'absolute', width: '1px', height: '1px', margin: '-1px', padding: 0, overflow: 'hidden', clip: 'rect(0,0,0,0)', whiteSpace: 'nowrap', border: 0 }}
                      checked={h.open}
                      onChange={() => toggleHorarioDay(i)}
                    />
                    <div style={{
                      position: 'absolute', inset: 0, backgroundColor: h.open ? 'rgba(225,6,0,0.15)' : '#1C1C1C',
                      border: h.open ? '1px solid #E10600' : '1px solid #2A2A2A',
                      borderRadius: '9999px',
                      transition: 'all 0.2s',
                    }}>
                      <div style={{
                        position: 'absolute',
                        width: '14px', height: '14px',
                        left: h.open ? '18px' : '2px',
                        bottom: '2px',
                        backgroundColor: h.open ? '#E10600' : '#BFBFBF',
                        borderRadius: '50%',
                        transition: 'all 0.2s',
                      }} />
                    </div>
                  </label>
                  <span style={{ fontSize: '0.875rem', color: h.open ? '#FFFFFF' : '#BFBFBF' }}>{DAY_NAMES[i]}</span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.75rem', opacity: h.open ? 1 : 0.3, pointerEvents: h.open ? 'auto' : 'none' }}>
                  <input
                    type="time"
                    value={h.desde}
                    onChange={(e) => updateHorarioTime(i, 'desde', e.target.value)}
                    disabled={!h.open}
                    style={{ backgroundColor: '#1C1C1C', border: '1px solid #2A2A2A', borderRadius: '4px', padding: '4px 8px', color: '#FFFFFF', fontSize: '0.75rem', width: '90px', outline: 'none', fontFamily: "'Segoe UI', system-ui, sans-serif" }}
                  />
                  <span style={{ color: '#BFBFBF', fontSize: '0.75rem' }}>hasta</span>
                  <input
                    type="time"
                    value={h.hasta}
                    onChange={(e) => updateHorarioTime(i, 'hasta', e.target.value)}
                    disabled={!h.open}
                    style={{ backgroundColor: '#1C1C1C', border: '1px solid #2A2A2A', borderRadius: '4px', padding: '4px 8px', color: '#FFFFFF', fontSize: '0.75rem', width: '90px', outline: 'none', fontFamily: "'Segoe UI', system-ui, sans-serif" }}
                  />
                </div>

                <div style={{ fontSize: '0.75rem', color: '#BFBFBF', minWidth: '50px', textAlign: 'right' }}>
                  {h.open ? `${fmt12(h.desde)} – ${fmt12(h.hasta)}` : 'Cerrado'}
                </div>
              </div>
            ))}

            <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end', marginTop: '20px' }}>
              <button onClick={() => setShowHorarioModal(false)} style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '6.4px', background: 'transparent', color: '#BFBFBF', border: '1px solid #2A2A2A', padding: '10.4px 20px', borderRadius: '6px', fontSize: '0.875rem', fontWeight: 500, cursor: 'pointer' }}>Cancelar</button>
              <button onClick={saveHorario} style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '8px', background: '#E10600', color: '#FFFFFF', border: 'none', padding: '11.2px 25.6px', borderRadius: '6px', fontSize: '0.875rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', cursor: 'pointer' }}>Guardar horario</button>
            </div>
          </div>
        </div>
      )}

      {/* ===== TOAST ===== */}
      {toast && (
        <div style={{ position: 'fixed', bottom: '24px', right: '24px', backgroundColor: '#1C1C1C', border: '1px solid #22c55e', borderLeft: '3px solid #22c55e', borderRadius: '8px', padding: '12px 16px', fontSize: '0.875rem', color: '#81c784', zIndex: 300, boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1), 0 4px 6px -2px rgba(0,0,0,0.05)' }}>
          {toast}
        </div>
      )}
    </div>
  )
}
