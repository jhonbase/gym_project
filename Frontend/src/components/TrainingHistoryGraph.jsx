import { useMemo } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useTrainingHistory, useContribGraphData, getIntensityLevel, calculateConsistency } from '../hooks/useTrainingHistory'

const FILTER_OPTIONS = [
  { value: '7d', label: '7 días' },
  { value: '1m', label: '1 mes' },
  { value: '3m', label: '3 meses' },
  { value: '6m', label: '6 meses' }
]

const MONTH_LABELS = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic']

const DAY_LABELS = ['L', 'M', 'Mi', 'J', 'V', 'S', 'D']

const LEGEND_ITEMS = [
  { level: 0, color: 'var(--color-surface2)', label: 'No asistió' },
  { level: 1, color: '#9ca3af', label: 'Sesión corta (<45 min)' },
  { level: 2, color: '#f97316', label: 'Sesión media (45-75 min)' },
  { level: 3, color: '#ef4444', label: 'Sesión larga (>75 min)' }
]

/**
 * Leyenda de colores personalizada
 */
function Legend() {
  return (
    <div className="contrib-legend">
      {LEGEND_ITEMS.map((item, i) => (
        <div key={i} className="contrib-legend-item">
          <span className="contrib-legend-box" style={{ backgroundColor: item.color }} />
          <span className="contrib-legend-text">{item.label}</span>
        </div>
      ))}
    </div>
  )
}

/**
 * Filtros de rango
 */
function FilterTabs({ current, onChange }) {
  return (
    <div className="contrib-filters">
      {FILTER_OPTIONS.map(opt => (
        <button
          key={opt.value}
          className={`contrib-filter-btn ${current === opt.value ? 'active' : ''}`}
          onClick={() => onChange(opt.value)}
        >
          {opt.label}
        </button>
      ))}
    </div>
  )
}

/**
 * Meses labels para el gráfico
 */
function MonthLabels({ weeks }) {
  const months = useMemo(() => {
    const result = []
    let lastMonth = -1

    weeks.forEach((week, i) => {
      const month = week.days[0]?.date?.getMonth()
      if (month !== lastMonth) {
        result.push({
          month: MONTH_LABELS[month],
          weekIndex: i
        })
        lastMonth = month
      }
    })

    return result
  }, [weeks])

  return (
    <div className="contrib-months">
      {months.map((m, i) => (
        <span
          key={i}
          className="contrib-month-label"
          style={{ gridColumn: m.weekIndex + 1 }}
        >
          {m.month}
        </span>
      ))}
    </div>
  )
}

/**
 * Grid de contribuciones semanal
 */
function ContribGrid({ weeks }) {
  return (
    <div className="contrib-grid">
      <div className="contrib-days-label">
        {DAY_LABELS.map((label, i) => (
          <span key={i} className="contrib-day-label">
            {label}
          </span>
        ))}
      </div>
      <div className="contrib-weeks">
        {weeks.map((week, wi) => (
          <div key={wi} className="contrib-week">
            {week.days.map((day, di) => (
              <div
                key={di}
                className={`contrib-day contrib-level-${day.level}`}
                title={day.date ? `${day.date.toLocaleDateString('es-CO')}: ${day.duration || 0} min` : 'Sin datos'}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}

/**
 * Resumen de asistencia
 */
function StatsSummary({ sessions }) {
  const currentMonthSessions = useMemo(() => {
    const now = new Date()
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
    return sessions.filter(s => new Date(s.date) >= thirtyDaysAgo)
  }, [sessions])

  const totalSessions = currentMonthSessions.length
  const consistency = calculateConsistency(currentMonthSessions, 30)

  return (
    <div className="contrib-summary">
      <div className="contrib-summary-stat">
        <span className="contrib-summary-value">{totalSessions}</span>
        <span className="contrib-summary-label">sesiones</span>
      </div>
      <div className="contrib-summary-divider" />
      <div className="contrib-summary-stat">
        <span className="contrib-summary-value">{consistency}%</span>
        <span className="contrib-summary-label">constancia</span>
      </div>
    </div>
  )
}

/**
 * Componente principal: TrainingHistoryGraph
 */
export default function TrainingHistoryGraph({ studentId }) {
  const { sessions, stats, filter, changeFilter, filterDays } = useTrainingHistory(studentId)
  const daysBack = filter === '7d' ? 7 : filter === '1m' ? 30 : filter === '3m' ? 90 : 180
  const weeks = useContribGraphData(sessions, daysBack)

  return (
    <div className="training-history-graph">
      <FilterTabs current={filter} onChange={changeFilter} />
      <StatsSummary sessions={sessions} />
      
      <div className="contrib-container">
        <MonthLabels weeks={weeks} />
        <ContribGrid weeks={weeks} />
        <Legend />
      </div>

      <Link to={`/student/${studentId}/training-history`} className="ui-btn-secondary contrib-view-all-btn">
        Ver historial completo
      </Link>
    </div>
  )
}