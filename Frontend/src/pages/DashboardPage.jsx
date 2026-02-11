import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth.js'
import apiClient from '../api/client.js'
import LoadingSpinner from '../components/LoadingSpinner.jsx'

export default function DashboardPage() {
  const { user } = useAuth()
  const [userData, setUserData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    apiClient.get(`/users/${user.id}`)
      .then(res => setUserData(res.data.data.user))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [user.id])

  if (loading) return <LoadingSpinner />

  const u = userData || user

  return (
    <div className="dashboard">
      <div className="card user-card">
        <h2>👤 {u.nombre}</h2>
        <div className="user-info-grid">
          <span><strong>Documento:</strong> {u.documento}</span>
          <span><strong>Email:</strong> {u.email}</span>
          <span><strong>Teléfono:</strong> {u.telefono}</span>
          <span><strong>EPS:</strong> {u.eps}</span>
          <span><strong>Grupo sanguíneo:</strong> {u.grupoSanguineo}</span>
          <span><strong>Carrera:</strong> {u.carrera}</span>
          <span><strong>Jornada:</strong> {u.jornada}</span>
          <span><strong>Semestre:</strong> {u.semestre}</span>
        </div>
      </div>

      <div className="section-header">
        <h2>📋 Valoraciones</h2>
        <Link to="/assessment/new" className="btn-primary">+ Nueva Valoración</Link>
      </div>

      {userData?.assessments?.length > 0 ? (
        <div className="assessments-list">
          {userData.assessments.map(a => (
            <Link to={`/assessment/${a.id}`} key={a.id} className="card assessment-card">
              <span>{new Date(a.createdAt).toLocaleDateString()}</span>
              <span>IMC: {a.imc} | Peso: {a.peso}kg</span>
              <span className={`badge badge-${a.estadoValoracion}`}>{a.estadoValoracion}</span>
            </Link>
          ))}
        </div>
      ) : (
        <p className="empty-state">No hay valoraciones aún. ¡Crea la primera!</p>
      )}
    </div>
  )
}