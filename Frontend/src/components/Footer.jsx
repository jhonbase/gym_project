export default function Footer() {
  return (
    <footer className="app-footer">
      <div className="footer-content">
        <span className="footer-copyright">© 2026 UniFit</span>
        <span className="footer-divider">|</span>
        <a 
          href="/politica" 
          target="_blank" 
          rel="noopener noreferrer"
          className="footer-link"
        >
          Política de Tratamiento de Datos
        </a>
      </div>
    </footer>
  )
}