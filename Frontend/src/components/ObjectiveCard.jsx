/**
 * Card de objetivo con barra de progreso
 */

const IconTarget = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/>
  </svg>
)

export default function ObjectiveCard({ data }) {
  if (!data) return null

  const getEstadoBadge = () => {
    switch (data.estado) {
      case 'en-progreso':
        return <span className="objective-badge success">En progreso</span>
      case 'estancado':
        return <span className="objective-badge warning">Estancado</span>
      case 'logrado':
        return <span className="objective-badge done">Logrado</span>
      default:
        return null
    }
  }

  return (
    <div className="objective-card">
      <div className="objective-header">
        <IconTarget />
        <span className="objective-title">Objetivo actual</span>
        {getEstadoBadge()}
      </div>
      
      <p className="objective-text">{data.objetivo}</p>
      <p className="objective-detail">{data.objetivoDetalle}</p>
      
      <div className="objective-progress">
        <div className="objective-progress-bar">
          <div 
            className="objective-progress-fill" 
            style={{ width: `${Math.min(data.progreso, 100)}%` }}
          />
        </div>
        <span className="objective-progress-text">{data.progreso}% completado</span>
      </div>
    </div>
  )
}