/**
 * Próxima valoración
 */

import { useMemo } from 'react'

const IconCalendar = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
  </svg>
)

export default function NextAssessment({ data }) {
  if (!data) return null

  const formattedDate = useMemo(() => {
    if (!data.fecha) return ''
    const date = new Date(data.fecha)
    return date.toLocaleDateString('es-CO', { day: 'numeric', month: 'long', year: 'numeric' })
  }, [data.fecha])

  const getEstadoBadge = () => {
    if (data.diasRestantes <= 0) {
      return <span className="next-assessment-badge overdue">Vencida</span>
    }
    if (data.diasRestantes <= 7) {
      return <span className="next-assessment-badge soon">Pronto</span>
    }
    return <span className="next-assessment-badge upcoming">Próxima</span>
  }

  return (
    <div className="next-assessment">
      <div className="next-assessment-header">
        <IconCalendar />
        <span>Próxima valoración</span>
      </div>
      <div className="next-assessment-date">{formattedDate}</div>
      <div className="next-assessment-days">
        {data.diasRestantes > 0 
          ? `En ${data.diasRestantes} días` 
          : 'Hace alguns días'
        }
      </div>
      {getEstadoBadge()}
    </div>
  )
}