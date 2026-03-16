import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import apiClient from '../api/client.js'
import LoadingSpinner from '../components/LoadingSpinner.jsx'
import AlertMessage from '../components/AlertMessage.jsx'
import SectionCard from '../components/SectionCard.jsx'

/* ─── Iconos ──────────────────────────────────── */
const IconBody = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#E10600" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="5" r="2"/><path d="M12 7v8m-4-5 4 5 4-5M8 19h8"/>
  </svg>
)
const IconClinical = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#E10600" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 12h-4l-3 9L9 3l-3 9H2"/>
  </svg>
)
const IconAI = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#E10600" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 2a2 2 0 0 1 2 2c0 .74-.4 1.39-1 1.73V7h1a7 7 0 0 1 7 7h1a1 1 0 0 1 1 1v3a1 1 0 0 1-1 1h-1v1a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-1H2a1 1 0 0 1-1-1v-3a1 1 0 0 1 1-1h1a7 7 0 0 1 7-7h1V5.73c-.6-.34-1-.99-1-1.73a2 2 0 0 1 2-2z"/>
  </svg>
)

/* ─── Item de resultado ───────────────────────── */
function ResultItem({ label, value }) {
  return (
    <div className="result-item">
      <span className="result-key">{label}</span>
      <span className="result-val">{value}</span>
    </div>
  )
}

export default function AssessmentResultPage() {
  const { id } = useParams()
  const [assessment, setAssessment] = useState(null)
  const [loading, setLoading] = useState(true)
  const [analyzing, setAnalyzing] = useState(false)
  const [alert, setAlert] = useState(null)

  const pdfEndpoint = `/assessments/${id}/pdf`

  useEffect(() => {
    apiClient.get(`/assessments/${id}`)
      .then(res => setAssessment(res.data.data.assessment))
      .catch(() => setAlert({ type: 'error', message: 'Error al cargar la valoración' }))
      .finally(() => setLoading(false))
  }, [id])

  async function handleAnalyze() {
    setAnalyzing(true)
    setAlert(null)
    try {
      const res = await apiClient.post(`/assessments/${id}/analyze`)
      setAssessment(res.data.data.assessment)
      await openPdfPreview()
    } catch (err) {
      const msg = err.response?.data?.error || 'No se pudo generar el análisis.'
      setAlert({ type: 'error', message: msg })
    } finally {
      setAnalyzing(false)
    }
  }

  async function openPdfPreview() {
    try {
      const res = await apiClient.get(pdfEndpoint, { responseType: 'blob' })
      const blob = new Blob([res.data], { type: 'application/pdf' })
      const url = URL.createObjectURL(blob)
      window.open(url, '_blank')
      setTimeout(() => URL.revokeObjectURL(url), 60_000)
    } catch (err) {
      const msg = err.response?.data?.error || 'No se pudo abrir el PDF.'
      setAlert({ type: 'error', message: msg })
    }
  }

  async function downloadPdfFile() {
    try {
      const res = await apiClient.get(`${pdfEndpoint}?download=true`, { responseType: 'blob' })
      const blob = new Blob([res.data], { type: 'application/pdf' })
      const url = URL.createObjectURL(blob)

      const rawDisposition = res.headers?.['content-disposition'] || ''
      const match = rawDisposition.match(/filename="?([^";]+)"?/i)
      const fileName = match?.[1] || `valoracion-${id}.pdf`

      const anchor = document.createElement('a')
      anchor.href = url
      anchor.download = fileName
      document.body.appendChild(anchor)
      anchor.click()
      document.body.removeChild(anchor)
      URL.revokeObjectURL(url)
    } catch (err) {
      const msg = err.response?.data?.error || 'No se pudo descargar el PDF.'
      setAlert({ type: 'error', message: msg })
    }
  }

  if (loading) return <LoadingSpinner />
  if (!assessment) return (
    <div className="result-page">
      <AlertMessage type="error" message="No se encontró la valoración." />
    </div>
  )

  const a = assessment

  return (
    <div className="result-page">
      {/* Back */}
      <Link to="/dashboard" className="result-back-link">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
        Volver al dashboard
      </Link>

      {/* Header */}
      <div className="page-header">
        <h1 className="page-title">
          Resultado de Valoración
          <span className="page-title-line" />
        </h1>
        <p className="result-date">
          {new Date(a.createdAt).toLocaleDateString('es-CO', { year: 'numeric', month: 'long', day: 'numeric' })}
        </p>
      </div>

      <AlertMessage {...alert} onClose={() => setAlert(null)} />

      {/* Medidas corporales */}
      <SectionCard icon={<IconBody />} title="Medidas corporales">
        <div className="result-grid">
          <ResultItem label="Peso"           value={`${a.peso} kg`} />
          <ResultItem label="Estatura"       value={`${a.estatura} cm`} />
          <ResultItem label="IMC"            value={a.imc} />
          <ResultItem label="Grasa corporal" value={`${a.grasaCorporal}%`} />
          <ResultItem label="Masa muscular"  value={`${a.masaMuscular} kg`} />
          <ResultItem label="Masa magra"     value={`${a.masaMagra} kg`} />
          <ResultItem label="Agua corporal"  value={`${a.aguaCorporal}%`} />
          <ResultItem label="Grasa visceral" value={`Nivel ${a.grasaVisceral}`} />
        </div>
      </SectionCard>

      {/* Datos clínicos */}
      <SectionCard icon={<IconClinical />} title="Datos clínicos">
        <div className="result-grid">
          <ResultItem label="Presión arterial"    value={a.presionArterial} />
          <ResultItem label="Edad metabólica"     value={a.edadMetabolica} />
          <ResultItem label="Fuerza de agarre"    value={`${a.fuerzaAgarre} kg`} />
          <ResultItem label="Resistencia musc."   value={a.resistenciaMuscular} />
          <ResultItem label="RM estimado"         value={a.rmEstimado} />
          <ResultItem label="PPM"                 value={a.ppm} />
          <ResultItem label="Actividad física"    value={a.nivelActividadFisica} />
          <ResultItem label="Objetivo"            value={a.objetivoUsuario} />
        </div>
        {a.observacion && (
          <p className="result-obs">
            <strong style={{ color: 'var(--color-muted)' }}>Observaciones: </strong>{a.observacion}
          </p>
        )}
      </SectionCard>

      {/* Análisis IA */}
      <SectionCard icon={<IconAI />} title="Análisis con IA">
        {a.analisisIA ? (
          <div className="ai-done-box">
            <p className="ai-done-text">Análisis generado correctamente.</p>
            <div className="ai-done-actions">
              <button className="ui-btn-primary" onClick={openPdfPreview}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
                Ver PDF
              </button>
              <button className="ui-btn-secondary" onClick={downloadPdfFile} type="button">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                Descargar PDF
              </button>
            </div>
          </div>
        ) : (
          <div className="ai-pending-box">
            <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="var(--color-dim)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"/><path d="M12 8v4l3 3"/>
            </svg>
            <p className="ai-pending-text">
              Análisis pendiente. Necesitas conexión a internet para generarlo con IA.
            </p>
            <button className="ui-btn-primary" onClick={handleAnalyze} disabled={analyzing}>
              {analyzing ? 'Generando análisis...' : 'Generar Análisis con IA →'}
            </button>
          </div>
        )}
      </SectionCard>
    </div>
  )
}
