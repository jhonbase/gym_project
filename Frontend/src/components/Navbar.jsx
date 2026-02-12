import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth.js'
import titleUnifit from '../assets/images/titleUnifit.png'

export default function Navbar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  function handleLogout() {
    logout()
    navigate('/login')
  }

  return (
    <nav className="navbar">
      <Link to="/dashboard" className="navbar-brand">
        <img src={titleUnifit} alt="UNIFIT" height="45"/>
      </Link>
      <div className="navbar-links">
        <Link to="/dashboard">Inicio</Link>
        <span className="navbar-user">👤 {user?.nombre}</span>
        <button onClick={handleLogout} className="btn-logout">Salir</button>
      </div>
    </nav>
  )
}