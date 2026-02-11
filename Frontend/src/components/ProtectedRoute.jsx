// Si el usuario NO está logueado → redirige a /login
// Si SÍ está logueado → muestra las rutas hijas (Outlet)
import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth.js'
import LoadingSpinner from './LoadingSpinner.jsx'

export default function ProtectedRoute() {
  const { user, loading } = useAuth()
  if (loading) return <LoadingSpinner />
  return user ? <Outlet /> : <Navigate to="/login" replace />
}