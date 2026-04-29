import { Link, useParams, useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth.js'
import { useEffect, useState } from 'react'
import apiClient from '../api/client.js'
import LoadingSpinner from '../components/LoadingSpinner.jsx'

const IconArrowLeft = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="15 18 9 12 15 6"/>
  </svg>
)

const IconTrendUp = () => (
  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/>
  </svg>
)

const IconScale = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M16 2v16M8 2v16M3 10h18M3 14h18"/>
  </svg>
)

const IconRuler = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 12H3M21 4H3M21 20H3M12 3v18M19 3v4M19 17v4M12 21v-2"/>
  </svg>
)

const IconActivity = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
  </svg>
)

const IconTarget = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/>
  </svg>
)

function MetricCard({ icon, label, value, unit }) {
  return (
    <div className="progress-metric-card">
      <div className="progress-metric-icon">{icon}</div>
      <div className="progress-metric-content">
        <span className="progress-metric-value">{value}</span>
        <span className="progress-metric-unit">{unit}</span>
        <span className="progress-metric-label">{label}</span>
      </div>
    </div>
  )
}

export default function StudentProgressPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const [student, setStudent] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    apiClient.get(`/users/${id}`)
      .then(res => setStudent(res.data.data.user))
      .catch(() => navigate(`/student/${id}`))
      .finally(() => setLoading(false))
  }, [id])

  if (loading) return <LoadingSpinner />

  return (
    <div className="progress-page">
      <div className="progress-page-header">
        <button className="back-btn" onClick={() => navigate(`/student/${id}`)}>
          <IconArrowLeft /> Volver
        </button>
        <h1 className="progress-page-title">Progreso de {student?.nombre}</h1>
      </div>

      <div className="progress-pagecoming">
        <div className="progress-pagecoming-icon">
          <IconTrendUp />
        </div>
        <h2>Próximamente</h2>
        <p>Esta página mostrará el progreso físico del estudiante, incluyendo:</p>
        <ul>
          <li>Evolución de peso y composición corporal</li>
          <li>IMC y porcentaje de grasa</li>
          <li>Masa muscular y fuerza</li>
          <li>Comparativas entre valoraciones</li>
        </ul>
        
        <div className="progress-metrics-preview">
          <MetricCard icon={<IconScale />} label="Peso" value="--" unit="kg" />
          <MetricCard icon={<IconRuler />} label="Estatura" value="--" unit="cm" />
          <MetricCard icon={<IconActivity />} label="% Grasa" value="--" unit="%" />
          <MetricCard icon={<IconTarget />} label="IMC" value="--" unit="" />
        </div>

        <p className="progress-pagecoming-note">
          Los datos se cargarán automáticamente desde las valoraciones físicas registradas.
        </p>
      </div>
    </div>
  )
}