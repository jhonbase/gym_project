import { Link, useParams } from 'react-router-dom'
import TrainingHistoryGraph from './TrainingHistoryGraph.jsx'

const IconTrendUp = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/>
  </svg>
)

const IconCalendar = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
  </svg>
)

/**
 * Botón principal: "Ver Progreso"
 * Redirige a página de progreso del estudiante
 */
function ProgressButton({ studentId }) {
  return (
    <Link to={`/student/${studentId}/progress`} className="sidebar-progress-btn">
      <IconTrendUp />
      <span>Ver Progreso</span>
    </Link>
  )
}

/**
 * Sección: Historial de Entrenamiento
 */
function TrainingHistorySection({ studentId }) {
  return (
    <div className="sidebar-training-section">
      <div className="sidebar-training-header">
        <IconCalendar />
        <span>Historial de Entrenamiento</span>
      </div>
      <TrainingHistoryGraph studentId={studentId} />
    </div>
  )
}

/**
 * Componente principal: StudentProgressSidebar
 * Sidebar derecho para el perfil del estudiante
 */
export default function StudentProgressSidebar() {
  const { id: studentId } = useParams()

  return (
    <aside className="student-progress-sidebar">
      <ProgressButton studentId={studentId} />
      <TrainingHistorySection studentId={studentId} />
    </aside>
  )
}