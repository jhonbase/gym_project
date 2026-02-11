import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth.js'
import apiClient from '../api/client.js'
import { getEnrolledTemplate, hasEnrolledFingerprint, mutateTemplate } from '../utils/fingerprint.js'
import FingerprintButton from '../components/FingerprintButton.jsx'
import AlertMessage from '../components/AlertMessage.jsx'

export default function LoginPage() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [alert, setAlert] = useState(null)

  async function handleScan() {
    if (!hasEnrolledFingerprint()) {
      setAlert({ type: 'warning', message: 'No hay huella registrada en este dispositivo. Regístrate primero.' })
      return
    }

    setLoading(true)
    setAlert(null)
    try {
      const original = getEnrolledTemplate()
      const scanned = mutateTemplate(original) // Simula variación natural

      const res = await apiClient.post('/fingerprint/login', { template: scanned })
      const { access, user, similarity } = res.data.data

      if (access) {
        login(user)
        navigate('/dashboard')
      } else {
        setAlert({ type: 'error', message: `Acceso denegado. Similitud: ${similarity?.toFixed(1)}%` })
      }
    } catch {
      setAlert({ type: 'error', message: 'Error al escanear. Intenta de nuevo.' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h1>🏋️ GymSystem</h1>
        <p>Coloca tu huella para ingresar</p>
        <AlertMessage {...alert} onClose={() => setAlert(null)} />
        <FingerprintButton onClick={handleScan} loading={loading} />
        <Link to="/register" className="auth-link">¿No tienes cuenta? Regístrate</Link>
      </div>
    </div>
  )
}