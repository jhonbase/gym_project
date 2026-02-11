// Muestra mensajes de éxito (verde), error (rojo) o advertencia (amarillo)
export default function AlertMessage({ type, message, onClose }) {
  if (!message) return null
  return (
    <div className={`alert alert-${type}`}>
      <span>{message}</span>
      {onClose && <button className="alert-close" onClick={onClose}>✕</button>}
    </div>
  )
}