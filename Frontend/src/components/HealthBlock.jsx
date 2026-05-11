/**
 * Bloque de salud con indicadores visuales
 * Soporta modo comparación entre dos valoraciones
 */

const IconHeart = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
  </svg>
)

const IconActivity = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
  </svg>
)

const IconClock = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
  </svg>
)

const IconLayers = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <polygon points="12 2 2 7 12 12 22 7 12 2"/><polyline points="2 17 12 22 22 17"/><polyline points="2 12 12 17 22 12"/>
  </svg>
)

function getStatusColor(status) {
  switch (status) {
    case 'normal':
    case 'good':   return 'status-normal'
    case 'warning': return 'status-warning'
    case 'danger':  return 'status-danger'
    default:        return 'status-normal'
  }
}

function compareValues(v1, v2) {
  const n1 = typeof v1 === 'string' ? parseFloat(v1) : v1
  const n2 = typeof v2 === 'string' ? parseFloat(v2) : v2
  if (n1 === n2) return 'neutral'
  return n2 > n1 ? 'up' : 'down'
}

export default function HealthBlock({ data, compareData }) {
  if (!data) return null

  const indicators = [
    { key: 'presionArterial', label: 'Presión arterial', value: data.presionArterial.value, status: data.presionArterial.status, icon: IconHeart },
    { key: 'ppm',             label: 'PPM',             value: data.ppm.value,             status: data.ppm.status,             icon: IconActivity },
    { key: 'edadMetabolica',  label: 'Edad metabólica', value: data.edadMetabolica.value + ' años', status: data.edadMetabolica.status, icon: IconClock },
    { key: 'grasaVisceral',   label: 'Grasa visceral',  value: data.grasaVisceral.value,   status: data.grasaVisceral.status,   icon: IconLayers }
  ]

  return (
    <div className="health-block">
      <h3 className="health-title">Salud</h3>
      <div className="health-grid">
        {indicators.map(ind => {
          const Icon = ind.icon
          const comp = compareData ? compareData[ind.key] : null
          const direction = comp ? compareValues(data[ind.key].value, comp.value) : null

          return (
            <div key={ind.key} className="health-item">
              <div className="health-item-header">
                <Icon />
                <span>{ind.label}</span>
              </div>
              <div className={`health-item-value ${getStatusColor(ind.status)}`}>
                {ind.value}
              </div>
              {comp && (
                <div className="health-compare-row">
                  <span className="health-item-value-secondary">{comp.value}</span>
                  {direction !== 'neutral' && (
                    <span className={`health-delta ${direction}`}>
                      {direction === 'up' ? '↑' : '↓'}
                    </span>
                  )}
                </div>
              )}
              <span className={`health-item-label ${getStatusColor(ind.status)}`}>
                {ind.status === 'normal' || ind.status === 'good' ? '✓ Normal' : ind.status}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
