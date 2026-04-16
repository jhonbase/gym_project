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
    thisMonth: 0,
    pendingPlans: 0,
    upcomingDates: 0
  })
  const [recentStudents, setRecentStudents] = useState([])
  const [pendingActions, setPendingActions] = useState([])

  useEffect(() => {
    Promise.all([
      apiClient.get('/users?rol=usuario'),
    ])
    .then(([usersRes]) => {
      const students = usersRes.data.data.users || []
      
      const now = new Date()
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
      
      // Calcular stats de estudiantes
      setStats({
        totalStudents: students.length,
        thisMonth: 0, // Sin endpoint de valoraciones globales
        pendingPlans: 0,
        upcomingDates: 0
      })
      
      // Estudiantes recientes
      const recent = students.slice(0, 6).map(s => ({
        ...s,
        lastAssessment: null
      }))
      setRecentStudents(recent)
      setPendingActions([])
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
        <Link to="/assessment/new" className="ui-btn-primary">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
          Nueva Valoración
        </Link>
      </div>

      {/* Stats Grid */}
      <div className="dashboard-stats-grid">
        <StatCard 
          icon={<span>👥</span>} 
          label="Estudiantes" 
          value={stats.totalStudents} 
          color="#3b82f6"
        />
        <StatCard 
          icon={<span>📊</span>} 
          label="Este mes" 
          value={stats.thisMonth} 
          subtext="valoraciones"
          color="#8b5cf6"
        />
        <StatCard 
          icon={<span>⚠️</span>} 
          label="Pendientes" 
          value={stats.pendingPlans} 
          subtext="sin plan"
          color="#f59e0b"
        />
        <StatCard 
          icon={<span>📅</span>} 
          label="Próximas" 
          value={stats.upcomingDates} 
          subtext="valoraciones"
          color="#10b981"
        />
      </div>

      {/* Content Grid */}
      <div className="dashboard-content-grid">
        {/* Estudiantes Recientes */}
        <div className="dashboard-section">
          <div className="dashboard-section-header">
            <h2 className="dashboard-section-title">Estudiantes Recientes</h2>
            <Link to="/students" className="dashboard-section-link">Ver todos →</Link>
          </div>
          <div className="dashboard-students-list">
            {recentStudents.length > 0 ? (
              recentStudents.map(s => (
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
                      {s.lastAssessment 
                        ? `Última: ${new Date(s.lastAssessment.createdAt).toLocaleDateString('es-CO', { month: 'short', day: 'numeric' })}`
                        : 'Sin valoraciones'}
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
            {pendingActions.length > 0 ? (
              pendingActions.map((action, i) => (
                <Link 
                  key={i} 
                  to={`/assessment/${action.id}`}
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

      {/* Quick Actions */}
      <div className="dashboard-quick-actions">
        <Link to="/students" className="dashboard-quick-action">
          <span className="dashboard-quick-icon">📋</span>
          <span>Ver Estudiantes</span>
        </Link>
        <Link to="/assessment/new" className="dashboard-quick-action">
          <span className="dashboard-quick-icon">📝</span>
          <span>Nueva Valoración</span>
        </Link>
      </div>
    </div>
  )
}