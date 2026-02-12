// Registro en 2 pasos:
// Paso 1: Formulario con datos personales 
// Paso 2: Registrar huella
import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import apiClient from '../api/client.js'
import { saveEnrolledTemplate } from '../utils/fingerprint.js'
import FingerprintButton from '../components/FingerprintButton.jsx'
import AlertMessage from '../components/AlertMessage.jsx'

export default function RegisterPage() {
  const navigate = useNavigate()
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [alert, setAlert] = useState(null)

  const [form, setForm] = useState({
    nombre: '', documento: '', email: '', telefono: '',
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

  // Construye el payload concatenando los campos de emergencia
  // en un solo string compatible con el backend
  function buildPayload() {
    const { nombreEmergencia, telefonoEmergencia, ...rest } = form
    return {
      ...rest,
      contactoEmergencia: `${nombreEmergencia.trim()} - ${telefonoEmergencia.trim()}`,
    }
  }

  async function handleNext(e) {
    e.preventDefault()
    setAlert(null)

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(form.email)) {
      setAlert({ type: 'error', message: 'Ingresa un correo electrónico válido (ej: usuario@correo.com)' })
      return
    }

    const bloodRegex = /^(A|B|AB|O)[+-]$/
    if (!bloodRegex.test(form.grupoSanguineo)) {
      setAlert({ type: 'error', message: 'Grupo sanguíneo inválido' })
      return
    }

    if (form.documento.length < 5) {
      setAlert({ type: 'error', message: 'El documento debe tener al menos 5 caracteres' })
      return
    }

    if (form.telefono.length < 7) {
      setAlert({ type: 'error', message: 'El teléfono debe tener al menos 7 dígitos' })
      return
    }

    if (form.nombreEmergencia.trim().length < 3) {
      setAlert({ type: 'error', message: 'El nombre del contacto de emergencia debe tener al menos 3 caracteres' })
      return
    }

    if (form.telefonoEmergencia.trim().length < 7) {
      setAlert({ type: 'error', message: 'El teléfono de emergencia debe tener al menos 7 dígitos' })
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
    <div className="auth-page">
      <div className="auth-card">
        <h1>Registro</h1>
        <p className="step-indicator">Paso {step} de 2</p>
        <AlertMessage {...alert} onClose={() => setAlert(null)} />

        {step === 1 ? (
          <form onSubmit={handleNext}>
            <fieldset>
              <legend>Datos Personales</legend>
              <label>
                Nombre completo
                <input name="nombre" value={form.nombre} onChange={handleChange} required />
              </label>
              <label>
                Documento de identidad
                <input name="documento" value={form.documento} onChange={handleChange} required />
              </label>
            </fieldset>

            <fieldset>
              <legend>Información de Contacto</legend>
              <label>
                Correo electrónico
                <input name="email" type="email" value={form.email} onChange={handleChange} required />
              </label>
              <label>
                Teléfono
                <input name="telefono" value={form.telefono} onChange={handleChange} required />
              </label>
            </fieldset>

            <fieldset>
              <legend>Información Médica</legend>
              <label>
                EPS
                <input name="eps" value={form.eps} onChange={handleChange} required />
              </label>
              <label>
                Grupo sanguíneo
                <select name="grupoSanguineo" value={form.grupoSanguineo} onChange={handleChange}>
                  {['O+','O-','A+','A-','B+','B-','AB+','AB-'].map(g => (
                    <option key={g} value={g}>{g}</option>
                  ))}
                </select>
              </label>
            </fieldset>

            <fieldset>
              <legend>Contacto de Emergencia</legend>
              <label>
                Nombre del contacto
                <input name="nombreEmergencia" value={form.nombreEmergencia} onChange={handleChange} required />
              </label>
              <label>
                Teléfono del contacto
                <input name="telefonoEmergencia" value={form.telefonoEmergencia} onChange={handleChange} required />
              </label>
            </fieldset>

            <fieldset>
              <legend>Información Académica</legend>
              <label>
                Carrera
                <input name="carrera" value={form.carrera} onChange={handleChange} required />
              </label>
              <label>
                Jornada
                <select name="jornada" value={form.jornada} onChange={handleChange}>
                  <option value="diurna">Diurna</option>
                  <option value="nocturna">Nocturna</option>
                </select>
              </label>
              <label>
                Semestre
                <input name="semestre" type="number" min="1" max="12" value={form.semestre} onChange={handleChange} required />
              </label>
            </fieldset>

            <button type="submit" className="btn-primary">Siguiente</button>
            <Link to="/login" className="auth-link">¿Ya tienes cuenta? Inicia sesión</Link>
          </form>
        ) : (
          <div className="enroll-step">
            <p>Coloca tu huella para completar el registro</p>
            <FingerprintButton onClick={handleEnroll} loading={loading} label="Registrar Huella" />
            <button className="btn-secondary" onClick={() => setStep(1)} disabled={loading}>Volver</button>
          </div>
        )}
      </div>
    </div>
  )
}
