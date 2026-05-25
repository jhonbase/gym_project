/**
 * Card de objetivo
 */
export default function ObjectiveCard({ data }) {
  if (!data) return null

  const getEstadoBadge = () => {
    switch (data.estado) {
      case 'en-progreso':
        return { label: 'En progreso', background: '#22c55e20', color: '#22c55e' }
      case 'estancado':
        return { label: 'Estancado', background: '#f59e0b20', color: '#f59e0b' }
      case 'logrado':
        return { label: 'Logrado', background: '#3b82f620', color: '#3b82f6' }
      default:
        return { label: data.estado || '', background: '#ffffff20', color: '#999999' }
    }
  }

  const badge = getEstadoBadge()

  let proximaFechaStr = ''
  if (data.proximaFecha) {
    const date = new Date(data.proximaFecha)
    const options = { day: 'numeric', month: 'long', year: 'numeric' }
    proximaFechaStr = date.toLocaleDateString('es-CO', options)
  }

  return (
    <div
      style={{
        background: '#1a1a1a',
        borderRadius: '12px',
        padding: '20px',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          marginBottom: '16px',
        }}
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="10" />
          <circle cx="12" cy="12" r="6" />
          <circle cx="12" cy="12" r="2" />
        </svg>
        <span
          style={{
            fontSize: '11px',
            color: '#999999',
            textTransform: 'uppercase',
            fontWeight: 600,
            letterSpacing: '0.5px',
          }}
        >
          Objetivo actual
        </span>
        <span
          style={{
            marginLeft: 'auto',
            padding: '2px 10px',
            borderRadius: '999px',
            fontSize: '11px',
            fontWeight: 600,
            background: badge.background,
            color: badge.color,
          }}
        >
          {badge.label}
        </span>
      </div>

      <p
        style={{
          fontSize: '22px',
          fontWeight: 700,
          color: '#FFFFFF',
          margin: 0,
        }}
      >
        {data.objetivo}
      </p>

      {proximaFechaStr && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            marginTop: '16px',
            fontSize: '12px',
            color: '#F59E0B',
            fontWeight: 500,
          }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
            <line x1="16" y1="2" x2="16" y2="6" />
            <line x1="8" y1="2" x2="8" y2="6" />
            <line x1="3" y1="10" x2="21" y2="10" />
          </svg>
          <span>Próxima valoración</span>
          <span style={{ marginLeft: '4px' }}>{proximaFechaStr}</span>
        </div>
      )}
    </div>
  )
}
