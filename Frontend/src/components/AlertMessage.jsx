import { useEffect } from 'react'

function AlertStack({ alerts, onDismiss }) {
  useEffect(() => {
    if (!alerts?.length) return

    const timers = alerts.map((alert, index) => 
      setTimeout(() => {
        onDismiss(alert.id)
      }, 5000 + (index * 500))
    )

    return () => timers.forEach(clearTimeout)
  }, [alerts, onDismiss])

  if (!alerts?.length) return null

  return (
    <div className="alerts-stack">
      {alerts.map((alert, index) => (
        <div 
          key={alert.id || index} 
          className={`ui-alert ui-alert-${alert.type}`}
        >
          <span>{alert.message}</span>
          {onDismiss && (
            <button 
              className="ui-alert-close" 
              onClick={() => onDismiss(alert.id)}
              aria-label="Cerrar"
            >
              ✕
            </button>
          )}
        </div>
      ))}
    </div>
  )
}

export default function AlertMessage({ type, message, onClose }) {
  const handleDismiss = () => {
    if (onClose) onClose()
  }

  useEffect(() => {
    if (!message || !onClose) return

    const timer = setTimeout(() => {
      onClose()
    }, 5000)

    return () => clearTimeout(timer)
  }, [message, onClose])

  if (!message) return null

  return (
    <div className={`ui-alert ui-alert-${type}`}>
      <span>{message}</span>
      {onClose && (
        <button className="ui-alert-close" onClick={handleDismiss} aria-label="Cerrar">✕</button>
      )}
    </div>
  )
}

export { AlertStack }