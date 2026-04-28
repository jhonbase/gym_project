import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth.js'
import { useAlerts } from '../context/AlertContext.jsx'
import apiClient from '../api/client.js'
import LoadingSpinner from '../components/LoadingSpinner.jsx'
import SectionCard from '../components/SectionCard.jsx'
import { hasEnrolledFingerprint, getEnrolledTemplate, generateRandomTemplate } from '../utils/fingerprint.js'

const IconUser = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#E10600" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
  </svg>
)

const IconPlus = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
  </svg>
)

const IconSearch = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
  </svg>
)

function FormField({ label, error, children }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
      <label className="ui-label">{label}</label>
      {children}
      {error && <div style={{ color: 'var(--color-error)', fontSize: '0.75rem' }}>{error}</div>}
    </div>
  )
}

export default function StudentsPage() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const { addAlert } = useAlerts()
  const [students, setStudents] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [saving, setSaving] = useState(false)
  const [step, setStep] = useState(1)
  const [tempUserId, setTempUserId] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [editingUser, setEditingUser] = useState(null)

  const [form, setForm] = useState({
    primerNombre: '', segundoNombre: '', primerApellido: '', segundoApellido: '',
    tipoDocumento: 'CC', documento: '', fechaNacimiento: '', eps: 'Sura', grupoSanguineo: 'O+',
    email: '', telefono: '',
    nombreEmergencia: '', telefonoEmergencia: '',
    numeroCarnet: '', programa: '', esEgresado: false, modalidad: 'Presencial', jornada: 'diurna', semestre: 1,
  })

  const [certificadoEps, setCertificadoEps] = useState(null)
  const [enrollmentError, setEnrollmentError] = useState(null)
  const [deletingId, setDeletingId] = useState(null)

  useEffect(() => {
    loadStudents()
  }, [])

  async function loadStudents() {
    try {
      const res = await apiClient.get('/users?rol=usuario')
      setStudents(res.data.data.users || [])
    } catch (err) {
      addAlert('error', 'Error al cargar estudiantes')
    } finally {
      setLoading(false)
    }
  }

  function handleChange(e) {
    const { name, value, type, checked } = e.target
    setForm(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : type === 'number' ? Number(value) : value,
    }))
  }

  function buildPayload() {
    const {
      primerNombre, segundoNombre, primerApellido, segundoApellido,
      nombreEmergencia, telefonoEmergencia, tipoDocumento, 
      programa, numeroCarnet, esEgresado, modalidad, ...rest 
    } = form

    const safeTrim = (str) => (str ? String(str).trim() : '')

    const nombre = [
      safeTrim(primerNombre),
      safeTrim(segundoNombre),
      safeTrim(primerApellido),
      safeTrim(segundoApellido),
    ].filter(Boolean).join(' ')

    const contactoEmergencia = safeTrim(nombreEmergencia) && safeTrim(telefonoEmergencia)
      ? `${safeTrim(nombreEmergencia)} - ${safeTrim(telefonoEmergencia)}`
      : undefined

    return {
      ...rest,
      nombre,
      ...(form.fechaNacimiento && { fechaNacimiento: form.fechaNacimiento }),
      programa: safeTrim(programa),
      numeroCarnet: safeTrim(numeroCarnet),
      modalidad: safeTrim(modalidad),
      ...(contactoEmergencia && { contactoEmergencia }),
      esEgresado: Boolean(esEgresado),
      tipoDocumento: safeTrim(tipoDocumento),
      eps: safeTrim(form.eps),
      grupoSanguineo: safeTrim(form.grupoSanguineo),
      jornada: safeTrim(form.jornada),
    }
  }

async function handleSubmitStep1(e) {
    e.preventDefault()
    setLoading(true)

    const payload = buildPayload()

    setSaving(true)
    try {
      if (editingUser) {
        await apiClient.put(`/users/${editingUser.id}`, payload)
        addAlert('success', 'Estudiante actualizado correctamente!')
        setShowModal(false)
        resetForm()
        loadStudents()
      } else {
        const formData = new FormData()
        Object.entries(payload).forEach(([key, value]) => {
          if (value !== undefined) {
            formData.append(key, value)
          }
        })
        if (certificadoEps) {
          formData.append('certificado', certificadoEps)
        }

        const res = await apiClient.post('/users', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        })
        setTempUserId(res.data.data.user.id)
        setStep(2)
        addAlert('success', 'Datos guardados. Ahora registra la huella del estudiante.')
      }
    } catch (err) {
      const msg = err.response?.data?.error || 'Error al procesar estudiante'
      addAlert('error', msg)
    } finally {
      setSaving(false)
      setLoading(false)
    }
  }

  async function handleEnrollFingerprint() {
    const template = generateRandomTemplate()

    setSaving(true)
    try {
      await apiClient.post('/fingerprint', {
        userId: tempUserId,
        template
      })
      
      addAlert('success', 'Estudiante registrada con éxito!')
      setShowModal(false)
      resetForm()
      loadStudents()
    } catch (err) {
      const msg = err.response?.data?.error || 'Error al registrar huella'
      addAlert('error', msg)
    } finally {
      setSaving(false)
    }
  }

function resetForm() {
    setForm({
      primerNombre: '', segundoNombre: '', primerApellido: '', segundoApellido: '',
      tipoDocumento: 'CC', documento: '', eps: '', grupoSanguineo: 'O+',
      email: '', telefono: '',
      nombreEmergencia: '', telefonoEmergencia: '',
      numeroCarnet: '', programa: '', esEgresado: false, modalidad: 'Presencial', jornada: 'diurna', semestre: 1,
    })
    setCertificadoEps(null)
    setStep(1)
    setTempUserId(null)
    setEditingUser(null)
  }

  function handleCertificadoChange(e) {
    const file = e.target.files[0]
    if (file) {
if (file.type !== 'application/pdf') {
         addAlert('error', 'Solo se permiten archivos PDF')
         return
       }
       if (file.size > 5 * 1024 * 1024) {
         addAlert('error', 'El archivo no puede exceder 5MB')
        return
      }
      setCertificadoEps(file)
    }
  }

  async function handleDeleteStudent(studentId, studentName) {
    if (!confirm(`¿Estás seguro de eliminar a ${studentName}? Esta acción no se puede deshacer.`)) {
      return
    }
    
    setDeletingId(studentId)
    try {
      await apiClient.delete(`/users/${studentId}`)
      addAlert('success', 'Estudiante eliminado correctamente.')
      loadStudents()
    } catch (err) {
      addAlert('error', 'Error al eliminar el estudiante.')
    } finally {
      setDeletingId(null)
    }
  }

  function handleEditStudent(student) {
    const nombreParts = student.nombre?.split(' ') || []
    const primerNombre = nombreParts[0] || ''
    const segundoNombre = nombreParts[1] || ''
    const primerApellido = nombreParts[2] || ''
    const segundoApellido = nombreParts.slice(3).join(' ')

    const [nombreEmergencia, telefonoEmergencia] = student.contactoEmergencia?.split(' - ') || ['', '']

    setForm({
      primerNombre,
      segundoNombre,
      primerApellido,
      segundoApellido,
      tipoDocumento: student.tipoDocumento || 'CC',
      documento: student.documento || '',
      fechaNacimiento: student.fechaNacimiento ? new Date(student.fechaNacimiento).toISOString().split('T')[0] : '',
      eps: student.eps || '',
      grupoSanguineo: student.grupoSanguineo || 'O+',
      email: student.email || '',
      telefono: student.telefono || '',
      nombreEmergencia,
      telefonoEmergencia,
      numeroCarnet: student.numeroCarnet || '',
      programa: student.programa || '',
      esEgresado: student.esEgresado || false,
      modalidad: student.modalidad || 'Presencial',
      jornada: student.jornada || 'diurna',
      semestre: student.semestre || 1,
    })
    setEditingUser(student)
    setShowModal(true)
  }

  const filteredStudents = students.filter(s => 
    s.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.documento?.includes(searchTerm) ||
    s.numeroCarnet?.includes(searchTerm)
  ).sort((a, b) => {
    const proxA = getProximaValoracion(a)
    const proxB = getProximaValoracion(b)
    if (!proxA && !proxB) return 0
    if (!proxA) return 1
    if (!proxB) return -1
    return new Date(proxA.proximaFechaValoracion) - new Date(proxB.proximaFechaValoracion)
  })

  function getProximaValoracion(student) {
    if (!student.assessments?.length) return null
    const now = new Date()
    const upcoming = student.assessments
      .filter(a => a.proximaFechaValoracion && new Date(a.proximaFechaValoracion) >= now)
      .sort((a, b) => new Date(a.proximaFechaValoracion) - new Date(b.proximaFechaValoracion))
    return upcoming[0] || null
  }

  if (loading && students.length === 0) return <LoadingSpinner />

  return (
    <div className="dashboard-page">
      <div className="dashboard-page-header">
        <span className="dashboard-page-title">Estudiantes</span>
        <button className="ui-btn-primary" onClick={() => setShowModal(true)}>
          <IconPlus /> Nuevo estudiante
        </button>
      </div>

      {/* Buscador */}
      <div className="search-bar">
        <IconSearch />
        <input
          type="text"
          placeholder="Buscar por nombre, documento o carnet..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="search-input"
        />
      </div>

      {/* Lista de estudiantes - diseño vertical */}
      {filteredStudents.length > 0 ? (
        <div className="students-list">
          {filteredStudents.map(student => (
            <div key={student.id} className="student-row-wrapper">
              <Link to={`/student/${student.id}`} className="student-row">
                <div className="student-row-main">
                  <div className="student-avatar">
                    {student.nombre?.charAt(0).toUpperCase() || '?'}
                  </div>
                  <div className="student-info">
                    <span className="student-name">{student.nombre}</span>
                    <span className="student-meta">{student.programa} · {student.documento}</span>
                    {getProximaValoracion(student) && (
                      <span className="student-proxima">
                        📅 Próxima valoración: {new Date(getProximaValoracion(student).proximaFechaValoracion).toLocaleDateString('es-CO', { month: 'short', day: 'numeric' })}
                      </span>
                    )}
                  </div>
                </div>
                <div className="student-stats">
                  <span className="stat-value">{student.assessments?.length || 0}</span>
                  <span className="stat-label">valoraciones</span>
                </div>
              </Link>
              <button 
                className="student-edit-btn"
                onClick={() => handleEditStudent(student)}
                title="Editar estudiante"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                </svg>
              </button>
              <button 
                className="student-delete-btn"
                onClick={() => handleDeleteStudent(student.id, student.nombre)}
                  disabled={deletingId === student.id}
                  title="Eliminar estudiante"
                >
                  {deletingId === student.id ? '...' : (
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
          <p>No hay estudiantes registrados.</p>
          <p style={{ marginTop: '0.35rem', color: 'var(--color-dim)' }}>Agrega tu primer estudiante.</p>
        </div>
      )}

      {/* Modal para nuevo estudiante */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{editingUser ? 'Editar Estudiante' : 'Nuevo Estudiante'}</h2>
              <button className="modal-close" onClick={() => { setShowModal(false); resetForm(); }}>×</button>
            </div>

            {!editingUser && (
              <div className="step-indicator">
                <div className={`step ${step >= 1 ? 'step-active' : ''}`}>
                  <span className="step-num">1</span>
                  <span className="step-label">Datos</span>
                </div>
                <div className="step-line"></div>
                <div className={`step ${step >= 2 ? 'step-active' : ''}`}>
                  <span className="step-num">2</span>
                  <span className="step-label">Huella</span>
                </div>
              </div>
            )}

            {step === 1 ? (

            <form onSubmit={handleSubmitStep1} className="student-form">
                <div className="form-section">
                  <h3 className="form-section-title">Información Personal</h3>
                  <div className="form-grid">
                    <FormField label="Primer nombre *">
                      <input className="ui-input" name="primerNombre" value={form.primerNombre} onChange={handleChange} required />
                    </FormField>
                    <FormField label="Segundo nombre">
                      <input className="ui-input" name="segundoNombre" value={form.segundoNombre} onChange={handleChange} />
                    </FormField>
                    <FormField label="Primer apellido *">
                      <input className="ui-input" name="primerApellido" value={form.primerApellido} onChange={handleChange} required />
                    </FormField>
                    <FormField label="Segundo apellido">
                      <input className="ui-input" name="segundoApellido" value={form.segundoApellido} onChange={handleChange} />
                    </FormField>
                    <FormField label="Tipo documento *">
                      <select className="ui-input" name="tipoDocumento" value={form.tipoDocumento} onChange={handleChange}>
                        <option value="CC">Cédula de ciudadanía</option>
                        <option value="TI">Tarjeta de identidad</option>
                        <option value="CE">Cédula de extrjería</option>
                        <option value="RC">Registro civil</option>
                      </select>
                    </FormField>
                    <FormField label="Número documento *">
                      <input className="ui-input" name="documento" value={form.documento} onChange={handleChange} required />
                    </FormField>
                    <FormField label="Fecha de nacimiento">
                      <input type="date" className="ui-input" name="fechaNacimiento" value={form.fechaNacimiento} onChange={handleChange} max={new Date().toISOString().split('T')[0]} />
                    </FormField>
                  </div>
                </div>

                <div className="form-section">
                  <h3 className="form-section-title">Información Médica</h3>
                  <div className="form-grid">
                    <FormField label="EPS *">
                      <input className="ui-input" name="eps" value={form.eps} onChange={handleChange} placeholder="Nombre de la EPS" required />
                    </FormField>
                    <FormField label="Grupo sanguíneo *">
                      <select className="ui-input" name="grupoSanguineo" value={form.grupoSanguineo} onChange={handleChange}>
                        <option value="O+">O+</option>
                        <option value="O-">O-</option>
                        <option value="A+">A+</option>
                        <option value="A-">A-</option>
                        <option value="B+">B+</option>
                        <option value="B-">B-</option>
                        <option value="AB+">AB+</option>
                        <option value="AB-">AB-</option>
                      </select>
                    </FormField>
                    <FormField label="Certificado EPS">
                      <div className={`cert-upload-box ${certificadoEps ? 'cert-uploaded' : ''}`}>
                        {certificadoEps ? (
                          <div className="cert-uploaded-state">
                            <span className="cert-check">✓</span>
                            <span className="cert-name">{certificadoEps.name}</span>
                            <button type="button" className="cert-remove" onClick={() => setCertificadoEps(null)}>×</button>
                          </div>
                        ) : (
                          <label className="cert-upload-label">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/>
                            </svg>
                            <span>Subir PDF</span>
                            <input type="file" accept=".pdf" onChange={handleCertificadoChange} style={{ display: 'none' }} />
                          </label>
                        )}
                      </div>
                    </FormField>
                  </div>
                </div>

                <div className="form-section">
                  <h3 className="form-section-title">Contacto</h3>
                  <div className="form-grid">
                    <FormField label="Email *">
                      <input className="ui-input" name="email" type="email" value={form.email} onChange={handleChange} required />
                    </FormField>
                    <FormField label="Teléfono *">
                      <input className="ui-input" name="telefono" value={form.telefono} onChange={handleChange} required />
                    </FormField>
                  </div>
                </div>

                <div className="form-section">
                  <h3 className="form-section-title">Contacto de Emergencia</h3>
                  <div className="form-grid">
                    <FormField label="Nombre contacto">
                      <input className="ui-input" name="nombreEmergencia" value={form.nombreEmergencia} onChange={handleChange} />
                    </FormField>
                    <FormField label="Teléfono contacto">
                      <input className="ui-input" name="telefonoEmergencia" value={form.telefonoEmergencia} onChange={handleChange} />
                    </FormField>
                  </div>
                </div>

                <div className="form-section">
                  <h3 className="form-section-title">Información Académica</h3>
                  <div className="form-grid">
                    <FormField label="Número carnet *">
                      <input className="ui-input" name="numeroCarnet" value={form.numeroCarnet} onChange={handleChange} required />
                    </FormField>
                    <FormField label="Programa *">
                      <select className="ui-input" name="programa" value={form.programa} onChange={handleChange} required>
                        <option value="">Seleccione un programa</option>
                        <optgroup label="Profesional">
                          <option value="Administración de Empresas">Administración de Empresas</option>
                          <option value="Arquitectura">Arquitectura</option>
                          <option value="Contaduria Publica">Contaduria Publica</option>
                          <option value="Derecho">Derecho</option>
                          <option value="Ingeniería Industrial">Ingeniería Industrial</option>
                          <option value="Ingeniería de Sistemas">Ingeniería de Sistemas</option>
                          <option value="Ingenieria de Software">Ingenieria de Software</option>
                          <option value="Psicologia">Psicologia</option>
                          <option value="Medicina Veterinaria y Zootecnia">Medicina Veterinaria y Zootecnia</option>
                        </optgroup>
                        <optgroup label="Técnico / Tecnológico">
                          <option value="Auxiliar Administrativo">Auxiliar Administrativo</option>
                          <option value="Cocina Nacional e Internacional">Cocina Nacional e Internacional</option>
                          <option value="Auxiliar en Clinica Veterinaria">Auxiliar en Clinica Veterinaria</option>
                          <option value="Animación 2D y 3D">Animación 2D y 3D</option>
                          <option value="Diseño Grafico">Diseño Grafico</option>
                          <option value="Auxiliar Contable y Financiero">Auxiliar Contable y Financiero</option>
                          <option value="Investigadores Criminalisticos y Judiciales">Investigadores Criminalisticos y Judiciales</option>
                          <option value="Auxiliar en Enfermeria">Auxiliar en Enfermeria</option>
                          <option value="Seguridad Ocupacional">Seguridad Ocupacional</option>
                          <option value="Auxiliar en Productos Interactivos y Digitales">Auxiliar en Productos Interactivos y Digitales</option>
                          <option value="Auxiliar de Talento Humano">Auxiliar de Talento Humano</option>
                          <option value="Diseño, Confección y Mercadeo de Modas">Diseño, Confección y Mercadeo de Modas</option>
                          <option value="Conocimientos Acádemicos en Inglés y Francés">Conocimientos Acádemicos en Inglés y Francés</option>
                          <option value="Operaciones de Software y Redes de Cómputo">Operaciones de Software y Redes de Cómputo</option>
                        </optgroup>
                        <optgroup label="Especialización">
                          <option value="Derecho Administrativo y Contractual">Derecho Administrativo y Contractual</option>
                          <option value="Gerencia de Empresas">Gerencia de Empresas</option>
                          <option value="Gerencia del Talento Humano">Gerencia del Talento Humano</option>
                          <option value="Derecho Penal y Criminalistica">Derecho Penal y Criminalistica</option>
                          <option value="Gerencia Financiera">Gerencia Financiera</option>
                        </optgroup>
                      </select>
                    </FormField>
                    <FormField label="Semestre *">
                      <select className="ui-input" name="semestre" value={form.semestre} onChange={handleChange} required>
                        {[1,2,3,4,5,6,7,8,9].map(s => (
                          <option key={s} value={s}>{s}</option>
                        ))}
                      </select>
                    </FormField>
                    <FormField label="Modalidad">
                      <select className="ui-input" name="modalidad" value={form.modalidad} onChange={handleChange}>
                        <option value="Presencial">Presencial</option>
                        <option value="Virtual">Virtual</option>
                        <option value="Fin de semana">Fin de semana</option>
                      </select>
                    </FormField>
                    <FormField label="Jornada">
                      <select className="ui-input" name="jornada" value={form.jornada} onChange={handleChange}>
                        <option value="diurna">Diurna</option>
                        <option value="nocturna">Nocturna</option>
                      </select>
                    </FormField>
                    <FormField label="Estado">
                      <button 
                        type="button"
                        className={`toggle-btn ${form.esEgresado ? 'toggle-btn-active' : ''}`}
                        onClick={() => setForm(prev => ({ ...prev, esEgresado: !prev.esEgresado }))}
                      >
                        <span className="toggle-icon">{form.esEgresado ? '✓' : '+'}</span>
                        <span>{form.esEgresado ? 'Egresado' : 'Activo'}</span>
                      </button>
                    </FormField>
                  </div>
                </div>

                <div className="form-actions">
                  <button type="button" className="ui-btn-secondary" onClick={() => { setShowModal(false); resetForm(); }}>Cancelar</button>
                  <button type="submit" className="ui-btn-primary" disabled={saving}>
                    {saving ? 'Guardando...' : editingUser ? 'Actualizar' : 'Continuar →'}
                  </button>
                </div>
              </form>
            ) : (
              <div className="form-section step-2-container">
                <h3 className="form-section-title">Registro de Huella</h3>
                <p style={{ marginBottom: '1rem', color: 'var(--color-dim)' }}>
                  Coloca el dedo en el lector para registrar la huella del estudiante.
                </p>
                <div className="fingerprint-enroll-section">
                  <div className="fingerprint-icon-lg">
                    <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                      <circle cx="9" cy="7" r="4"/>
                      <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
                      <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
                    </svg>
                  </div>
                  <p className="fingerprint-instruction">
                    Haz clic en el botón para simular el registro de huella del estudiante.
                  </p>
                </div>
                <div className="form-actions">
                  <button type="button" className="ui-btn-secondary" onClick={() => setStep(1)}>← Atrás</button>
                  <button 
                    type="button" 
                    className="ui-btn-primary fingerprint-btn"
                    onClick={handleEnrollFingerprint}
                    disabled={saving}
                  >
                    {saving ? 'Registrando...' : 'Registrar Huella'}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}