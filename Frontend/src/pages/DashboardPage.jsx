import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth.js'
import apiClient from '../api/client.js'
import LoadingSpinner from '../components/LoadingSpinner.jsx'
import AlertMessage from '../components/AlertMessage.jsx'

function StatCard({ icon, label, value, subtext, color, onClick }) {
  return (
    <div 
      className="dashboard-stat-card" 
      style={{ '--stat-color': color }}
      onClick={onClick}
    >
      <div className="dashboard-stat-icon">{icon}</div>
      <div className="dashboard-stat-content">
        <span className="dashboard-stat-value">{value}</span>
        <span className="dashboard-stat-label">{label}</span>
        {subtext && <span className="dashboard-stat-subtext">{subtext}</span>}
      </div>
    </div>
  )
}

function Modal({ isOpen, onClose, title, children }) {
  if (!isOpen) return null
  return (
    <div className="dashboard-modal-overlay" onClick={onClose}>
      <div className="dashboard-modal-content" onClick={e => e.stopPropagation()}>
        <div className="dashboard-modal-header">
          <h2>{title}</h2>
          <button className="dashboard-modal-close" onClick={onClose}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 6L6 18M6 6l12 12"/>
            </svg>
          </button>
        </div>
        <div className="dashboard-modal-body">
          {children}
        </div>
      </div>
    </div>
  )
}

function Calendar({ assessments, onBack }) {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState(null)
  
  const months = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ]
  
  const daysOfWeek = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb']
  
  const getDaysInMonth = (date) => {
    const year = date.getFullYear()
    const month = date.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const daysInMonth = lastDay.getDate()
    const startingDay = firstDay.getDay()
    
    const days = []
    
    // Días vacíos del mes anterior
    for (let i = 0; i < startingDay; i++) {
      days.push(null)
    }
    
    // Días del mes actual
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(i)
    }
    
    return days
  }
  
  const prevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1))
  }
  
  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1))
  }
  
  const hasAssessment = (day) => {
    if (!day) return false
    const dateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
    return assessments.some(a => {
      if (!a.proximaFechaValoracion) return false
      const fecha = new Date(a.proximaFechaValoracion).toISOString().split('T')[0]
      return fecha === dateStr
    })
  }
  
  const getAssessmentsForDate = (day) => {
    if (!day) return []
    const dateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
    return assessments.filter(a => {
      if (!a.proximaFechaValoracion) return false
      const fecha = new Date(a.proximaFechaValoracion).toISOString().split('T')[0]
      return fecha === dateStr
    })
  }
  
  const today = new Date()
  const isToday = (day) => {
    return day === today.getDate() && 
           currentDate.getMonth() === today.getMonth() && 
           currentDate.getFullYear() === today.getFullYear()
  }
  
  const days = getDaysInMonth(currentDate)
  
  return (
    <div className="dashboard-calendar">
      <div className="dashboard-calendar-header">
        <button onClick={prevMonth} className="calendar-nav-btn">←</button>
        <span className="calendar-month">
          {months[currentDate.getMonth()]} {currentDate.getFullYear()}
        </span>
        <button onClick={nextMonth} className="calendar-nav-btn">→</button>
      </div>
      <div className="calendar-weekdays">
        {daysOfWeek.map(day => (
          <div key={day} className="calendar-weekday">{day}</div>
        ))}
      </div>
      <div className="calendar-days">
        {days.map((day, i) => (
          <div 
            key={i} 
            className={`calendar-day ${!day ? 'empty' : ''} ${isToday(day) ? 'today' : ''} ${hasAssessment(day) ? 'has-assessment' : ''} ${selectedDate === day ? 'selected' : ''}`}
            onClick={() => day && setSelectedDate(selectedDate === day ? null : day)}
          >
            {day}
            {hasAssessment(day) && <span className="assessment-dot"></span>}
          </div>
        ))}
      </div>
      {selectedDate && (
        <div className="calendar-selected-day">
          <h4>{selectedDate} de {months[currentDate.getMonth()]}</h4>
          {getAssessmentsForDate(selectedDate).length > 0 ? (
            <div className="calendar-events-grid">
              {getAssessmentsForDate(selectedDate).map(a => (
                <Link 
                  key={a.id} 
                  to={`/student/${a.userId}`}
                  className="calendar-event-card"
                >
                  <div className="event-avatar">
                    {a.user?.nombre?.charAt(0).toUpperCase() || '?'}
                  </div>
                  <div className="event-info">
                    <span className="event-name">{a.user?.nombre || 'Estudiante'}</span>
                    <span className="event-time">
                      {new Date(a.proximaFechaValoracion).toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <span className="event-arrow">→</span>
                </Link>
              ))}
            </div>
          ) : (
            <p className="no-events">No hay valoraciones</p>
          )}
        </div>
      )}
      <div className="calendar-footer">
        <button className="calendar-back-btn" onClick={onBack}>
          ← Volver a Valoraciones
        </button>
      </div>
    </div>
  )
}

export default function DashboardPage() {
  const { user } = useAuth()
  const [loading, setLoading] = useState(true)
  const [alert, setAlert] = useState(null)
  const [stats, setStats] = useState({
    totalStudents: 0,
    pendingPlans: 0,
    upcomingDates: 0,
    sinEps: 0
  })
  const [students, setStudents] = useState([])
  const [allActions, setAllActions] = useState([])
  const [assessments, setAssessments] = useState([])
  const [modalOpen, setModalOpen] = useState(false)
  const [modalCategory, setModalCategory] = useState('all')
  const [showCalendar, setShowCalendar] = useState(false)

  useEffect(() => {
    Promise.all([
      apiClient.get('/users?rol=usuario'),
      apiClient.get('/assessments')
    ])
    .then(([usersRes, assessmentsRes]) => {
      const studentsData = usersRes.data.data.users || []
      const assessments = assessmentsRes.data.data.assessments || []
      
      const now = new Date()
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
      const thirtyDaysFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000)
      
      // Agregar última valoración a cada estudiante
      const studentsWithAssessments = studentsData.map(s => {
        const studentAssessments = assessments.filter(a => a.userId === s.id)
        const lastAssessment = studentAssessments.length > 0 
          ? studentAssessments.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))[0]
          : null
        return { ...s, lastAssessment }
      })
      
      // Calcular estudiantes SIN NINGUNA valoración
      const studentsWithoutAssessment = studentsData.filter(s => 
        !assessments.some(a => a.userId === s.id)
      )
      
      // Calcular estudiantes sin plan de entrenamiento
      const withoutPlan = assessments.filter(a => 
        !a.planEntrenamiento || a.planEntrenamiento.trim() === ''
      )
      
      // Próximas fechas de valoración (próximos 30 días)
      const upcoming = assessments.filter(a => 
        a.proximaFechaValoracion && 
        new Date(a.proximaFechaValoracion) >= now &&
        new Date(a.proximaFechaValoracion) <= thirtyDaysFromNow
      )
      
      // Estudiantes sin certificado EPS
      const withoutEps = studentsData.filter(s => 
        !s.certificadoEps || s.certificadoEps.trim() === ''
      )
      
      // Este mes
      const thisMonthAssessments = assessments.filter(a => 
        new Date(a.createdAt) >= startOfMonth
      )
      
      // Crear lista de acciones urgentes
      const actions = []
      
      // Estudiantes sin ninguna valoración
      studentsWithoutAssessment.forEach(s => {
        actions.push({
          type: 'new',
          student: s.nombre || s.name || 'Estudiante',
          id: s.id,
          userId: s.id,
          message: 'Sin valoración física',
          date: new Date()
        })
      })
      
      // Sin plan
      withoutPlan.forEach(a => {
        actions.push({
          type: 'plan',
          student: a.user?.nombre || a.user?.name || 'Estudiante',
          id: a.id,
          userId: a.userId,
          message: 'Sin plan de entrenamiento',
          date: a.createdAt
        })
      })
      
      // Próximas fechas
      upcoming.forEach(a => {
        actions.push({
          type: 'date',
          student: a.user?.nombre || 'Estudiante',
          id: a.userId,
          message: `${new Date(a.proximaFechaValoracion).toLocaleDateString('es-CO', { month: 'short', day: 'numeric' })}`,
          date: a.proximaFechaValoracion
        })
      })
      
      // Sin EPS
      withoutEps.forEach(s => {
        actions.push({
          type: 'eps',
          student: s.nombre || s.name || 'Estudiante',
          id: s.id,
          userId: s.id,
          message: 'Sin certificado EPS',
          date: new Date()
        })
      })
      
      // Ordenar por fecha
      actions.sort((a, b) => new Date(a.date) - new Date(b.date))
      
      setStats({
        totalStudents: studentsData.length,
        pendingPlans: studentsWithoutAssessment.length + withoutPlan.length,
        upcomingDates: upcoming.length,
        sinEps: withoutEps.length
      })
      
      setAssessments(assessments)
      setStudents(studentsWithAssessments.slice(0, 3))
      setAllActions(actions)
    })
    .catch(() => {
      setAlert({ type: 'error', message: 'Error al cargar datos del dashboard' })
    })
    .finally(() => setLoading(false))
  }, [])

  function openModal(category) {
    setModalCategory(category)
    setModalOpen(true)
  }

  function getFilteredActions() {
    if (modalCategory === 'plan') {
      return allActions.filter(a => a.type === 'plan' || a.type === 'new')
    } else if (modalCategory === 'date') {
      return allActions.filter(a => a.type === 'date')
    } else if (modalCategory === 'eps') {
      return allActions.filter(a => a.type === 'eps')
    }
    return allActions
  }

  function getModalTitle() {
    if (modalCategory === 'plan') return 'Sin Plan de Entrenamiento'
    if (modalCategory === 'date') return 'Próximas Valoraciones'
    if (modalCategory === 'eps') return 'Sin Certificado EPS'
    return 'Todas las Acciones'
  }

  if (loading) return <LoadingSpinner />

  return (
    <div className="dashboard-page">
      <AlertMessage {...alert} onClose={() => setAlert(null)} />

      {/* Header */}
      <div className="dashboard-header">
        <div>
          <h1 className="dashboard-greeting">Hola, {user.nombre.split(' ')[0]} 👋</h1>
          <p className="dashboard-subtitle">Bienvenido al panel de entrenador</p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="dashboard-stats-grid">
        <StatCard 
          icon={<span>⚠️</span>} 
          label="Sin Plan" 
          value={stats.pendingPlans} 
          subtext="estudiantes"
          color="#f59e0b"
          onClick={() => openModal('plan')}
        />
        <StatCard 
          icon={<span>📅</span>} 
          label="Próximas" 
          value={stats.upcomingDates} 
          subtext="valoraciones"
          color="#10b981"
          onClick={() => openModal('date')}
        />
        <StatCard 
          icon={<span>⚡</span>} 
          label="Novedades" 
          value={stats.sinEps} 
          subtext="Generales"
          color="#f97316"
          onClick={() => openModal('eps')}
        />
        <StatCard 
          icon={<span>👥</span>} 
          label="Total" 
          value={stats.totalStudents} 
          subtext="estudiantes"
          color="#3b82f6"
        />
      </div>

      {/* Content Grid */}
      <div className="dashboard-content-grid">
        {/* Estudiantes Recientes */}
        <div className="dashboard-section">
          <div className="dashboard-section-header">
            <h2 className="dashboard-section-title">Estudiantes</h2>
          </div>
          <div className="dashboard-students-list">
            {students.length > 0 ? (
              students.map(s => (
                <Link 
                  key={s.id} 
                  to={`/student/${s.id}`} 
                  className="dashboard-student-card"
                >
                  <div className="dashboard-student-avatar">
                    {s.nombre?.charAt(0).toUpperCase() || '?'}
                  </div>
                  <div className="dashboard-student-info">
                    <span className="dashboard-student-name">{s.nombre}</span>
                    <span className="dashboard-student-meta">
                      {s.programa && s.semestre && `${s.programa} · Semestre ${s.semestre}`}
                      {s.programa && s.semestre && s.lastAssessment && ' · '}
                      {s.lastAssessment 
                        ? `Última: ${new Date(s.lastAssessment.createdAt).toLocaleDateString('es-CO', { month: 'short', day: 'numeric' })}`
                        : (!s.programa && !s.lastAssessment && 'Sin valoraciones')}
                    </span>
                  </div>
                  <span className="dashboard-student-arrow">→</span>
                </Link>
              ))
            ) : (
              <p className="dashboard-empty">No hay estudiantes registrados</p>
            )}
          </div>
        </div>

        {/* Acciones Pendientes */}
        <div className="dashboard-section">
          <div className="dashboard-section-header">
            <h2 className="dashboard-section-title">Acciones Pendientes</h2>
          </div>
          <div className="dashboard-actions-list">
            {allActions.slice(0, 3).map((action, i) => (
              <Link 
                key={i} 
                to={action.type === 'plan' ? `/assessment/${action.id}` : `/student/${action.userId || action.id}`}
                className={`dashboard-action-card dashboard-action-${action.type}`}
              >
                <div className="dashboard-action-icon">
                  {action.type === 'new' ? '🚨' : action.type === 'plan' ? '⚠️' : action.type === 'eps' ? '📄' : '📅'}
                </div>
                <div className="dashboard-action-content">
                  <span className="dashboard-action-student">{action.student}</span>
                  <span className="dashboard-action-message">{action.message}</span>
                </div>
                <span className="dashboard-action-arrow">→</span>
              </Link>
            ))}
            {allActions.length === 0 && (
              <p className="dashboard-empty">No hay acciones pendientes</p>
            )}
            {allActions.length > 3 && (
              <button className="dashboard-view-all-btn" onClick={() => openModal('all')}>
                Ver todas las acciones ({allActions.length}) →
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Modal */}
      <Modal 
        isOpen={modalOpen} 
        onClose={() => { setModalOpen(false); setShowCalendar(false) }} 
        title={getModalTitle()}
      >
        {showCalendar ? (
          <Calendar assessments={assessments} onBack={() => setShowCalendar(false)} />
        ) : (
          <div className="dashboard-modal-list">
            {getFilteredActions().length > 0 ? (
              getFilteredActions().map((action, i) => (
                <Link 
                  key={i} 
                  to={action.type === 'plan' ? `/assessment/${action.id}` : `/student/${action.userId || action.id}`}
                  className={`dashboard-action-card dashboard-action-${action.type}`}
                >
                  <div className="dashboard-action-icon">
                    {action.type === 'new' ? '🚨' : action.type === 'plan' ? '⚠️' : action.type === 'eps' ? '📄' : '📅'}
                  </div>
                  <div className="dashboard-action-content">
                    <span className="dashboard-action-student">{action.student}</span>
                    <span className="dashboard-action-message">{action.message}</span>
                  </div>
                  <span className="dashboard-action-arrow">→</span>
                </Link>
              ))
            ) : (
              <p className="dashboard-empty">No hay acciones en esta categoría</p>
            )}
            {modalCategory === 'date' && (
              <div className="modal-calendar-toggle">
                <button 
                  className="calendar-toggle-btn"
                  onClick={() => setShowCalendar(true)}
                >
                  📅 Ver Calendario
                </button>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  )
}