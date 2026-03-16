// Botón de huella dactilar — estilo dark fitness premium
export default function FingerprintButton({ onClick, loading, disabled, label }) {
  return (
    <button
      className={`fp-btn ${loading ? 'scanning' : ''}`}
      onClick={onClick}
      disabled={disabled || loading}
      type="button"
    >
      <span className="fp-btn-icon">🖐️</span>
      <span className="fp-btn-label">
        {loading ? 'Escaneando...' : label || 'Escanear Huella'}
      </span>
    </button>
  )
}
