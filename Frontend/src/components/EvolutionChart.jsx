/**
 * Evolución Chart - Corazón de la página
 * CON hover tooltip + línea gris + diseño premium
 */

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
  
  // 3m y 6m
  return date.toLocaleDateString('es-CO', { month: 'short' })
}

function formatFullDate(dateStr) {
  return new Date(dateStr).toLocaleDateString('es-CO', { day: 'numeric', month: 'long', year: 'numeric' })
}

function getXAxisLabels(data, filter) {
  if (!data || data.length === 0) return []
  
  if (filter === '7d') {
    // Cada día
    return data.filter((_, i) => i % 1 === 0).map(d => d.date)
  }
  
  if (filter === '1m') {
    // Cada semana
    return data.filter((_, i) => i % 7 === 0).map(d => d.date)
  }
  
  if (filter === '3m') {
    // Cada 2 semanas
    return data.filter((_, i) => i % 14 === 0).map(d => d.date)
  }
  
  // 6 meses - cada mes
  return data.filter((_, i) => i % 30 === 0).map(d => d.date)
}

import { useState } from 'react'

export default function EvolutionChart({ data, metric, unit, filter = '1m' }) {
  const [hoveredPoint, setHoveredPoint] = useState(null)

  if (!data || data.length === 0) {
    return <div className="evolution-chart-empty"><p>Sin datos disponibles</p></div>
  }

  // Padding dinámico según filtro - menos padding para más espacio
  const getPadding = () => {
    if (filter === '7d') return 45
    if (filter === '1m') return 40
    if (filter === '3m') return 30
    return 25 // 6 meses - mínimo padding
  }
  
  // Limitar puntos a mostrar para evitar saturación
  const getMaxPoints = () => {
    if (filter === '7d') return 30
    if (filter === '1m') return 30
    if (filter === '3m') return 40
    return 50 // 6 meses - máximo 50 puntos
  }
  
  // Sample data para gráficos largos
  const sampledData = (() => {
    const maxPoints = getMaxPoints()
    if (data.length <= maxPoints) return data
    const step = Math.floor(data.length / maxPoints)
    return data.filter((_, i) => i % step === 0 || i === data.length - 1)
  })()

  const padding = getPadding()
  const width = 700
  const height = 240

  const values = sampledData.map(d => d.value)
  const minVal = Math.min(...values) * 0.98
  const maxVal = Math.max(...values) * 1.02
  const range = maxVal - minVal

  const points = sampledData.map((d, i) => ({
    x: padding + (i / (sampledData.length - 1)) * (width - padding * 2),
    y: height - padding - ((d.value - minVal) / range) * (height - padding * 2),
    value: d.value,
    date: d.date
  }))

  const linePath = `M ${points.map(p => `${p.x},${p.y}`).join(' L ')}`
  const areaPath = `${linePath} L ${width - padding},${height - padding} L ${padding},${height - padding} Z`

  // Labels Y
  const yLabels = [0, 0.25, 0.5, 0.75, 1].map(ratio => ({
    val: round(minVal + ratio * range, 1),
    y: height - padding - ratio * (height - padding * 2)
  }))

  // Labels X
  const xAxisDates = getXAxisLabels(data, filter)

  const startValue = data[0]?.value
  const currentValue = data[data.length - 1]?.value
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
          <filter id="chartGlow">
            <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
            <feMerge>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>

        {/* Área bajo la línea */}
        <path d={areaPath} fill="url(#chartGradient)" opacity="0.2" />

        {/* Línea principal - GRIS CLARO */}
        <path 
          d={linePath} 
          fill="none" 
          stroke="#666" 
          strokeWidth="2" 
          strokeLinecap="round" 
          strokeLinejoin="round"
        />

        {/* Puntos - solo el último activo en rojo */}
        {points.map((p, i) => {
          const isHovered = hoveredPoint && hoveredPoint.date === p.date
          const isLast = i === points.length - 1
          return (
            <g key={i}>
              <circle
                cx={p.x}
                cy={p.y}
                r={isHovered || isLast ? 6 : 3}
                fill={isHovered || isLast ? "#E10600" : "#444"}
                stroke="#0B0B0B"
                strokeWidth="2"
                className="chart-point"
                onMouseEnter={() => setHoveredPoint(p)}
                style={{ cursor: 'pointer', transition: 'all 0.15s' }}
              />
              {isHovered && (
                <circle cx={p.x} cy={p.y} r="10" fill="#E10600" opacity="0.3" />
              )}
            </g>
          )
        })}

        {/* Ejes */}
        <line x1={padding} y1={padding} x2={padding} y2={height - padding} stroke="#2A2A2A" strokeWidth="1" />
        <line x1={padding} y1={height - padding} x2={width - padding} y2={height - padding} stroke="#2A2A2A" strokeWidth="1" />

        {/* Labels Y */}
        {yLabels.map((l, i) => (
          <text key={i} x={padding - 8} y={l.y + 4} className="chart-label-y" fill="#555">
            {l.val}
          </text>
        ))}

        {/* Labels X */}
        {xAxisDates.map((dateStr, i) => {
          const dataIndex = data.findIndex(d => d.date === dateStr)
          if (dataIndex === -1) return null
          const x = padding + (dataIndex / (data.length - 1)) * (width - padding * 2)
          return (
            <text key={i} x={x} y={height - 15} className="chart-label-x" fill="#555" textAnchor="middle">
              {formatAxisDate(dateStr, filter)}
            </text>
          )
        })}
      </svg>

      {/* MINI KPIs - Inicio / Actual / Cambio */}
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

      {/* HOVER TOOLTIP */}
      {hoveredPoint && (
        <div className="chart-tooltip">
          <span className="tooltip-date">{formatFullDate(hoveredPoint.date)}</span>
          <span className="tooltip-value">
            {metric === 'peso' && 'Peso: '}
            {metric === 'grasaCorporal' && 'Grasa: '}
            {metric === 'masaMuscular' && 'Masa: '}
            {metric === 'imc' && 'IMC: '}
            {round(hoveredPoint.value, 1)} {unit}
          </span>
        </div>
      )}
    </div>
  )
}