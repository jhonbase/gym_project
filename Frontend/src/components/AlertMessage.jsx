// Muestra mensajes de éxito, error o advertencia — tema dark
export default function AlertMessage({ type, message, onClose }) {
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
