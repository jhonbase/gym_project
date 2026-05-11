import uniBogota from '../assets/images/uni_bogota.png'
import uniColombia from '../assets/images/uni_colombia2.png'

export default function Footer() {
  return (
    <footer className="app-footer">
      <div className="footer-content">
        <div className="footer-logos">
          <a href="https://universitariadebogota.edu.co/" target="_blank" rel="noopener noreferrer">
            <img
              src={uniBogota}
              alt="Universidad de Bogotá Jorge Tadeo Lozano"
              style={{ height: '36px', width: 'auto', opacity: 0.85, background: 'white', borderRadius: '6px', padding: '6px' }}
            />
          </a>
          <a href="https://universitariadecolombia.edu.co/" target="_blank" rel="noopener noreferrer">
            <img
              src={uniColombia}
              alt="Universidad Nacional de Colombia"
              style={{ height: '36px', width: 'auto', opacity: 0.85, background: 'white', borderRadius: '6px', padding: '6px' }}
            />
          </a>
        </div>
        <div className="footer-copyright-row">
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
      </div>
    </footer>
  )
}
