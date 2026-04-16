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

/* ─── Visualización del Plan de Entrenamiento (Editable) ─── */
function PlanVisualization({ plan, onSave, readOnly = true, onAlert }) {
  if (!plan) return null

  const [parsed, setParsed] = useState(() => parseTrainingPlan(plan))
  const [editingRow, setEditingRow] = useState(null)
  const [addingAfterRow, setAddingAfterRow] = useState(null)
  const [newExercise, setNewExercise] = useState({ grupo: '', ejercicio: '', series: '3', reps: '12', descanso: '60s' })
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    setParsed(parseTrainingPlan(plan))
  }, [plan])

  if (parsed.table.length === 0 && readOnly) {
    return <pre style={{ whiteSpace: 'pre-wrap', padding: '1rem', background: 'var(--color-surface2)', borderRadius: '12px', fontSize: '0.85rem', lineHeight: 1.6 }}>{plan}</pre>
  }

  function generatePlanText() {
    const days = {}
    parsed.table.forEach(row => {
      if (!days[row.dia]) days[row.dia] = []
      days[row.dia].push(row)
    })

    let text = '| Día | Grupo Muscular | Ejercicio | Series | Reps | Descanso |\n'
    text += '|---|---|---|---|---|---|\n'

    Object.entries(days).forEach(([dia, rows]) => {
      rows.forEach((row, idx) => {
        // Solo mostrar el día en el primer ejercicio de cada día
        text += `| ${idx === 0 ? dia : ''} | ${row.grupo} | ${row.ejercicio} | ${row.series} | ${row.reps} | ${row.descanso} |\n`
      })
    })

    return text
  }

  async function handleSave() {
    setSaving(true)
    try {
      await onSave(generatePlanText())
    } finally {
      setSaving(false)
    }
  }

  function handleDoubleClick(index) {
    if (readOnly) return
    setEditingRow(index)
  }

  function handleCellChange(index, field, value) {
    const newTable = [...parsed.table]
    newTable[index] = { ...newTable[index], [field]: value }
    setParsed({ ...parsed, table: newTable })
  }

  function handleSaveRow() {
    setEditingRow(null)
  }

  function handleDeleteRow(index) {
    if (!confirm('¿Eliminar este ejercicio?')) return
    const newTable = parsed.table.filter((_, i) => i !== index)
    setParsed({ ...parsed, table: newTable })
  }

  function handleStartAdd(rowIndex) {
    setAddingAfterRow(rowIndex)
    const targetDay = parsed.table[rowIndex].dia
    setNewExercise({ grupo: '', ejercicio: '', series: '3', reps: '12', descanso: '60s' })
  }

  function handleAddExercise() {
    if (!newExercise.ejercicio.trim() || !newExercise.grupo.trim()) {
      onAlert?.({ type: 'error', message: 'Completa todos los campos' })
      return
    }
    const targetDay = parsed.table[addingAfterRow].dia
    const newRow = { dia: targetDay, ...newExercise }
    const newTable = [...parsed.table]
    newTable.splice(addingAfterRow + 1, 0, newRow)
    setParsed({ ...parsed, table: newTable })
    setAddingAfterRow(null)
  }

  let lastDia = ''

  return (
    <div className="plan-editable-container">
      <table className="plan-modal-table">
        <thead>
          <tr>
            <th>Día</th>
            <th>Grupo Muscular</th>
            <th>Ejercicio</th>
            <th>Series</th>
            <th>Reps</th>
            <th>Descanso</th>
            {!readOnly && <th style={{ width: '80px' }}></th>}
          </tr>
        </thead>
        <tbody>
          {parsed.table.map((row, i) => {
            const showDay = i === 0 ? true : parsed.table[i-1].dia !== row.dia
            const isEditing = editingRow === i
            const showAddRowBelow = addingAfterRow === i

            return (
              <>
                <tr
                  key={i}
                  className={showDay && i !== 0 ? 'day-separator' : ''}
                  onDoubleClick={() => handleDoubleClick(i)}
                >
                  <td className="td-day">{showDay ? row.dia : ''}</td>
                  <td className="td-group">
                    {isEditing ? (
                      <input
                        className="plan-cell-input"
                        value={row.grupo}
                        onChange={(e) => handleCellChange(i, 'grupo', e.target.value)}
                      />
                    ) : row.grupo}
                  </td>
                  <td className="td-exercise">
                    {isEditing ? (
                      <input
                        className="plan-cell-input"
                        value={row.ejercicio}
                        onChange={(e) => handleCellChange(i, 'ejercicio', e.target.value)}
                      />
                    ) : row.ejercicio}
                  </td>
                  <td className="td-sets">
                    {isEditing ? (
                      <input
                        className="plan-cell-input small"
                        value={row.series}
                        onChange={(e) => handleCellChange(i, 'series', e.target.value)}
                      />
                    ) : row.series}
                  </td>
                  <td className="td-reps">
                    {isEditing ? (
                      <input
                        className="plan-cell-input small"
                        value={row.reps}
                        onChange={(e) => handleCellChange(i, 'reps', e.target.value)}
                      />
                    ) : row.reps}
                  </td>
                  <td className="td-rest">
                    {isEditing ? (
                      <input
                        className="plan-cell-input small"
                        value={row.descanso}
                        onChange={(e) => handleCellChange(i, 'descanso', e.target.value)}
                      />
                    ) : row.descanso}
                  </td>
                  {!readOnly && (
                    <td className="td-actions">
                      {isEditing ? (
                        <button className="plan-save-btn" onClick={handleSaveRow} title="Guardar">
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 6L9 17l-5-5"/></svg>
                        </button>
                      ) : (
                        <>
                          <button className="plan-add-row-btn" onClick={() => handleStartAdd(i)} title="Agregar ejercicio">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                          </button>
                          <button className="plan-delete-btn" onClick={() => handleDeleteRow(i)} title="Eliminar">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/></svg>
                          </button>
                        </>
                      )}
                    </td>
                  )}
                </tr>
                {showAddRowBelow && (
                  <tr key={`add-${i}`} className="plan-new-row">
                    <td className="td-day"></td>
                    <td className="td-group">
                      <input
                        className="plan-cell-input"
                        placeholder="Grupo muscular"
                        value={newExercise.grupo}
                        onChange={(e) => setNewExercise({ ...newExercise, grupo: e.target.value })}
                        autoFocus
                      />
                    </td>
                    <td className="td-exercise">
                      <input
                        className="plan-cell-input"
                        placeholder="Ejercicio"
                        value={newExercise.ejercicio}
                        onChange={(e) => setNewExercise({ ...newExercise, ejercicio: e.target.value })}
                      />
                    </td>
                    <td className="td-sets">
                      <input
                        className="plan-cell-input small"
                        placeholder="Series"
                        value={newExercise.series}
                        onChange={(e) => setNewExercise({ ...newExercise, series: e.target.value })}
                      />
                    </td>
                    <td className="td-reps">
                      <input
                        className="plan-cell-input small"
                        placeholder="Reps"
                        value={newExercise.reps}
                        onChange={(e) => setNewExercise({ ...newExercise, reps: e.target.value })}
                      />
                    </td>
                    <td className="td-rest">
                      <input
                        className="plan-cell-input small"
                        placeholder="Descanso"
                        value={newExercise.descanso}
                        onChange={(e) => setNewExercise({ ...newExercise, descanso: e.target.value })}
                      />
                    </td>
                    <td className="td-actions">
                      <button className="plan-save-btn" onClick={handleAddExercise} title="Confirmar">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 6L9 17l-5-5"/></svg>
                      </button>
                      <button className="plan-delete-btn" onClick={() => setAddingAfterRow(null)} title="Cancelar">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                      </button>
                    </td>
                  </tr>
                )}
              </>
            )
          })}
        </tbody>
      </table>

      {!readOnly && (
        <div className="plan-modal-actions">
          <button className="ui-btn-primary" onClick={handleSave} disabled={saving}>
            {saving ? 'Guardando...' : 'Guardar Cambios'}
          </button>
        </div>
      )}
    </div>
  )
}

/* ─── Parser del Plan de Entrenamiento ─── */
function parseTrainingPlan(planText) {
  const table = []
  const notes = []
  const lines = planText.split('\n')
  
  const headerKeywords = ['día', 'grupo muscular', 'ejercicio', 'series', 'reps', 'descanso', 'dia', 'group']
  const dayKeywords = ['lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado', 'domingo', 'lun', 'mar', 'mie', 'jue', 'vie', 'sáb', 'dom', 'semana']
  
  let lastDia = ''
  
  for (const line of lines) {
    const trimmed = line.trim()
    if (!trimmed) continue
    
    // Notas
    if (trimmed.toLowerCase().includes('nota') && trimmed.length < 40) {
      const notesText = trimmed.replace(/\*\*/g, '').trim()
      if (notesText) notes.push(notesText)
      continue
    }
    
    // Tabla
    if (trimmed.includes('|')) {
      const cells = trimmed.split('|').map(c => c.trim()).filter(c => c.length > 0)
      
      if (cells.length < 5) continue
      
      // Saltar header y separadores
      const isSeparator = trimmed.includes('---') || trimmed.match(/^[\s|-]+$/)
      if (isSeparator) continue
      
      const firstLower = cells[0].toLowerCase()
      if (headerKeywords.some(kw => firstLower.includes(kw))) continue
      
      // Determinar si la primera celda es un día o no
      const isDay = dayKeywords.some(d => firstLower.includes(d))
      
      if (isDay) {
        // La primera celda es el día
        lastDia = cells[0]
        table.push({
          dia: lastDia,
          grupo: cells[1] || '-',
          ejercicio: cells[2] || '',
          series: cells[3] || '-',
          reps: cells[4] || '-',
          descanso: cells[5] || '-'
        })
      } else {
        // No hay día en esta fila - usar el último día conocido
        // Los valores están corridos 1 posición
        table.push({
          dia: lastDia,
          grupo: cells[0] || '-',
          ejercicio: cells[1] || '',
          series: cells[2] || '-',
          reps: cells[3] || '-',
          descanso: cells[4] || '-'
        })
      }
    }
  }
  
  return { table, notes }
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
  const [showPlanModal, setShowPlanModal] = useState(false)

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

      {/* Resultados por IA */}
      <SectionCard icon={<IconAI />} title="Resultados por IA">
        <div className="documents-grid">
          {/* Análisis IA */}
          <div className={`document-card ${a.analisisIA ? 'document-card-ready' : 'document-card-pending'}`}>
            <div className="document-card-icon">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                <polyline points="14 2 14 8 20 8"/>
                <line x1="16" y1="13" x2="8" y2="13"/>
                <line x1="16" y1="17" x2="8" y2="17"/>
                <polyline points="10 9 9 9 8 9"/>
              </svg>
            </div>
            <div className="document-card-content">
              <h3 className="document-card-title">Análisis con IA</h3>
              {a.analisisIA ? (
                <p className="document-card-status">Generado</p>
              ) : (
                <p className="document-card-status document-card-status-pending">Pendiente</p>
              )}
            </div>
            <div className="document-card-actions">
              {a.analisisIA ? (
                <>
                  <button className="document-btn document-btn-primary" onClick={openPdfPreview}>
                    Ver
                  </button>
                  <button className="document-btn-icon" onClick={handleAnalyze} disabled={analyzing} title="Regenerar">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M23 4v6h-6"/><path d="M1 20v-6h6"/><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/>
                    </svg>
                  </button>
                </>
              ) : (
                <button className="document-btn document-btn-primary" onClick={handleAnalyze} disabled={analyzing}>
                  {analyzing ? 'Generando...' : 'Generar'}
                </button>
              )}
            </div>
          </div>

          {/* Plan de Entrenamiento */}
          <div className={`document-card ${a.planEntrenamiento ? 'document-card-ready' : 'document-card-pending'}`}>
            <div className="document-card-icon">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="3" width="18" height="18" rx="2"/>
                <path d="M3 9h18"/>
                <path d="M9 21V9"/>
              </svg>
            </div>
            <div className="document-card-content">
              <h3 className="document-card-title">Plan de Entrenamiento</h3>
              {a.planEntrenamiento ? (
                <p className="document-card-status">Generado</p>
              ) : (
                <p className="document-card-status document-card-status-pending">Pendiente</p>
              )}
            </div>
            <div className="document-card-actions">
              {a.planEntrenamiento ? (
                <button className="document-btn document-btn-primary" onClick={() => setShowPlanModal(true)}>
                  Ver
                </button>
              ) : (
                <span className="document-card-empty">Sin plan</span>
              )}
            </div>
          </div>
        </div>
      </SectionCard>

      {/* Plan Modal */}
      {showPlanModal && a.planEntrenamiento && (
        <div className="plan-modal-overlay" onClick={() => setShowPlanModal(false)}>
          <div className="plan-modal-content" onClick={e => e.stopPropagation()}>
            <div className="plan-modal-header">
              <h2>Plan de Entrenamiento Semanal</h2>
              <button className="plan-modal-close" onClick={() => setShowPlanModal(false)}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M18 6L6 18M6 6l12 12"/>
                </svg>
              </button>
            </div>
            <div className="plan-modal-body">
              <PlanVisualization
                plan={a.planEntrenamiento}
                onSave={async (newPlan) => {
                  setSavingPlan(true)
                  try {
                    const res = await apiClient.put(`/assessments/${id}/training-plan`, {
                      planEntrenamiento: newPlan,
                    })
                    setAssessment(res.data.data.assessment)
                    setShowPlanModal(false)
                    setAlert({ type: 'success', message: 'Plan de entrenamiento actualizado.' })
                  } catch (err) {
                    setAlert({ type: 'error', message: 'Error al guardar el plan.' })
                  } finally {
                    setSavingPlan(false)
                  }
                }}
                readOnly={false}
                onAlert={setAlert}
              />
            </div>
          </div>
        </div>
      )}

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
