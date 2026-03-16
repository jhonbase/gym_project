/**
 * SectionCard — Card con border-left rojo, header con icono+título y body.
 * Patrón visual unificado en todo el sistema.
 *
 * Props:
 *   icon     — SVG element (opcional)
 *   title    — string
 *   children — contenido del body
 *   className — clases extras para el body (opcional)
 */
export default function SectionCard({ icon, title, children, className = '' }) {
  return (
    <div className="ui-section-card">
      <div className="ui-section-card-header">
        {icon && <span style={{ display: 'flex', alignItems: 'center', flexShrink: 0 }}>{icon}</span>}
        <span className="ui-section-card-title">{title}</span>
      </div>
      <div className={`ui-section-card-body ${className}`}>
        {children}
      </div>
    </div>
  )
}
