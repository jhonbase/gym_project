import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth.js'
import apiClient from '../api/client.js'
import AlertMessage from '../components/AlertMessage.jsx'
import BrandLogo from '../components/BrandLogo.jsx'
import Footer from '../components/Footer.jsx'

export default function LoginPage() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [alert, setAlert] = useState(null)
  const [form, setForm] = useState({ email: '', password: '' })

  async function handleSubmit(e) {
    e.preventDefault()
    if (!form.email || !form.password) {
      setAlert({ type: 'warning', message: 'Completa todos los campos.' })
      return
    }

    setLoading(true)
    setAlert(null)
    try {
      const res = await apiClient.post('/auth/login', {
        email: form.email,
        password: form.password
      })
      
      login(res.data.data.token, res.data.data.user)
      setTimeout(() => navigate('/dashboard'), 100)
    } catch (err) {
      const msg = err.response?.data?.error || 'Error al iniciar sesión.'
      setAlert({ type: 'error', message: msg })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="login-accent-line" />

        <BrandLogo size="lg" />

        <p className="login-subtitle">Sistema de valoración física universitaria</p>
        <p className="login-hint">Ingresa con tus credenciales</p>

        <AlertMessage {...alert} onClose={() => setAlert(null)} />

        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <label className="ui-label">Email</label>
            <input
              type="email"
              className="ui-input"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              placeholder="agregarCorreo@ejemplo.com"
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label className="ui-label">Password</label>
            <input
              type="password"
              className="ui-input"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              placeholder="••••••••"
              disabled={loading}
            />
          </div>

          <button type="submit" className="ui-btn-primary login-btn" disabled={loading}>
            {loading ? 'Ingresando...' : 'Ingresar'}
          </button>
        </form>

        <p className="login-hint" style={{ marginTop: '1rem', fontSize: '0.8rem' }}>
          ¿Olvidaste tu contraseña? Contacta al administrador.
        </p>
      </div>
      <Footer />
    </div>
  )
}