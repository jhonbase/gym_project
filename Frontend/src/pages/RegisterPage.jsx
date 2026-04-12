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
    // Variables Información Personal
    primerNombre: '', segundoNombre: '', primerApellido: '', segundoApellido: '',
    tipoDocumento: 'CC', documento: '', eps: 'Sura', grupoSanguineo: 'O+',
    // Contacto
    email: '', telefono: '',
    // Variables Contacto de Emergencia
    nombreEmergencia: '', telefonoEmergencia: '',
    // Variables Información Académica
    numeroCarnet: '', programa: '', esEgresado: false, modalidad: 'Presencial', jornada: 'diurna', semestre: 1,
  })

  const [certificadoEps, setCertificadoEps] = useState(null)

  function handleChange(e) {
    const { name, value, type } = e.target
    setForm(prev => ({
      ...prev,
      [name]: type === 'number' ? Number(value) : value,
    }))
  }

  function handleCertificadoChange(e) {
    const file = e.target.files[0]
    if (file) {
      if (file.type !== 'application/pdf') {
        setAlert({ type: 'error', message: 'Solo se permiten archivos PDF' })
        return
      }
      if (file.size > 5 * 1024 * 1024) {
        setAlert({ type: 'error', message: 'El archivo no puede exceder 5MB' })
        return
      }
      setCertificadoEps(file)
    }
  }

  function buildPayload() {
      // 1. Extraemos los campos del formulario
      const {
        primerNombre, segundoNombre, primerApellido, segundoApellido,
        nombreEmergencia, telefonoEmergencia, tipoDocumento, 
        programa, numeroCarnet, esEgresado, modalidad, ...rest 
      } = form

      // 2. Función segura para limpiar texto (si es null o undefined, devuelve texto vacío)
      const safeTrim = (str) => (str ? String(str).trim() : '')

      // 3. Construimos el nombre completo sin que se rompa por campos vacíos
      const nombre = [
        safeTrim(primerNombre),
        safeTrim(segundoNombre),
        safeTrim(primerApellido),
        safeTrim(segundoApellido),
      ].filter(Boolean).join(' ')

      // 4. Retornamos el objeto final que la base de datos espera
      return {
        ...rest,
        nombre,
        programa: safeTrim(programa),
        numeroCarnet: safeTrim(numeroCarnet),
        modalidad: safeTrim(modalidad),
        esEgresado: esEgresado,
        documento: `${tipoDocumento} ${safeTrim(form.documento)}`,
        contactoEmergencia: `${safeTrim(nombreEmergencia)} - ${safeTrim(telefonoEmergencia)}`,
      }
    }

  async function handleNext(e) {
    e.preventDefault()
    setAlert(null)

    // Primer nombre: obligatorio, solo letras
    if (!form.primerNombre || !/^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ]+$/.test(form.primerNombre.trim())) {
      setAlert({ type: 'error', message: 'El primer nombre es obligatorio y solo debe contener letras' })
      return
    }

    // Para campos opcionales como segundoNombre, hazlo así:
    if (form.segundoNombre && !/^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ]+$/.test(form.segundoNombre.trim())) {
      setAlert({ type: 'error', message: 'El segundo nombre solo debe contener letras' })
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

    // Programa: solo letras y espacios
    if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s]+$/.test(form.programa.trim())) {
      setAlert({ type: 'error', message: 'El programa solo debe contener letras' })
      return
    }

    setStep(2)
  }

  async function handleEnroll() {
    setLoading(true)
    setAlert(null)
    try {
      const payload = buildPayload()
      
      const formData = new FormData()
      Object.keys(payload).forEach(key => {
        formData.append(key, payload[key])
      })
      if (certificadoEps) {
        formData.append('certificado', certificadoEps)
      }
      
      const userRes = await apiClient.post('/users', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
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
                        <option value="PPT">PPT</option>
                        <option value="PAS">Pasaporte</option>
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

                  {/* Fila de Salud independiente para que se estiren los campos */}
                  <div className="register-row register-row-3">
                    <div className="register-field">
                      <label className="register-label">EPS *</label>
                      <input
                        className="register-input"
                        name="eps"
                        value={form.eps}
                        onChange={handleChange}
                        placeholder="Nombre de EPS"
                        required
                      />
                    </div>
                    <div className="register-field">
                      <label className="register-label">Certificado EPS</label>
                      <div className="certificado-upload">
                        <input
                          type="file"
                          id="certificadoEps"
                          accept=".pdf"
                          onChange={handleCertificadoChange}
                          className="certificado-input"
                        />
                        <label htmlFor="certificadoEps" className={`certificado-label ${certificadoEps ? 'certificado-check' : ''}`}>
                          {certificadoEps ? (
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                              <polyline points="20 6 9 17 4 12"/>
                            </svg>
                          ) : (
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/>
                            </svg>
                          )}
                          {certificadoEps ? 'Subido' : 'Subir PDF'}
                        </label>
                      </div>
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

            {/* Sección 3: Contacto de Emergencia */}
            <div className="register-section">
              <div className="register-section-header">
                <span className="register-section-icon">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#E10600" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polygon points="7.86 2 16.14 2 22 7.86 22 16.14 16.14 22 7.86 22 2 16.14 2 7.86 7.86 2"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                </span>
                <span className="register-section-title">3. Contacto de Emergencia</span>
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

            {/* Sección 3: Información Académica */}
            <div className="register-section">
              <div className="register-section-header">
                <span className="register-section-icon">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#E10600" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/></svg>
                </span>
                <span className="register-section-title">4. Información Académica</span>
              </div>
              
              <div className="register-section-body">
                {/* Fila 1: Carnet y Programa */}
                <div className="register-row">
                  <div className="register-field">
                    <label className="register-label">Número de carnet *</label>
                    <input
                      className="register-input"
                      name="numeroCarnet"
                      value={form.numeroCarnet}
                      onChange={handleChange}
                      placeholder="Mismo número de documento"
                      required
                    />
                  </div>
                  <div className="register-field">
                    <label className="register-label">Programa académico *</label>
                    <select 
                      className="register-input" 
                      name="programa" 
                      value={form.programa} 
                      onChange={handleChange} 
                      required
                    >
                      <option value="">Seleccione un programa</option>
                      <optgroup label="Profesional">
                        <option value="Administración de Empresas">Administración de Empresas</option>
                        <option value="Ingeniería de Sistemas">Arquitectura</option>
                        <option value="Administración de Empresas">Contaduria Publica</option>
                        <option value="Ingeniería Industrial">Derecho</option>
                        <option value="Ingeniería Industrial">Ingeniería Industrial</option>
                        <option value="Ingeniería de Sistemas">Ingeniería de Sistemas</option>
                        <option value="Administración de Empresas">Ingenieria de Software</option>
                        <option value="Ingeniería de Sistemas">Psicologia</option>
                        <option value="Ingeniería Industrial">Medicina Veterinaria y Zootecnia</option>
                      </optgroup>
                      <optgroup label="Técnico / Tecnológico">
                        <option value="Técnico en Desarrollo de Software">Auxiliar Administrativo</option>
                        <option value="Técnico en Desarrollo de Software">Cocina Nacional e Internacional</option>
                        <option value="Técnico en Desarrollo de Software">Auxiliar en Clinica Veterinaria</option>
                        <option value="Técnico en Desarrollo de Software">Animación 2D y 3D</option>
                        <option value="Técnico en Desarrollo de Software">Diseño Grafico</option>
                        <option value="Técnico en Desarrollo de Software">Auxiliar Contable y Financiero</option>
                        <option value="Técnico en Desarrollo de Software">Investigadores Criminalisticos y Judiciales</option>
                        <option value="Técnico en Desarrollo de Software">Auxiliar en Enfermeria</option>
                        <option value="Técnico en Desarrollo de Software">Seguridad Ocupacional</option>
                        <option value="Técnico en Desarrollo de Software">Auxiliar en Productos Interactivos y Digitales</option>
                        <option value="Técnico en Desarrollo de Software">Auxiliar de Talento Humano</option>
                        <option value="Técnico en Desarrollo de Software">Diseño, Confección y Mercadeo de Modas</option>
                        <option value="Técnico en Desarrollo de Software">Conocimientos Acádemicos en Inglés y Francés</option>
                        <option value="Técnico en Desarrollo de Software">Operaciones de Software y Redes de Cómputo</option>
                      </optgroup>
                      <optgroup label="Especialización">
                        <option value="Gerencia de Proyectos">Derecho Administrativo y Contractual</option>
                        <option value="Seguridad de la Información">Gerencia de Empresas</option>
                        <option value="Gerencia de Proyectos">Gerencia del Talento Humano</option>
                        <option value="Seguridad de la Información">Derecho Penal y Criminalistica</option>
                        <option value="Gerencia de Proyectos">Gerencia Financiera</option>
                      </optgroup>
                    </select>
                  </div>
                </div>

                {/* Fila 2: Modalidad, Jornada y Semestre */}
                <div className="register-row register-row-3">
                  <div className="register-field">
                    <label className="register-label">Modalidad</label>
                    <select className="register-input" name="modalidad" value={form.modalidad} onChange={handleChange}>
                      <option value="Presencial">Presencial</option>
                      <option value="Virtual">Virtual</option>
                      <option value="Fin de semana">Fin de semana</option>
                    </select>
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

                {/* Fila 3: Estado de egresado */}
                <div className="register-row">
                  <div className="register-field-checkbox">
                    <label className="register-label-check">
                      <input
                        type="checkbox"
                        name="esEgresado"
                        checked={form.esEgresado}
                        onChange={(e) => setForm(prev => ({ ...prev, esEgresado: e.target.checked }))}
                      />
                      ¿Ya eres egresado de la institución?
                    </label>
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
