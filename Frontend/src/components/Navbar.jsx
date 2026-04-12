import { useState, useRef, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth.js'
import BrandLogo from './BrandLogo.jsx'

/**
 * Extrae primer nombre y primer apellido de un nombre completo.
 * "Juan Carlos Pérez García" → { short: "Juan Pérez", initials: "JP" }
 */
function parseName(nombre = '') {
  const parts = nombre.trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) return { short: '', initials: '?' }

  const first  = parts[0]                              // Primer nombre
  const last   = parts.length > 1 ? parts[Math.ceil(parts.length / 2)] : '' // Primer apellido
  const short  = last ? `${first} ${last}` : first
  const initials = (first[0] + (last ? last[0] : '')).toUpperCase()

  return { short, initials }
}

export default function Navbar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)
  const menuRef = useRef(null)

  const { short, initials } = parseName(user?.nombre)

  // Cierra el dropdown al hacer click fuera
  useEffect(() => {
    function handleClickOutside(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  function handleLogout() {
    logout()
    navigate('/login')
  }

  return (
    <nav className="navbar">
      <Link to="/dashboard" className="navbar-brand">
        <BrandLogo size="md" />
      </Link>

      <div className="navbar-right">
        <Link to="/dashboard" className="navbar-link">Inicio</Link>
        {user?.rol === 'entrenador' && (
          <Link to="/students" className="navbar-link">Estudiantes</Link>
        )}

        {/* Avatar con dropdown */}
        <div className="navbar-profile" ref={menuRef}>
          <button
            className="navbar-avatar-btn"
            onClick={() => setOpen(prev => !prev)}
            aria-expanded={open}
            aria-haspopup="true"
          >
            <div className="navbar-avatar">
              {initials}
            </div>
            <span className="navbar-avatar-name">{short}</span>
            <svg
              className={`navbar-avatar-chevron ${open ? 'open' : ''}`}
              width="12" height="12" viewBox="0 0 24 24"
              fill="none" stroke="currentColor" strokeWidth="2.5"
              strokeLinecap="round" strokeLinejoin="round"
            >
              <polyline points="6 9 12 15 18 9"/>
            </svg>
          </button>

          {open && (
            <div className="navbar-dropdown">
              <div className="navbar-dropdown-header">
                <div className="navbar-dropdown-avatar">{initials}</div>
                <div>
                  <p className="navbar-dropdown-name">{short}</p>
                  <p className="navbar-dropdown-role">{user?.rol === 'entrenador' ? 'Entrenador' : 'Usuario'}</p>
                </div>
              </div>
              <div className="navbar-dropdown-divider" />
              <button className="navbar-dropdown-item navbar-dropdown-logout" onClick={handleLogout}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
                  <polyline points="16 17 21 12 16 7"/>
                  <line x1="21" y1="12" x2="9" y2="12"/>
                </svg>
                Cerrar sesión
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  )
}
