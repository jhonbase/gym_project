// Registro en 2 pasos:
// Paso 1: Formulario con datos personales 
// Paso 2: Registrar huella
import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import apiClient from '../api/client.js'
import { saveEnrolledTemplate } from '../utils/fingerprint.js'
import FingerprintButton from '../components/FingerprintButton.jsx'
import AlertMessage from '../components/AlertMessage.jsx'
import BrandLogo from '../components/BrandLogo.jsx'

export default function RegisterPage() {
  const navigate = useNavigate()
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [alert, setAlert] = useState(null)

  const [form, setForm] = useState({
    primerNombre: '', segundoNombre: '', primerApellido: '', segundoApellido: '',
    tipoDocumento: 'CC', documento: '', email: '', telefono: '',
    eps: '', grupoSanguineo: 'O+',
    nombreEmergencia: '', telefonoEmergencia: '',
    carrera: '', jornada: 'diurna', semestre: 1,
  })

  function handleChange(e) {
    const { name, value, type } = e.target
    setForm(prev => ({
      ...prev,
      [name]: type === 'number' ? Number(value) : value,
    }))
  }

  function buildPayload() {
    const {
      primerNombre, segundoNombre, primerApellido, segundoApellido,
      nombreEmergencia, telefonoEmergencia, tipoDocumento, ...rest
    } = form

    // Construye el nombre completo concatenando los campos no vacíos
    const nombre = [
      primerNombre.trim(),
      segundoNombre.trim(),
      primerApellido.trim(),
      segundoApellido.trim(),
    ].filter(Boolean).join(' ')

    return {
      ...rest,
      nombre,
      documento: `${tipoDocumento} ${form.documento.trim()}`,
      contactoEmergencia: `${nombreEmergencia.trim()} - ${telefonoEmergencia.trim()}`,
    }
  }

  async function handleNext(e) {
    e.preventDefault()
    setAlert(null)

    // Primer nombre: obligatorio, solo letras
    if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ]+$/.test(form.primerNombre.trim())) {
      setAlert({ type: 'error', message: 'El primer nombre solo debe contener letras' })
      return
    }

    // Primer apellido: obligatorio, solo letras
    if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ]+$/.test(form.primerApellido.trim())) {
      setAlert({ type: 'error', message: 'El primer apellido solo debe contener letras' })
      return
    }

    // Segundo nombre: opcional, pero si se llena debe ser solo letras
    if (form.segundoNombre.trim() && !/^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ]+$/.test(form.segundoNombre.trim())) {
      setAlert({ type: 'error', message: 'El segundo nombre solo debe contener letras' })
      return
    }

    // Segundo apellido: opcional, pero si se llena debe ser solo letras
    if (form.segundoApellido.trim() && !/^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ]+$/.test(form.segundoApellido.trim())) {
      setAlert({ type: 'error', message: 'El segundo apellido solo debe contener letras' })
      return
    }

    // Documento: solo números
    if (!/^\d+$/.test(form.documento)) {
      setAlert({ type: 'error', message: 'El documento solo debe contener números' })
      return
    }

    if (form.documento.length < 10) {
      setAlert({ type: 'error', message: 'El documento debe tener al menos 10 dígitos' })
      return
    }

    // Email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(form.email)) {
      setAlert({ type: 'error', message: 'Ingresa un correo electrónico válido (ej: usuario@correo.com)' })
      return
    }

    // Teléfono: solo números
    if (!/^\d+$/.test(form.telefono)) {
      setAlert({ type: 'error', message: 'El teléfono solo debe contener números' })
      return
    }

    if (form.telefono.length < 10) {
      setAlert({ type: 'error', message: 'El teléfono debe tener al menos 10 dígitos' })
      return
    }

    // Grupo sanguíneo
    if (!/^(A|B|AB|O)[+-]$/.test(form.grupoSanguineo)) {
      setAlert({ type: 'error', message: 'Grupo sanguíneo inválido' })
      return
    }

    // Contacto de emergencia: nombre solo letras
    if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s]+$/.test(form.nombreEmergencia.trim())) {
      setAlert({ type: 'error', message: 'El nombre del contacto solo debe contener letras' })
      return
    }

    if (form.nombreEmergencia.trim().length < 3) {
      setAlert({ type: 'error', message: 'El nombre del contacto de emergencia debe tener al menos 3 caracteres' })
      return
    }

    // Contacto de emergencia: teléfono solo números
    if (!/^\d+$/.test(form.telefonoEmergencia)) {
      setAlert({ type: 'error', message: 'El teléfono de emergencia solo debe contener números' })
      return
    }

    if (form.telefonoEmergencia.trim().length < 10) {
      setAlert({ type: 'error', message: 'El teléfono de emergencia debe tener al menos 10 dígitos' })
      return
    }

    // Carrera: solo letras y espacios
    if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s]+$/.test(form.carrera.trim())) {
      setAlert({ type: 'error', message: 'La carrera solo debe contener letras' })
      return
    }

    setStep(2)
  }

  async function handleEnroll() {
    setLoading(true)
    setAlert(null)
    try {
      const payload = buildPayload()
      const userRes = await apiClient.post('/users', payload)
      const user = userRes.data.data.user

      const fpRes = await apiClient.post('/fingerprint/enroll', { userId: user.id })
      const { template } = fpRes.data.data

      saveEnrolledTemplate(template)

      setAlert({ type: 'success', message: '¡Registro exitoso! Redirigiendo al login...' })
      setTimeout(() => navigate('/login'), 2000)
    } catch (err) {
      const msg = err.response?.data?.error || err.response?.data?.details?.[0]?.message || 'Error en el registro'
      setAlert({ type: 'error', message: msg })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="register-page">

      {/* Header exclusivo del registro */}
      <header className="register-page-header">
        <BrandLogo size="rg" />
      </header>

      <div className="register-card">
        {/* Header */}
        <div className="register-header">
          <div className="register-logo-line" />
          <h1 className="register-title">Crear cuenta</h1>
          <p className="register-subtitle">
            {step === 1 ? 'Completa tu información para unirte' : 'Último paso: registra tu huella dactilar'}
          </p>
          <div className="register-steps">
            <div className={`register-step-dot ${step >= 1 ? 'active' : ''}`} />
            <div className={`register-step-line ${step >= 2 ? 'active' : ''}`} />
            <div className={`register-step-dot ${step >= 2 ? 'active' : ''}`} />
          </div>
          <p className="register-step-label">Paso {step} de 2</p>
        </div>

        <AlertMessage {...alert} onClose={() => setAlert(null)} />

        {step === 1 ? (
          <form onSubmit={handleNext} className="register-form">

            {/* Sección 1: Información Personal */}
            <div className="register-section">
              <div className="register-section-header">
                <span className="register-section-icon">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#E10600" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                </span>
                <span className="register-section-title">1. Información Personal</span>
              </div>
              <div className="register-section-body">
                <div className="register-row">
                  <div className="register-field">
                    <label className="register-label">Primer nombre *</label>
                    <input
                      className="register-input"
                      name="primerNombre"
                      value={form.primerNombre}
                      onChange={handleChange}
                      placeholder="Ej: Juan"
                      required
                    />
                  </div>
                  <div className="register-field">
                    <label className="register-label">Segundo nombre</label>
                    <input
                      className="register-input"
                      name="segundoNombre"
                      value={form.segundoNombre}
                      onChange={handleChange}
                      placeholder="Ej: Carlos"
                    />
                  </div>
                </div>
                <div className="register-row">
                  <div className="register-field">
                    <label className="register-label">Primer apellido *</label>
                    <input
                      className="register-input"
                      name="primerApellido"
                      value={form.primerApellido}
                      onChange={handleChange}
                      placeholder="Ej: Pérez"
                      required
                    />
                  </div>
                  <div className="register-field">
                    <label className="register-label">Segundo apellido</label>
                    <input
                      className="register-input"
                      name="segundoApellido"
                      value={form.segundoApellido}
                      onChange={handleChange}
                      placeholder="Ej: García"
                    />
                  </div>
                </div>
                <div className="register-row">
                  <div className="register-field">
                    <label className="register-label">Tipo de documento</label>
                    <select className="register-input" name="tipoDocumento" value={form.tipoDocumento} onChange={handleChange}>
                      <option value="CC">Cédula de ciudadanía</option>
                      <option value="TI">Tarjeta de identidad</option>
                      <option value="CE">Cédula de extranjería</option>
                    </select>
                  </div>
                  <div className="register-field">
                    <label className="register-label">Número de documento</label>
                    <input
                      className="register-input"
                      name="documento"
                      inputMode="numeric"
                      value={form.documento}
                      onChange={handleChange}
                      placeholder="1234567890"
                      required
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Sección 2: Contacto */}
            <div className="register-section">
              <div className="register-section-header">
                <span className="register-section-icon">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#E10600" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 11.5 19.79 19.79 0 0 1 1.61 2.86 2 2 0 0 1 3.61.68h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.27a16 16 0 0 0 5.82 5.82l.97-.97a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
                </span>
                <span className="register-section-title">2. Contacto</span>
              </div>
              <div className="register-section-body">
                <div className="register-row">
                  <div className="register-field">
                    <label className="register-label">Email</label>
                    <input
                      className="register-input"
                      name="email"
                      type="email"
                      value={form.email}
                      onChange={handleChange}
                      placeholder="juan.perez@ejemplo.com"
                      required
                    />
                  </div>
                  <div className="register-field">
                    <label className="register-label">Teléfono</label>
                    <input
                      className="register-input"
                      name="telefono"
                      inputMode="numeric"
                      value={form.telefono}
                      onChange={handleChange}
                      placeholder="300 000 0000"
                      required
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Sección 3: Información Médica */}
            <div className="register-section">
              <div className="register-section-header">
                <span className="register-section-icon">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#E10600" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>
                </span>
                <span className="register-section-title">3. Información Médica</span>
              </div>
              <div className="register-section-body">
                <div className="register-row">
                  <div className="register-field">
                    <label className="register-label">EPS</label>
                    <input
                      className="register-input"
                      name="eps"
                      value={form.eps}
                      onChange={handleChange}
                      placeholder="Nombre de tu EPS"
                      required
                    />
                  </div>
                  <div className="register-field">
                    <label className="register-label">Tipo de sangre</label>
                    <select className="register-input" name="grupoSanguineo" value={form.grupoSanguineo} onChange={handleChange}>
                      {['O+','O-','A+','A-','B+','B-','AB+','AB-'].map(g => (
                        <option key={g} value={g}>{g}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            </div>

            {/* Sección 4: Contacto de Emergencia */}
            <div className="register-section">
              <div className="register-section-header">
                <span className="register-section-icon">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#E10600" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polygon points="7.86 2 16.14 2 22 7.86 22 16.14 16.14 22 7.86 22 2 16.14 2 7.86 7.86 2"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                </span>
                <span className="register-section-title">4. Contacto de Emergencia</span>
              </div>
              <div className="register-section-body">
                <div className="register-row">
                  <div className="register-field">
                    <label className="register-label">Nombre de contacto</label>
                    <input
                      className="register-input"
                      name="nombreEmergencia"
                      value={form.nombreEmergencia}
                      onChange={handleChange}
                      placeholder="Nombre completo"
                      required
                    />
                  </div>
                  <div className="register-field">
                    <label className="register-label">Teléfono de emergencia</label>
                    <input
                      className="register-input"
                      name="telefonoEmergencia"
                      inputMode="numeric"
                      value={form.telefonoEmergencia}
                      onChange={handleChange}
                      placeholder="Número de contacto"
                      required
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Sección 5: Información Académica */}
            <div className="register-section">
              <div className="register-section-header">
                <span className="register-section-icon">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#E10600" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/></svg>
                </span>
                <span className="register-section-title">5. Información Académica</span>
              </div>
              <div className="register-section-body">
                <div className="register-row register-row-3">
                  <div className="register-field">
                    <label className="register-label">Carrera</label>
                    <input
                      className="register-input"
                      name="carrera"
                      value={form.carrera}
                      onChange={handleChange}
                      placeholder="Tu programa"
                      required
                    />
                  </div>
                  <div className="register-field">
                    <label className="register-label">Jornada</label>
                    <select className="register-input" name="jornada" value={form.jornada} onChange={handleChange}>
                      <option value="diurna">Diurna</option>
                      <option value="nocturna">Nocturna</option>
                    </select>
                  </div>
                  <div className="register-field">
                    <label className="register-label">Semestre</label>
                    <select
                      className="register-input"
                      name="semestre"
                      value={form.semestre}
                      onChange={e => setForm(prev => ({ ...prev, semestre: Number(e.target.value) }))}
                    >
                      {[1,2,3,4,5,6,7,8,9].map(s => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            </div>

            {/* Acciones */}
            <div className="register-actions">
              <Link to="/login" className="register-btn-cancel">Cancelar</Link>
              <button type="submit" className="register-btn-primary">
                Registrarme <span className="register-btn-arrow">→</span>
              </button>
            </div>

          </form>
        ) : (
          <div className="register-enroll-step">
            <div className="register-enroll-icon">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#E10600" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 11c0 3.517-1.009 6.799-2.753 9.571m-3.44-2.04l.054-.09A13.916 13.916 0 0 0 8 11a4 4 0 1 1 8 0c0 1.017-.07 2.019-.203 3m-2.118 6.844A21.88 21.88 0 0 0 15.171 17m3.839 1.132c.645-2.266.99-4.659.99-7.132A8 8 0 0 0 4 11"/></svg>
            </div>
            <p className="register-enroll-text">Coloca tu dedo en el lector para completar el registro</p>
            <FingerprintButton onClick={handleEnroll} loading={loading} label="Registrar Huella" />
            <button className="register-btn-back" onClick={() => setStep(1)} disabled={loading}>
              ← Volver
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
