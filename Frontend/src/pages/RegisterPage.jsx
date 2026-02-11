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
  const [step, setStep] = useState(1) // 1 = datos, 2 = huella
  const [loading, setLoading] = useState(false)
  const [alert, setAlert] = useState(null)

  // Estado del formulario con todos los campos
  const [form, setForm] = useState({
    nombre: '', documento: '', email: '', telefono: '',
    eps: '', grupoSanguineo: 'O+', contactoEmergencia: '',
    carrera: '', jornada: 'diurna', semestre: 1,
  })

  // Actualiza un campo del formulario
  function handleChange(e) {
    const { name, value, type } = e.target
    setForm(prev => ({
      ...prev,
      [name]: type === 'number' ? Number(value) : value,
    }))
  }

  // Paso 1 → Paso 2
async function handleNext(e) {
  e.preventDefault()
  setAlert(null)

  // Validaciones básicas antes de pasar al paso 2
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

  setStep(2)
}

  // Paso 2: Crear usuario + registrar huella
  async function handleEnroll() {
    setLoading(true)
    setAlert(null)
    try {
      // 1. Crear usuario en la BD
      const userRes = await apiClient.post('/users', form)
      const user = userRes.data.data.user

      // 2. Registrar huella para este usuario
      const fpRes = await apiClient.post('/fingerprint/enroll', { userId: user.id })
      const { template } = fpRes.data.data

      // 3. Guardar template en localStorage (simula "enrollar el dedo")
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
        <h1>🏋️ Registro</h1>
        <p className="step-indicator">Paso {step} de 2</p>
        <AlertMessage {...alert} onClose={() => setAlert(null)} />

        {step === 1 ? (
          <form onSubmit={handleNext}>
            <input name="nombre" placeholder="Nombre completo" value={form.nombre} onChange={handleChange} required />
            <input name="documento" placeholder="Documento de identidad" value={form.documento} onChange={handleChange} required />
            <input name="email" type="email" placeholder="Correo electrónico" value={form.email} onChange={handleChange} required />
            <input name="telefono" placeholder="Teléfono" value={form.telefono} onChange={handleChange} required />
            <input name="eps" placeholder="EPS" value={form.eps} onChange={handleChange} required />

            <select name="grupoSanguineo" value={form.grupoSanguineo} onChange={handleChange}>
              {['O+','O-','A+','A-','B+','B-','AB+','AB-'].map(g => (
                <option key={g} value={g}>{g}</option>
              ))}
            </select>

            <input name="contactoEmergencia" placeholder="Contacto de emergencia (nombre + tel)" value={form.contactoEmergencia} onChange={handleChange} required />
            <input name="carrera" placeholder="Carrera" value={form.carrera} onChange={handleChange} required />

            <select name="jornada" value={form.jornada} onChange={handleChange}>
              <option value="diurna">Diurna</option>
              <option value="nocturna">Nocturna</option>
            </select>

            <input name="semestre" type="number" min="1" max="12" placeholder="Semestre" value={form.semestre} onChange={handleChange} required />

            <button type="submit" className="btn-primary">Siguiente →</button>
            <Link to="/login" className="auth-link">¿Ya tienes cuenta? Inicia sesión</Link>
          </form>
        ) : (
          <div className="enroll-step">
            <p>Coloca tu huella para completar el registro</p>
            <FingerprintButton onClick={handleEnroll} loading={loading} label="Registrar Huella" />
            <button className="btn-secondary" onClick={() => setStep(1)} disabled={loading}>← Volver</button>
          </div>
        )}
      </div>
    </div>
  )
}