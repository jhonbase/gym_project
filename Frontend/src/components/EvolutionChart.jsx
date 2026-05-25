/**
 * Evolución Chart - Corazón de la página
 * CON hover tooltip + línea gris + diseño premium
 * Soporta modo comparación con dos líneas
 */

import { useState } from 'react'

function round(num, decimals = 1) {
  return Math.round(num * Math.pow(10, decimals)) / Math.pow(10, decimals)
}

function formatAxisDate(dateStr, filter) {
  const date = new Date(dateStr)

  if (filter === '7d') {
    return date.toLocaleDateString('es-CO', { day: 'numeric' })
  }

  if (filter === '1m') {
    return date.toLocaleDateString('es-CO', { day: 'numeric', month: 'short' })
  }

  return date.toLocaleDateString('es-CO', { month: 'short' })
}

function formatFullDate(dateStr) {
  return new Date(dateStr).toLocaleDateString('es-CO', { day: 'numeric', month: 'long', year: 'numeric' })
}

function getXAxisLabels(data, filter) {
  if (!data || data.length === 0) return []

  if (filter === '7d') {
    return data.filter((_, i) => i % 1 === 0).map(d => d.date)
  }

  if (filter === '1m') {
    return data.filter((_, i) => i % 7 === 0).map(d => d.date)
  }

  if (filter === '3m') {
    return data.filter((_, i) => i % 14 === 0).map(d => d.date)
  }

  return data.filter((_, i) => i % 30 === 0).map(d => d.date)
}

function aggregateByPeriod(data, filter) {
  if (!data || data.length === 0) return []
  if (filter === '7d') return data

  const bucketSize = filter === '1m' ? 7 : filter === '3m' ? 14 : 30
  const buckets = []

  for (let i = 0; i < data.length; i += bucketSize) {
    const slice = data.slice(i, i + bucketSize)
    if (slice.length === 0) continue
    const avg = slice.reduce((sum, d) => sum + d.value, 0) / slice.length
    buckets.push({
      date: slice[Math.floor(slice.length / 2)].date,
      value: round(avg, 1)
    })
  }

  return buckets
}

function buildPath(points) {
  if (points.length < 2) return ''
  return `M ${points.map(p => `${p.x},${p.y}`).join(' L ')}`
}

function buildAreaPath(points, width, height, padding) {
  const line = buildPath(points)
  if (!line) return ''
  return `${line} L ${width - padding},${height - padding} L ${padding},${height - padding} Z`
}

function calcPoints(data, width, height, padding) {
  if (!data || data.length === 0) return []
  const values = data.map(d => d.value)
  const minVal = Math.min(...values) * 0.98
  const maxVal = Math.max(...values) * 1.02
  const range = maxVal - minVal || 1

  return data.map((d, i) => ({
    x: padding + (i / (data.length - 1)) * (width - padding * 2),
    y: height - padding - ((d.value - minVal) / range) * (height - padding * 2),
    value: d.value,
    date: d.date
  }))
}

export default function EvolutionChart({ data, metric, unit, filter = '1m', data2, label2, unit2 }) {
  const [hoveredPoint, setHoveredPoint] = useState(null)

  if (!data || data.length < 2) {
    return <div className="evolution-chart-empty"><p>Necesitas al menos 2 valoraciones para ver tu evolución</p></div>
  }

  const padding = filter === '7d' ? 45 : filter === '1m' ? 40 : filter === '3m' ? 30 : 25
  const width = 700
  const height = 240

  const useAgg = !data2 && data.length > 30
  const chartData = useAgg ? aggregateByPeriod(data, filter) : data
  const points1 = calcPoints(chartData, width, height, padding)

  let points2 = []
  if (data2 && data2.length > 0) {
    const chartData2 = aggregateByPeriod(data2, filter)
    points2 = calcPoints(chartData2, width, height, padding)
  }

  const linePath1 = buildPath(points1)
  const areaPath1 = buildAreaPath(points1, width, height, padding)
  const linePath2 = buildPath(points2)

  const values = chartData.map(d => d.value)
  const minVal = Math.min(...values) * 0.98
  const maxVal = Math.max(...values) * 1.02
  const range = maxVal - minVal || 1
  const yLabels = [0, 0.25, 0.5, 0.75, 1].map(ratio => ({
    val: round(minVal + ratio * range, 1),
    y: height - padding - ratio * (height - padding * 2)
  }))

  const xAxisDates = getXAxisLabels(chartData, filter)
  const startValue = chartData[0]?.value
  const currentValue = chartData[chartData.length - 1]?.value
  const changeValue = round(currentValue - startValue, 1)

  return (
    <div className="evolution-chart">
      <svg
        viewBox={`0 0 ${width} ${height}`}
        preserveAspectRatio="xMidYMid meet"
        onMouseLeave={() => setHoveredPoint(null)}
      >
        <defs>
          <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#E10600" stopOpacity="0.25" />
            <stop offset="100%" stopColor="#E10600" stopOpacity="0" />
          </linearGradient>
          <linearGradient id="chartGradient2" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#00B4D8" stopOpacity="0.2" />
            <stop offset="100%" stopColor="#00B4D8" stopOpacity="0" />
          </linearGradient>
          <filter id="chartGlow">
            <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
            <feMerge>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>

        <path d={areaPath1} fill="url(#chartGradient)" opacity="0.2" />

        {points2.length > 0 && (
          <path d={buildAreaPath(points2, width, height, padding)} fill="url(#chartGradient2)" opacity="0.15" />
        )}

        <path
          d={linePath1}
          fill="none"
          stroke="#666"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {points2.length > 0 && (
          points2.length === 1 ? (
            <g>
              <line
                x1={padding}
                y1={points2[0].y}
                x2={width - padding}
                y2={points2[0].y}
                stroke="#00B4D8"
                strokeWidth="1.5"
                strokeDasharray="5,4"
                opacity={0.8}
              />
              <circle
                cx={width - padding}
                cy={points2[0].y}
                r={8}
                fill="#00B4D8"
                opacity={0.9}
              />
              <text
                x={width - padding}
                y={points2[0].y - 12}
                textAnchor="middle"
                fill="#00B4D8"
                fontSize={11}
                fontWeight="600"
              >
                {points2[0].value} {unit2 || unit || ''}
              </text>
            </g>
          ) : (
            <path
              d={linePath2}
              fill="none"
              stroke="#00B4D8"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          )
        )}

        {points1.map((p, i) => {
          const isHovered = hoveredPoint && hoveredPoint.date === p.date && !hoveredPoint.serie2
          const isLast = i === points1.length - 1
          return (
            <g key={`p1-${i}`}>
              <circle
                cx={p.x}
                cy={p.y}
                r={isHovered || isLast ? 6 : 3}
                fill={isHovered || isLast ? "#E10600" : "#444"}
                stroke="#0B0B0B"
                strokeWidth="2"
                className="chart-point"
                onMouseEnter={() => setHoveredPoint({ ...p, serie2: false })}
                style={{ cursor: 'pointer', transition: 'all 0.15s' }}
              />
              {isHovered && (
                <circle cx={p.x} cy={p.y} r="10" fill="#E10600" opacity="0.3" />
              )}
            </g>
          )
        })}

        {points2.length > 1 && points2.map((p, i) => {
          const isHovered = hoveredPoint && hoveredPoint.date === p.date && hoveredPoint.serie2
          const isLast = i === points2.length - 1
          return (
            <g key={`p2-${i}`}>
              <circle
                cx={p.x}
                cy={p.y}
                r={isHovered || isLast ? 6 : 3}
                fill={isHovered || isLast ? "#00B4D8" : "#444"}
                stroke="#0B0B0B"
                strokeWidth="2"
                className="chart-point"
                onMouseEnter={() => setHoveredPoint({ ...p, serie2: true })}
                style={{ cursor: 'pointer', transition: 'all 0.15s' }}
              />
              {isHovered && (
                <circle cx={p.x} cy={p.y} r="10" fill="#00B4D8" opacity="0.3" />
              )}
            </g>
          )
        })}

        <line x1={padding} y1={padding} x2={padding} y2={height - padding} stroke="#2A2A2A" strokeWidth="1" />
        <line x1={padding} y1={height - padding} x2={width - padding} y2={height - padding} stroke="#2A2A2A" strokeWidth="1" />

        {yLabels.map((l, i) => (
          <text key={`y-${i}`} x={padding - 8} y={l.y + 4} className="chart-label-y" fill="#555">
            {l.val}
          </text>
        ))}

        {xAxisDates.map((dateStr, i) => {
          const dataIndex = chartData.findIndex(d => d.date === dateStr)
          if (dataIndex === -1) return null
          const x = padding + (dataIndex / (chartData.length - 1)) * (width - padding * 2)
          return (
            <text key={`x-${i}`} x={x} y={height - 15} className="chart-label-x" fill="#555" textAnchor="middle">
              {formatAxisDate(dateStr, filter)}
            </text>
          )
        })}
      </svg>

      {points2.length > 0 && (
        <div className="chart-legend">
          <span className="legend-item">
            <span className="legend-dot" style={{ background: '#666' }} />
            {metric} ({unit})
          </span>
          <span className="legend-item">
            <span className="legend-dot" style={{ background: '#00B4D8' }} />
            {label2} ({unit2})
          </span>
        </div>
      )}

      <div className="evolution-chart-legend">
        <div className="kpi-item">
          <span className="kpi-label">Inicio</span>
          <span className="kpi-value">{round(startValue, 1)} <small>{unit}</small></span>
        </div>
        <div className="kpi-item kpi-current">
          <span className="kpi-label">Actual</span>
          <span className="kpi-value">{round(currentValue, 1)} <small>{unit}</small></span>
        </div>
        <div className="kpi-item">
          <span className="kpi-label">Cambio</span>
          <span className={`kpi-value ${changeValue > 0 ? 'positive' : 'negative'}`}>
            {changeValue > 0 ? '↑' : '↓'} {Math.abs(changeValue)} <small>{unit}</small>
          </span>
        </div>
      </div>

      {hoveredPoint && (
        <div className="chart-tooltip">
          <span className="tooltip-date">{formatFullDate(hoveredPoint.date)}</span>
          <span className="tooltip-value">
            {metric === 'peso' && 'Peso: '}
            {metric === 'grasaCorporal' && 'Grasa: '}
            {metric === 'masaMuscular' && 'Masa: '}
            {metric === 'imc' && 'IMC: '}
            {metric === 'grasaVisceral' && 'Grasa visceral: '}
            {round(hoveredPoint.value, 1)} {hoveredPoint.serie2 ? (unit2 || unit) : unit}
          </span>
        </div>
      )}
    </div>
  )
}
