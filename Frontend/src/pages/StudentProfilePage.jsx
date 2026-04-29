import { useState, useEffect } from 'react'
import { Link, useParams, useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth.js'
import apiClient from '../api/client.js'
import LoadingSpinner from '../components/LoadingSpinner.jsx'
import AlertMessage from '../components/AlertMessage.jsx'
import SectionCard from '../components/SectionCard.jsx'
import StudentProgressSidebar from '../components/StudentProgressSidebar.jsx'

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
  const [uploadingCert, setUploadingCert] = useState(false)
  const [deletingId, setDeletingId] = useState(null)

  useEffect(() => {
    apiClient.get(`/users/${id}`)
      .then(res => setStudent(res.data.data.user))
      .catch(() => setAlert({ type: 'error', message: 'No se pudo cargar el estudiante.' }))
      .finally(() => setLoading(false))
  }, [id])

  async function handleCertificadoUpload(e) {
    const file = e.target.files[0]
    if (!file) return
    
    if (file.type !== 'application/pdf') {
      setAlert({ type: 'error', message: 'Solo se permiten archivos PDF' })
      return
    }
    if (file.size > 5 * 1024 * 1024) {
      setAlert({ type: 'error', message: 'El archivo no puede exceder 5MB' })
      return
    }
    
    setUploadingCert(true)
    const formData = new FormData()
    formData.append('certificado', file)
    
    try {
      const res = await apiClient.post(`/users/${id}/certificado`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
      setStudent(prev => ({ ...prev, certificadoEps: res.data.data.certificadoUrl }))
      setAlert({ type: 'success', message: 'Certificado subido exitosamente' })
    } catch (err) {
      setAlert({ type: 'error', message: 'Error al subir el certificado' })
    } finally {
      setUploadingCert(false)
    }
  }

  async function handleDeleteAssessment(assessmentId, assessmentDate) {
    if (!confirm(`¿Estás seguro de eliminar la valoración del ${assessmentDate}? Esta acción no se puede deshacer.`)) {
      return
    }
    
    setDeletingId(assessmentId)
    try {
      await apiClient.delete(`/assessments/${assessmentId}`)
      setStudent(prev => ({
        ...prev,
        assessments: prev.assessments.filter(a => a.id !== assessmentId)
      }))
      setAlert({ type: 'success', message: 'Valoración eliminada correctamente.' })
    } catch (err) {
      setAlert({ type: 'error', message: 'Error al eliminar la valoración.' })
    } finally {
      setDeletingId(null)
    }
  }

  if (loading) return <LoadingSpinner />
  if (!student) return (
    <div className="dashboard-page">
      <AlertMessage type="error" message="Estudiante no encontrado." />
      <Link to="/students" className="ui-btn-secondary">Volver a estudiantes</Link>
    </div>
  )

  function calculateAge(dateString) {
    if (!dateString) return null
    const birthDate = new Date(dateString)
    const today = new Date()
    
    let years = today.getFullYear() - birthDate.getFullYear()
    let months = today.getMonth() - birthDate.getMonth()
    
    if (months < 0) {
      years--
      months += 12
    }
    
    if (today.getDate() < birthDate.getDate()) {
      months--
      if (months < 0) {
        years--
        months += 12
      }
    }
    
    if (years < 0) return null
    if (years === 0 && months === 0) return 'Menos de 1 mes'
    
    const yearsText = years === 1 ? '1 año' : `${years} años`
    const monthsText = months === 1 ? '1 mes' : `${months} meses`
    
    if (years === 0) return monthsText
    if (months === 0) return yearsText
    return `${yearsText} y ${monthsText}`
  }

  const userFields = [
    { key: 'Documento',       val: student.documento },
    { key: 'Número de carnet', val: student.numeroCarnet },
    { key: 'Edad',            val: calculateAge(student.fechaNacimiento) },
    { key: 'Email',           val: student.email },
    { key: 'Teléfono',        val: student.telefono },
    { key: 'EPS',             val: student.eps },
    { key: 'Certificado EPS', val: student.certificadoEps ? 'Subido' : 'Pendiente', isCertificado: true, canUpload: true },
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

      <div className="dashboard-page-content">
        <div className="dashboard-page-main">
      {/* Información del estudiante */}
      <SectionCard icon={<IconUser />} title={`${student.nombre}`}>
        <div className="dashboard-user-grid">
          {userFields.map(({ key, val, isCertificado, canUpload }) => (
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
                ) : canUpload ? (
                  <div className="dashboard-certificado-pending">
                    <span className="dashboard-user-val-pending">Pendiente</span>
                    <label className="dashboard-certificado-btn">
                      {uploadingCert ? 'Subiendo...' : 'Subir PDF'}
                      <input
                        type="file"
                        accept=".pdf"
                        onChange={handleCertificadoUpload}
                        disabled={uploadingCert}
                        style={{ display: 'none' }}
                      />
                    </label>
                  </div>
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
              <div key={a.id} className="assessment-row-wrapper">
                <Link to={`/assessment/${a.id}`} className="assessment-row">
                  <div className="assessment-row-left">
                    <span className="assessment-row-date">
                      {new Date(a.createdAt).toLocaleDateString('es-CO', { year: 'numeric', month: 'short', day: 'numeric' })}
                    </span>
                    <span className="assessment-row-state">{a.estadoValoracion}</span>
                  </div>
                  {a.proximaFechaValoracion && (
                    <span className={`assessment-row-proxima ${new Date(a.proximaFechaValoracion) < new Date() ? 'assessment-row-proxima-overdue' : ''}`}>
                      📅 Próxima: {new Date(a.proximaFechaValoracion).toLocaleDateString('es-CO', { month: 'long', day: 'numeric' })}
                    </span>
                  )}
                </Link>
                <button 
                  className="assessment-delete-btn"
                  onClick={() => handleDeleteAssessment(a.id, new Date(a.createdAt).toLocaleDateString('es-CO'))}
                  disabled={deletingId === a.id}
                  title="Eliminar valoración"
                >
                  {deletingId === a.id ? '...' : (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                    </svg>
                  )}
                </button>
              </div>
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

        {/* Sidebar derecho */}
        <StudentProgressSidebar />
      </div>
    </div>
  )
}