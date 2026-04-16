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
const IconContext = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#E10600" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h8"/>
  </svg>
)
const IconAI = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#E10600" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 2a2 2 0 0 1 2 2c0 .74-.4 1.39-1 1.73V7h1a7 7 0 0 1 7 7h1a1 1 0 0 1 1 1v3a1 1 0 0 1-1 1h-1v1a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-1H2a1 1 0 0 1-1-1v-3a1 1 0 0 1 1-1h1a7 7 0 0 1 7-7h1V5.73c-.6-.34-1-.99-1-1.73a2 2 0 0 1 2-2z"/>
  </svg>
)
const IconTraining = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#E10600" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M6.5 6.5h11v11h-11z"/><path d="M6.5 6.5L17.5 17.5"/><path d="M17.5 6.5L6.5 17.5"/>
  </svg>
)
const IconLesion = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#E10600" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/>
  </svg>
)
const IconHistory = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#E10600" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><rect x="8" y="2" width="8" height="4" rx="1" ry="1"/>
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
  const [editingPlan, setEditingPlan] = useState(false)
  const [planDraft, setPlanDraft] = useState('')
  const [savingPlan, setSavingPlan] = useState(false)

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
      console.log('Regenerando análisis para:', id)
      const res = await apiClient.post(`/assessments/${id}/analyze`)
      console.log('Respuesta:', res.data)
      setAssessment(res.data.data.assessment)
      setAlert({ type: 'success', message: 'Análisis y plan regenerados correctamente.' })
      await openPdfPreview()
    } catch (err) {
      console.error('Error al regenerar:', err)
      const msg = err.response?.data?.error || 'No se pudo regenerar el análisis.'
      setAlert({ type: 'error', message: msg })
    } finally {
      setAnalyzing(false)
    }
  }

  function handleEditPlan() {
    setPlanDraft(assessment.planEntrenamiento || '')
    setEditingPlan(true)
  }

  function handleCancelEdit() {
    setEditingPlan(false)
    setPlanDraft('')
  }

  async function handleSavePlan() {
    setSavingPlan(true)
    try {
      const res = await apiClient.put(`/assessments/${id}/training-plan`, {
        planEntrenamiento: planDraft,
      })
      setAssessment(res.data.data.assessment)
      setEditingPlan(false)
      setAlert({ type: 'success', message: 'Plan de entrenamiento actualizado.' })
    } catch (err) {
      setAlert({ type: 'error', message: 'Error al guardar el plan.' })
    } finally {
      setSavingPlan(false)
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

  function goBack() {
    if (window.history.length > 1) {
      window.history.back()
    } else {
      window.location.href = '/dashboard'
    }
  }

  return (
    <div className="result-page">
      {/* Back */}
      <div className="result-header-actions">
        <button onClick={goBack} className="result-back-link">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
          Volver
        </button>
        <Link to={`/assessment/${id}/edit`} className="result-edit-link">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
          Editar valoración
        </Link>
      </div>

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
          {a.masaMagra && <ResultItem label="Masa magra" value={`${a.masaMagra} kg`} />}
          {a.aguaCorporal && <ResultItem label="Agua corporal" value={`${a.aguaCorporal}%`} />}
          <ResultItem label="Grasa visceral" value={`Nivel ${a.grasaVisceral}`} />
        </div>
      </SectionCard>

      {/* Datos clínicos */}
      <SectionCard icon={<IconClinical />} title="Datos clínicos">
        <div className="result-grid">
          <ResultItem label="Presión arterial"    value={a.presionArterial} />
          <ResultItem label="Edad metabólica"     value={a.edadMetabolica} />
          <ResultItem label="Resistencia musc."   value={a.resistenciaMuscular} />
        </div>
      </SectionCard>

      {/* Contexto del usuario */}
      <SectionCard icon={<IconContext />} title="Contexto del usuario">
        <ResultItem label="Nivel de actividad" value={a.nivelActividadFisica} />
      </SectionCard>

      {/* Evidencia de lesión */}
      {(a.lesionEvidencia || a.lesionDescripcion) && (
        <SectionCard icon={<IconLesion />} title="Evidencia de lesión">
          <div className="lesion-result">
            {a.lesionDescripcion && (
              <p className="result-obs">
                <strong style={{ color: 'var(--color-muted)' }}>Descripción: </strong>{a.lesionDescripcion}
              </p>
            )}
            {a.lesionEvidencia && (
              <a 
                href={`http://localhost:3000${a.lesionEvidencia}`}
                target="_blank"
                rel="noopener noreferrer"
                className="lesion-result-link"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/>
                </svg>
                Ver evidencia adjunta
              </a>
            )}
          </div>
        </SectionCard>
      )}

      {/* Antecedentes de salud */}
      {(a.anteOsteomuscular || a.anteCardiovascular || a.anteRespiratorio || a.anteMetabolico || a.antePsiquiatrico || a.antePsicologico) && (
        <SectionCard icon={<IconHistory />} title="Antecedentes de salud">
          <div className="result-grid">
            {a.anteOsteomuscular && <ResultItem label="Osteomuscular" value={a.anteOsteomuscularDesc || 'Sí'} />}
            {a.anteCardiovascular && <ResultItem label="Cardiovascular" value={a.anteCardiovascularDesc || 'Sí'} />}
            {a.anteRespiratorio && <ResultItem label="Respiratorio" value={a.anteRespiratorioDesc || 'Sí'} />}
            {a.anteMetabolico && <ResultItem label="Metabólico" value={a.anteMetabolicoDesc || 'Sí'} />}
            {a.antePsiquiatrico && <ResultItem label="Psiquiátrico" value={a.antePsiquiatricoDesc || 'Sí'} />}
            {a.antePsicologico && <ResultItem label="Psicológico" value={a.antePsicologicoDesc || 'Sí'} />}
          </div>
        </SectionCard>
      )}

      {/* Objetivo del usuario */}
      {a.objetivoUsuario && (
        <SectionCard 
          icon={<span style={{ fontSize: '1.2rem' }}>🏆</span>} 
          title="Objetivo del usuario"
          className="objetivo-section"
        >
          <div className="result-objetivo">
            <div className="result-objetivo-value">{a.objetivoUsuario}</div>
          </div>
          {a.observacion && (
            <p className="result-obs">
              <strong style={{ color: 'var(--color-muted)' }}>Observaciones: </strong>{a.observacion}
            </p>
          )}
        </SectionCard>
      )}

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
              <button className="ui-btn-icon" onClick={handleAnalyze} disabled={analyzing} title="Regenerar análisis">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M23 4v6h-6"/><path d="M1 20v-6h6"/><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/>
                </svg>
                {analyzing ? '...' : 'Regenerar'}
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

      {/* Plan de Entrenamiento */}
      <SectionCard icon={<IconTraining />} title="Plan de Entrenamiento">
        {editingPlan ? (
          <div className="plan-edit-box">
            <textarea
              className="plan-textarea"
              value={planDraft}
              onChange={(e) => setPlanDraft(e.target.value)}
              rows={15}
              placeholder="Escribe el plan de entrenamiento..."
            />
            <div className="plan-edit-actions">
              <button className="ui-btn-secondary" onClick={handleCancelEdit} disabled={savingPlan}>
                Cancelar
              </button>
              <button className="ui-btn-primary" onClick={handleSavePlan} disabled={savingPlan}>
                {savingPlan ? 'Guardando...' : 'Guardar Plan'}
              </button>
            </div>
          </div>
        ) : a.planEntrenamiento ? (
          <div className="plan-done-box">
            <pre className="plan-content">{a.planEntrenamiento}</pre>
            <button className="ui-btn-secondary" onClick={handleEditPlan}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
              </svg>
              Editar Plan
            </button>
          </div>
        ) : (
          <div className="ai-pending-box">
            <p className="ai-pending-text">Plan de entrenamiento pendiente.</p>
          </div>
        )}
      </SectionCard>

      {/* Próxima fecha de valoración */}
      {a.proximaFechaValoracion && (
        <SectionCard icon={<span>📅</span>} title="Próxima valoración" className="proxima-fecha-result">
          <div className="proxima-fecha-display">
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span className="proxima-fecha-icon">📅</span>
              <span className="proxima-fecha-date">
                {new Date(a.proximaFechaValoracion).toLocaleDateString('es-CO', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
              </span>
            </div>
            {new Date(a.proximaFechaValoracion) < new Date() && (
              <span className="proxima-fecha-overdue">⚠️ Vencida</span>
            )}
          </div>
        </SectionCard>
      )}
    </div>
  )
}
