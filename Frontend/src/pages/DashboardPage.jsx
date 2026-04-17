import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth.js'
import apiClient from '../api/client.js'
import LoadingSpinner from '../components/LoadingSpinner.jsx'
import AlertMessage from '../components/AlertMessage.jsx'

function StatCard({ icon, label, value, subtext, color }) {
  return (
    <div className="dashboard-stat-card" style={{ '--stat-color': color }}>
      <div className="dashboard-stat-icon">{icon}</div>
      <div className="dashboard-stat-content">
        <span className="dashboard-stat-value">{value}</span>
        <span className="dashboard-stat-label">{label}</span>
        {subtext && <span className="dashboard-stat-subtext">{subtext}</span>}
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
    thisMonth: 0
  })
  const [students, setStudents] = useState([])
  const [urgentActions, setUrgentActions] = useState([])

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
      const sevenDaysFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)
      
      // Agregar última valoración a cada estudiante
      const studentsWithAssessments = studentsData.map(s => {
        const studentAssessments = assessments.filter(a => a.userId === s.id)
        const lastAssessment = studentAssessments.length > 0 
          ? studentAssessments.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))[0]
          : null
        return { ...s, lastAssessment }
      })
      
      // Calcular estudiantes sin plan de entrenamiento
      const withoutPlan = assessments.filter(a => 
        !a.planEntrenamiento || a.planEntrenamiento.trim() === ''
      )
      
      // Próximas fechas de valoración (próximos 7 días)
      const upcoming = assessments.filter(a => 
        a.proximaFechaValoracion && 
        new Date(a.proximaFechaValoracion) >= now &&
        new Date(a.proximaFechaValoracion) <= sevenDaysFromNow
      )
      
      // Este mes
      const thisMonthAssessments = assessments.filter(a => 
        new Date(a.createdAt) >= startOfMonth
      )
      
      // Crear lista de acciones urgentes
      const actions = []
      
      // Agregar estudiantes sin plan
      withoutPlan.forEach(a => {
        actions.push({
          type: 'plan',
          student: a.user?.nombre || 'Estudiante',
          id: a.id,
          userId: a.userId,
          message: 'Sin plan de entrenamiento',
          date: a.createdAt
        })
      })
      
      // Agregar próximas fechas
      upcoming.forEach(a => {
        actions.push({
          type: 'date',
          student: a.user?.nombre || 'Estudiante',
          id: a.userId,
          message: `Valoración: ${new Date(a.proximaFechaValoracion).toLocaleDateString('es-CO', { month: 'short', day: 'numeric' })}`,
          date: a.proximaFechaValoracion
        })
      })
      
      // Ordenar por fecha
      actions.sort((a, b) => new Date(a.date) - new Date(b.date))
      
      setStats({
        totalStudents: studentsData.length,
        pendingPlans: withoutPlan.length,
        upcomingDates: upcoming.length,
        thisMonth: thisMonthAssessments.length
      })
      
      setStudents(studentsWithAssessments.slice(0, 3))
      setUrgentActions(actions.slice(0, 6))
    })
    .catch(() => {
      setAlert({ type: 'error', message: 'Error al cargar datos del dashboard' })
    })
    .finally(() => setLoading(false))
  }, [])

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
        />
        <StatCard 
          icon={<span>📅</span>} 
          label="Próximas" 
          value={stats.upcomingDates} 
          subtext="valoraciones"
          color="#10b981"
        />
        <StatCard 
          icon={<span>📊</span>} 
          label="Total" 
          value={stats.thisMonth} 
          subtext="valoraciones"
          color="#8b5cf6"
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
            {urgentActions.length > 0 ? (
              urgentActions.map((action, i) => (
                <Link 
                  key={i} 
                  to={action.type === 'plan' ? `/assessment/${action.id}` : `/student/${action.userId || action.id}`}
                  className={`dashboard-action-card dashboard-action-${action.type}`}
                >
                  <div className="dashboard-action-icon">
                    {action.type === 'plan' ? '⚠️' : '📅'}
                  </div>
                  <div className="dashboard-action-content">
                    <span className="dashboard-action-student">{action.student}</span>
                    <span className="dashboard-action-message">{action.message}</span>
                  </div>
                  <span className="dashboard-action-arrow">→</span>
                </Link>
              ))
            ) : (
              <p className="dashboard-empty">No hay acciones pendientes ✅</p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}