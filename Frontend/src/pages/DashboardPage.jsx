import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth.js'
import apiClient from '../api/client.js'
import LoadingSpinner from '../components/LoadingSpinner.jsx'
import AlertMessage from '../components/AlertMessage.jsx'
import SectionCard from '../components/SectionCard.jsx'

const IconUser = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#E10600" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
  </svg>
)

const IconClipboard = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#E10600" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/>
    <rect x="8" y="2" width="8" height="4" rx="1" ry="1"/>
  </svg>
)

function badgeClass(estado) {
  if (estado === 'pendiente') return 'ui-badge ui-badge-pending'
  if (estado === 'analizada')  return 'ui-badge ui-badge-analyzed'
  return 'ui-badge ui-badge-done'
}

export default function DashboardPage() {
  const { user } = useAuth()
  const [userData, setUserData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [alert, setAlert]   = useState(null)

  useEffect(() => {
    apiClient.get(`/users/${user.id}`)
      .then(res => setUserData(res.data.data.user))
      .catch(() => setAlert({ type: 'error', message: 'No se pudieron cargar tus datos. Revisa tu conexión.' }))
      .finally(() => setLoading(false))
  }, [user.id])

  if (loading) return <LoadingSpinner />

  const u = userData || user

  const userFields = [
    { key: 'Documento',       val: u.documento },
    { key: 'Email',           val: u.email },
    { key: 'Teléfono',        val: u.telefono },
    { key: 'EPS',             val: u.eps },
    { key: 'Grupo sanguíneo', val: u.grupoSanguineo },
    { key: 'Carrera',         val: u.carrera },
    { key: 'Jornada',         val: u.jornada },
    { key: 'Semestre',        val: u.semestre },
  ]

  return (
    <div className="dashboard-page">
      <div className="dashboard-page-header">
        <span className="dashboard-page-title">Mi perfil</span>
        <Link to="/assessment/new" className="ui-btn-primary">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          Nueva Valoración
        </Link>
      </div>

      <AlertMessage {...alert} onClose={() => setAlert(null)} />

      {/* Información del usuario */}
      <SectionCard icon={<IconUser />} title="Información personal">
        <p className="dashboard-user-name">{u.nombre}</p>
        <div className="dashboard-user-grid">
          {userFields.map(({ key, val }) => (
            <div key={key} className="dashboard-user-item">
              <span className="dashboard-user-key">{key}</span>
              <span className="dashboard-user-val">{val}</span>
            </div>
          ))}
        </div>
      </SectionCard>

      {/* Valoraciones */}
      <SectionCard icon={<IconClipboard />} title="Mis valoraciones">
        <div className="assessments-section-header">
          <span className="assessments-section-title">
            {userData?.assessments?.length ?? 0} valoración(es) registrada(s)
          </span>
        </div>

        {userData?.assessments?.length > 0 ? (
          <div className="assessments-list">
            {userData.assessments.map(a => (
              <Link to={`/assessment/${a.id}`} key={a.id} className="assessment-row">
                <span className="assessment-row-date">
                  {new Date(a.createdAt).toLocaleDateString('es-CO', { year: 'numeric', month: 'short', day: 'numeric' })}
                </span>
                <span className="assessment-row-data">IMC: {a.imc} · Peso: {a.peso} kg</span>
                <span className={badgeClass(a.estadoValoracion)}>{a.estadoValoracion}</span>
              </Link>
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <p>No hay valoraciones aún.</p>
            <p style={{ marginTop: '0.35rem', color: 'var(--color-dim)' }}>Crea tu primera valoración física.</p>
          </div>
        )}
      </SectionCard>
    </div>
  )
}
