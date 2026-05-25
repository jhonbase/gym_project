import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import LoadingSpinner from '../components/LoadingSpinner.jsx'
import EvolutionChart from '../components/EvolutionChart.jsx'
import MetricsTable from '../components/MetricsTable.jsx'
import ObjectiveCard from '../components/ObjectiveCard.jsx'
import HealthBlock from '../components/HealthBlock.jsx'
import SidebarCards from '../components/SidebarCards.jsx'
import TrainingIndications from '../components/TrainingIndications.jsx'
import NextAssessment from '../components/NextAssessment.jsx'
import { useStudentProgress } from '../hooks/useStudentProgress.js'
import { metrics } from '../mocks/progressMock.js'

const IconArrowLeft = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
    <polyline points="15 18 9 12 15 6"/>
  </svg>
)

export default function StudentProgressPage() {
  const { id } = useParams()
  const navigate = useNavigate()

  const [localId1, setLocalId1] = useState('')
  const [localId2, setLocalId2] = useState('')

  const {
    loading,
    error,
    data,
    metric,
    dateRange,
    metrics: metricOptions,
    changeMetric,
    changeDateRange,
    assessments,
    compareMode,
    compareIds,
    startCompare,
    clearComparison,
  } = useStudentProgress(id)

  if (loading) return <LoadingSpinner />
  if (error) return <div className="error">{error}</div>

  const currentMetric = metrics.find(m => m.value === metric)

  const sel1 = assessments.find(a => a.id === compareIds?.id1)
  const sel2 = assessments.find(a => a.id === compareIds?.id2)

  const compareData = sel2 ? {
    peso: { current: sel2.peso, value: sel2.peso, unit: 'kg' },
    grasaCorporal: { current: sel2.grasaCorporal, value: sel2.grasaCorporal, unit: '%' },
    masaMuscular: { current: sel2.masaMuscular, value: sel2.masaMuscular, unit: 'kg' },
    imc: { current: sel2.imc, value: sel2.imc, unit: '' },
    grasaVisceral: { current: sel2.grasaVisceral, value: sel2.grasaVisceral, unit: 'nivel' },
  } : null

  return (
    <div className="progress-page">
      <header className="progress-header">
        <button className="back-btn" onClick={() => navigate(`/student/${id}`)}>
          <IconArrowLeft /> Volver
        </button>
        <h1>Progreso del estudiante</h1>
      </header>

      {compareMode && (
        <div className="compare-banner">
          Comparando: {sel1?.fecha} vs {sel2?.fecha}
        </div>
      )}

      <div className="progress-content">
        <main className="progress-main">
          <div className="progress-filters">
            <select
              value={metric}
              onChange={(e) => changeMetric(e.target.value)}
              className="ui-select"
              disabled={compareMode}
            >
              {metricOptions.map(m => (
                <option key={m.value} value={m.value}>{m.label}</option>
              ))}
            </select>
            <select
              value={dateRange}
              onChange={(e) => changeDateRange(e.target.value)}
              className="ui-select"
              disabled={compareMode}
            >
              <option value="7d">7 días</option>
              <option value="1m">1 mes</option>
              <option value="3m">3 meses</option>
              <option value="6m">6 meses</option>
            </select>

            <div className="compare-selectors">
              <select
                value={localId1}
                onChange={(e) => setLocalId1(e.target.value)}
                className="ui-select"
              >
                <option value="">Evaluación 1</option>
                {assessments.map(a => (
                  <option key={a.id} value={a.id}>{a.fecha}</option>
                ))}
              </select>
              <select
                value={localId2}
                onChange={(e) => setLocalId2(e.target.value)}
                className="ui-select"
              >
                <option value="">Evaluación 2</option>
                {assessments.map(a => (
                  <option key={a.id} value={a.id}>{a.fecha}</option>
                ))}
              </select>
              <button
                className="ui-btn"
                onClick={() => startCompare(localId1, localId2)}
                disabled={!localId1 || !localId2}
              >
                Comparar
              </button>
              <button
                className="compare-clear-btn"
                onClick={() => {
                  clearComparison()
                  setLocalId1('')
                  setLocalId2('')
                }}
              >
                Limpiar
              </button>
            </div>
          </div>

          <section className="progress-chart-row">
            <h2>Evolución - {currentMetric?.label}</h2>
            <EvolutionChart
              data={data?.evolution}
              metric={metric}
              unit={currentMetric?.unit}
              filter={dateRange}
              data2={compareMode && sel2 ? [{ date: sel2.fechaRaw, value: sel2[metric] ?? 0 }] : null}
              label2={sel2 ? sel2.fecha : null}
              unit2={currentMetric?.unit}
            />
          </section>

          <div className="progress-cards-row">
            <section className="progress-section">
              <h2>Comparativa</h2>
              {assessments.length < 2 ? (
                <p>Se mostrará la comparativa cuando tengas más de una valoración</p>
              ) : (
                <MetricsTable data={data?.comparison} compareData={compareData} />
              )}
            </section>
            <section className="progress-section">
              <ObjectiveCard data={data?.objective} />
            </section>
          </div>

          <section className="progress-section progress-indications-full">
            <TrainingIndications data={data?.indications} />
          </section>
        </main>

        <aside className="progress-sidebar">
          <SidebarCards data={data?.sidebar} objective={data?.objective} compareData={compareData} />
          <HealthBlock data={data?.health} compareData={compareData} />
          <NextAssessment data={data?.next} />
        </aside>
      </div>
    </div>
  )
}
