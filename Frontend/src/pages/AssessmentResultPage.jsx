import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import apiClient from '../api/client.js'
import LoadingSpinner from '../components/LoadingSpinner.jsx'
import AlertMessage from '../components/AlertMessage.jsx'

export default function AssessmentResultPage() {
  const { id } = useParams()
  const [assessment, setAssessment] = useState(null)
  const [loading, setLoading] = useState(true)
  const [analyzing, setAnalyzing] = useState(false)
  const [alert, setAlert] = useState(null)

  const pdfUrl = `/api/assessments/${id}/pdf`

  useEffect(() => {
    apiClient.get(`/assessments/${id}`)
      .then(res => setAssessment(res.data.data.assessment))
      .catch(() => setAlert({ type: 'error', message: 'Error al cargar la valoración' }))
      .finally(() => setLoading(false))
  }, [id])

  async function handleAnalyze() {
    setAnalyzing(true)
    try {
      const res = await apiClient.post(`/assessments/${id}/analyze`)
      setAssessment(res.data.data.assessment)
      // Al generar el análisis, abrir el PDF automáticamente
      window.open(pdfUrl, '_blank')
    } catch {
      setAlert({ type: 'error', message: 'No se pudo generar el análisis. ¿Hay conexión a internet?' })
    } finally {
      setAnalyzing(false)
    }
  }

  if (loading) return <LoadingSpinner />
  if (!assessment) return <p>No se encontró la valoración.</p>

  const a = assessment
  return (
    <div className="assessment-result">
      <Link to="/dashboard" className="back-link">← Volver al dashboard</Link>
      <h1>📋 Resultado de Valoración</h1>
      <p className="date">{new Date(a.createdAt).toLocaleDateString()}</p>
      <AlertMessage {...alert} onClose={() => setAlert(null)} />

      <div className="card">
        <h3>Medidas corporales</h3>
        <div className="result-grid">
          <span>Peso: {a.peso} kg</span>
          <span>Estatura: {a.estatura} cm</span>
          <span>IMC: {a.imc}</span>
          <span>Grasa corporal: {a.grasaCorporal}%</span>
          <span>Masa muscular: {a.masaMuscular} kg</span>
          <span>Masa magra: {a.masaMagra} kg</span>
          <span>Agua corporal: {a.aguaCorporal}%</span>
          <span>Grasa visceral: nivel {a.grasaVisceral}</span>
        </div>
      </div>

      <div className="card">
        <h3>Datos clínicos</h3>
        <div className="result-grid">
          <span>Presión arterial: {a.presionArterial}</span>
          <span>Edad metabólica: {a.edadMetabolica}</span>
          <span>Fuerza de agarre: {a.fuerzaAgarre} kg</span>
          <span>Resistencia muscular: {a.resistenciaMuscular}</span>
          <span>RM estimado: {a.rmEstimado}</span>
          <span>PPM: {a.ppm}</span>
          <span>Actividad física: {a.nivelActividadFisica}</span>
          <span>Objetivo: {a.objetivoUsuario}</span>
        </div>
        {a.observacion && <p><strong>Observaciones:</strong> {a.observacion}</p>}
      </div>

      <div className="card ai-card">
        <h3>🤖 Análisis IA</h3>
        {a.analisisIA ? (
          <div className="pdf-actions">
            <p>Análisis generado correctamente.</p>
            <button className="btn-primary" onClick={() => window.open(pdfUrl, '_blank')}>
              📄 Ver PDF
            </button>
            <a className="btn-secondary" href={`${pdfUrl}?download=true`} download>
              ⬇ Descargar PDF
            </a>
          </div>
        ) : (
          <div className="ai-pending">
            <p>Análisis pendiente. Necesitas conexión a internet para generarlo.</p>
            <button className="btn-primary" onClick={handleAnalyze} disabled={analyzing}>
              {analyzing ? 'Generando análisis...' : 'Generar Análisis con IA'}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}