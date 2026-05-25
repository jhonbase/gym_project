/**
 * Sidebar Cards - Premium KPI Cards
 * CON texto mejorado y jerarquía visual
 * Soporta modo comparación con valores apilados y delta
 */

const IconScale = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M16 2v16M8 2v16M3 10h18M3 14h18"/>
  </svg>
)

const IconPercent = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <line x1="19" y1="5" x2="5" y2="19"/><circle cx="6.5" cy="6.5" r="2.5"/><circle cx="17.5" cy="17.5" r="2.5"/>
  </svg>
)

const IconActivity = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
  </svg>
)

const IconFire = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#f97316" strokeWidth="2">
    <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.149-.224-3.6 2-4.5a2.5 2.5 0 0 1 2.5 2.5c0 1.378-.5 2-1 3-.372.672-1.022 1.974-2 3.5 1.472 1.163 2 2.5 2 4.5 0 2.21-1.79 4-4 4-1.14 0-2.156-.48-3-1-.844.52-1.86 1-3 1z"/>
  </svg>
)

const round = (num, decimals = 1) => Math.round(num * Math.pow(10, decimals)) / Math.pow(10, decimals)

function DeltaBadge({ diff, unit }) {
  if (diff === 0) return <span className="delta-neutral">– 0 {unit}</span>
  return (
    <span className={diff < 0 ? 'delta-positive' : 'delta-negative'}>
      {diff < 0 ? '↓' : '↑'} {Math.abs(diff)} {unit}
    </span>
  )
}

export default function SidebarCards({ data, objective, compareData }) {
  if (!data) return null

  const showEntrenamiento = data.diasEntrenados > 0 || data.streakActual > 0

  const cards = [
    {
      label: 'Peso actual',
      value: round(data.peso.actual, 1),
      unit: 'kg',
      change: round(data.peso.cambio, 1),
      icon: IconScale,
      isPrimary: true,
      meta: objective?.objetivo ? `Meta: ${objective.objetivo}` : null,
      compareKey: 'peso'
    },
    {
      label: 'Grasa corporal',
      value: round(data.grasa.actual, 1),
      unit: '%',
      change: round(data.grasa.cambio, 1),
      icon: IconPercent,
      isPrimary: false,
      context: data.grasa.actual < 20 ? 'Buena' : 'Elevada',
      compareKey: 'grasaCorporal'
    },
    {
      label: 'IMC',
      value: round(data.imc.actual, 1),
      unit: '',
      icon: IconActivity,
      isPrimary: false,
      context: data.imc.categoria,
      compareKey: 'imc'
    },
  ]

  if (showEntrenamiento) {
    cards.push({
      label: 'Entrenamiento',
      value: `${data.diasEntrenados} sesiones`,
      sub: `🔥 ${data.streakActual} días streak`,
      icon: IconFire,
      isPrimary: true,
      isStreak: true,
      compareKey: null
    })
  }

  return (
    <div className="sidebar-cards">
      {cards.map((card, i) => {
        const Icon = card.icon
        const hasChange = card.change !== undefined
        const hasCompare = compareData && card.compareKey

        let compareDiff = null
        if (hasCompare) {
          const key = card.compareKey
          const base = data[key]?.actual ?? data[key]?.current
          const comp = compareData[key]?.actual ?? compareData[key]?.current
          if (base !== undefined && comp !== undefined) {
            compareDiff = Math.round((comp - base) * 10) / 10
          }
        }

        return (
          <div key={i} className={`kpi-card ${card.isPrimary ? 'primary' : ''}`}>
            <div className="kpi-card-header">
              <Icon />
              <span>{card.label}</span>
            </div>

            {hasCompare ? (
              <div className="kpi-compare-group">
                <div className="kpi-card-value">
                  {card.value}
                  {card.unit && <small>{card.unit}</small>}
                </div>
                <div className="kpi-card-value kpi-card-value-compare">
                  {round(
                    hasCompare && compareData
                      ? (compareData[card.compareKey]?.actual ?? compareData[card.compareKey]?.current ?? card.value)
                      : card.value
                  , 1)} {card.unit}
                </div>
                {compareDiff !== null && (
                  <DeltaBadge diff={compareDiff} unit={card.unit} />
                )}
              </div>
            ) : (
              <div className="kpi-card-value">
                {card.value}
                {card.unit && <small>{card.unit}</small>}
              </div>
            )}

            {hasChange && !hasCompare && card.change !== 0 && (
              <div className={`kpi-change ${card.change > 0 ? 'positive' : 'negative'}`}>
                {card.change > 0 ? '↑' : '↓'} {Math.abs(card.change)} {card.unit} esta semana
              </div>
            )}

            {card.meta && !hasCompare && (
              <div className="kpi-meta">
                <span>{card.meta}</span>
              </div>
            )}

            {card.context && !hasCompare && (
              <div className={`kpi-context ${card.isStreak ? 'streak' : ''}`}>
                {card.context}
              </div>
            )}

            {card.sub && (
              <div className="kpi-sub">{card.sub}</div>
            )}
          </div>
        )
      })}
    </div>
  )
}
