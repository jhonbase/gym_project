import { useEffect } from 'react'

export default function AlertMessage({ type, message, onClose }) {
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
        <button className="ui-alert-close" onClick={onClose} aria-label="Cerrar">✕</button>
      )}
    </div>
  )
}