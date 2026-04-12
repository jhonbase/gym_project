import { useState, useEffect } from 'react'
import { Link, useParams, useNavigate } from 'react-router-dom'
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

const IconArrowLeft = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="15 18 9 12 15 6"/>
  </svg>
)

function badgeClass(estado) {
  if (estado === 'pendiente') return 'ui-badge ui-badge-pending'
  if (estado === 'analizada')  return 'ui-badge ui-badge-analyzed'
  return 'ui-badge ui-badge-done'
}

export default function StudentProfilePage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [student, setStudent] = useState(null)
  const [loading, setLoading] = useState(true)
  const [alert, setAlert] = useState(null)

  useEffect(() => {
    apiClient.get(`/users/${id}`)
      .then(res => setStudent(res.data.data.user))
      .catch(() => setAlert({ type: 'error', message: 'No se pudo cargar el estudiante.' }))
      .finally(() => setLoading(false))
  }, [id])

  if (loading) return <LoadingSpinner />
  if (!student) return (
    <div className="dashboard-page">
      <AlertMessage type="error" message="Estudiante no encontrado." />
      <Link to="/students" className="ui-btn-secondary">Volver a estudiantes</Link>
    </div>
  )

  const userFields = [
    { key: 'Documento',       val: student.documento },
    { key: 'Número de carnet', val: student.numeroCarnet },
    { key: 'Email',           val: student.email },
    { key: 'Teléfono',        val: student.telefono },
    { key: 'EPS',             val: student.eps },
    { key: 'Certificado EPS', val: student.certificadoEps ? 'Subido' : 'Pendiente', isCertificado: true },
    { key: 'Grupo sanguíneo', val: student.grupoSanguineo },
    { key: 'Programa',        val: student.programa },
    { key: 'Modalidad',       val: student.modalidad },
    { key: 'Jornada',         val: student.jornada },
    { key: 'Semestre',        val: student.semestre },
    { key: 'Egresado',        val: student.esEgresado ? 'Sí' : 'No' },
  ]

  return (
    <div className="dashboard-page">
      <div className="dashboard-page-header">
        <button className="back-btn" onClick={() => navigate('/students')}>
          <IconArrowLeft /> Volver
        </button>
        <Link to={`/student/${id}/assessment/new`} className="ui-btn-primary">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          Nueva Valoración
        </Link>
      </div>

      <AlertMessage {...alert} onClose={() => setAlert(null)} />

      {/* Información del estudiante */}
      <SectionCard icon={<IconUser />} title={`${student.nombre}`}>
        <div className="dashboard-user-grid">
          {userFields.map(({ key, val, isCertificado }) => (
            <div key={key} className="dashboard-user-item">
              <span className="dashboard-user-key">{key}</span>
              {isCertificado ? (
                student.certificadoEps ? (
                  <a 
                    href={`http://localhost:3000${student.certificadoEps}`} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="dashboard-user-val-link"
                  >
                    📄 Ver certificado
                  </a>
                ) : (
                  <span className="dashboard-user-val-pending">Pendiente</span>
                )
              ) : (
                <span className="dashboard-user-val">{val}</span>
              )}
            </div>
          ))}
        </div>
      </SectionCard>

      {/* Huellas registradas */}
      {student.fingerprints && student.fingerprints.length > 0 && (
        <SectionCard icon={<span>👆</span>} title="Huellas registradas">
          <div className="fingerprints-list">
            {student.fingerprints.map((fp, idx) => (
              <span key={fp.id} className="fingerprint-tag">
                Dedo {idx + 1} ✓
              </span>
            ))}
          </div>
        </SectionCard>
      )}

      {/* Valoraciones */}
      <SectionCard icon={<IconClipboard />} title="Valoraciones">
        <div className="assessments-section-header">
          <span className="assessments-section-title">
            {student.assessments?.length ?? 0} valoración(es) registrada(s)
          </span>
        </div>

        {student.assessments?.length > 0 ? (
          <div className="assessments-list">
            {student.assessments.map(a => (
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
            <p style={{ marginTop: '0.35rem', color: 'var(--color-dim)' }}>Crea la primera valoración física de este estudiante.</p>
          </div>
        )}
      </SectionCard>
    </div>
  )
}