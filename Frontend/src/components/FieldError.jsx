/**
 * FieldError — Muestra un mensaje de error de validación bajo un campo.
 * Extraído de AssessmentFormPage donde estaba definido dentro del componente
 * padre (causaba re-creación en cada render).
 *
 * Props:
 *   error — string | null | undefined
 */
export default function FieldError({ error }) {
  if (!error) return null
  return <small className="ui-field-error">{error}</small>
}
