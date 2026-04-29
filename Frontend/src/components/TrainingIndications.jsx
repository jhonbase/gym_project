/**
 * Indicaciones de entrenamiento - Mejoradas con secciones
 */

const IconAlert = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2">
    <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
  </svg>
)

const IconCheck = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2">
    <polyline points="20 6 9 17 4 12"/>
  </svg>
)

const IconTrendingUp = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="2">
    <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/>
  </svg>
)

const IconStar = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#f97316" strokeWidth="2">
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
  </svg>
)

function getIcon(tipo) {
  switch (tipo) {
    case 'restriccion': return IconAlert
    case 'recomendacion': return IconCheck
    case 'mejora': return IconTrendingUp
    case 'seguir': return IconStar
    default: return IconCheck
  }
}

function getLabel(tipo) {
  switch (tipo) {
    case 'restriccion': return 'RESTRICCIÓN'
    case 'recomendacion': return 'RECOMENDACIÓN'
    case 'mejora': return 'MEJORA'
    case 'seguir': return 'SEGUIR'
    default: return ''
  }
}

export default function TrainingIndications({ data }) {
  if (!data || data.length === 0) return null

  return (
    <div className="training-indications">
      <h2 className="indications-title">Indicaciones de entrenamiento</h2>
      <div className="indications-container">
        {data.map((item, i) => {
          const Icon = getIcon(item.tipo)
          return (
            <div key={i} className={`indication-item indication-${item.tipo}`}>
              <div className="indication-badge">
                <Icon />
                <span>{getLabel(item.tipo)}</span>
              </div>
              <p className="indication-text">{item.texto}</p>
            </div>
          )
        })}
      </div>
    </div>
  )
}