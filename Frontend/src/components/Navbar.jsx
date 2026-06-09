import { useState, useRef, useEffect } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth.js'
import BrandLogo from './BrandLogo.jsx'
import { useTrainerStatus, ESTADOS } from '../hooks/useTrainerStatus.js'

function parseName(nombre = '') {
  const parts = nombre.trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) return { short: '', initials: '?' }
  const first = parts[0]
  const last = parts.length > 1 ? parts[Math.ceil(parts.length / 2)] : ''
  const short = last ? `${first} ${last}` : first
  const initials = (first[0] + (last ? last[0] : '')).toUpperCase()
  return { short, initials }
}

function StatusSelector({ currentStatus, onChange, disabled }) {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    function handleClickOutside(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const current = ESTADOS[currentStatus] || ESTADOS.NO_DISPONIBLE

  return (
    <div className="dropdown-status" ref={ref}>
      <button className="dropdown-status-btn" onClick={() => setOpen(!open)} disabled={disabled}>
        <span className="status-dot" style={{ backgroundColor: current.color }} />
        <span>{current.label}</span>
        <svg className={open ? 'open' : ''} width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>
      {open && (
        <div className="dropdown-status-menu">
          {Object.entries(ESTADOS).map(([key, { label, color }]) => (
            <button key={key} className={`dropdown-status-option ${currentStatus === key ? 'active' : ''}`} onClick={() => { onChange(key); setOpen(false) }} disabled={disabled}>
              <span className="status-dot" style={{ backgroundColor: color }} />
              {label}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

export default function Navbar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [open, setOpen] = useState(false)
  const menuRef = useRef(null)

  const { status: trainerStatus, loading: statusLoading, updateStatus } = useTrainerStatus(user?.rol === 'entrenador')
  const { short, initials } = parseName(user?.nombre)

  useEffect(() => {
    function handleClickOutside(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  function handleLogout() { logout(); navigate('/login') }

  const statusColor = trainerStatus ? ESTADOS[trainerStatus]?.color : ESTADOS.NO_DISPONIBLE.color

  return (
    <nav className="navbar">
      <Link to="/dashboard" className="navbar-brand"><BrandLogo size="md" /></Link>
      <div className="navbar-right">
        <Link to="/dashboard" className={`navbar-link${location.pathname === '/dashboard' ? ' active' : ''}`}>Inicio</Link>
        {user?.rol === 'entrenador' && <Link to="/students" className={`navbar-link${location.pathname === '/students' ? ' active' : ''}`}>Estudiantes</Link>}
        {user?.rol === 'entrenador' && <Link to="/agenda" className={`navbar-link${location.pathname === '/agenda' ? ' active' : ''}`}>Agenda</Link>}
        <div className="navbar-profile" ref={menuRef}>
          <button className="navbar-avatar-btn" onClick={() => setOpen(prev => !prev)} aria-expanded={open} aria-haspopup="true">
            <div className="navbar-avatar-wrapper">
              <div className="navbar-avatar">{initials}</div>
              {user?.rol === 'entrenador' && <span className="avatar-status-badge" style={{ backgroundColor: statusColor }} />}
            </div>
            <span className="navbar-avatar-name">{short}</span>
            <svg className={`navbar-avatar-chevron ${open ? 'open' : ''}`} width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <polyline points="6 9 12 15 18 9"/>
            </svg>
          </button>
          {open && (
            <div className="navbar-dropdown">
              {user?.rol === 'entrenador' && (
                <div className="navbar-dropdown-status">
                  <span className="dropdown-status-label">Estado</span>
                  <StatusSelector currentStatus={trainerStatus} onChange={updateStatus} disabled={statusLoading} />
                </div>
              )}
              <div className="navbar-dropdown-divider" />
              <button className="navbar-dropdown-item navbar-dropdown-logout" onClick={handleLogout}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>
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