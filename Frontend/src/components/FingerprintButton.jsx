// Botón grande animado que simula el escaneo de huella
export default function FingerprintButton({ onClick, loading, disabled, label }) {
  return (
    <button
      className={`fingerprint-btn ${loading ? 'scanning' : ''}`}
      onClick={onClick}
      disabled={disabled || loading}
    >
      <span className="fingerprint-icon">🖐️</span>
      <span className="fingerprint-label">
        {loading ? 'Escaneando...' : label || 'Escanear Huella'}
      </span>
    </button>
  )
}