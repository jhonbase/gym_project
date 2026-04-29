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
  const { loading, error, data, metric, dateRange, metrics: metricOptions, changeMetric, changeDateRange } = useStudentProgress(id)

  if (loading) return <LoadingSpinner />
  if (error) return <div className="error">{error}</div>

  const currentMetric = metrics.find(m => m.value === metric)

  return (
    <div className="progress-page">
      <header className="progress-header">
        <button className="back-btn" onClick={() => navigate(`/student/${id}`)}>
          <IconArrowLeft /> Volver
        </button>
        <h1>Progreso del estudiante</h1>
      </header>

      <div className="progress-content">
        <main className="progress-main">
          {/* Selector de métrica y rango */}
          <div className="progress-filters">
            <select 
              value={metric} 
              onChange={(e) => changeMetric(e.target.value)}
              className="ui-select"
            >
              {metricOptions.map(m => (
                <option key={m.value} value={m.value}>{m.label}</option>
              ))}
            </select>
            <select 
              value={dateRange} 
              onChange={(e) => changeDateRange(e.target.value)}
              className="ui-select"
            >
              <option value="7d">7 días</option>
              <option value="1m">1 mes</option>
              <option value="3m">3 meses</option>
              <option value="6m">6 meses</option>
            </select>
          </div>

          {/* Gráfica de evolución - fila completa */}
          <section className="progress-chart-row">
            <h2>Evolución - {currentMetric?.label}</h2>
            <EvolutionChart 
              data={data?.evolution} 
              metric={metric} 
              unit={currentMetric?.unit}
              filter={dateRange}
            />
          </section>

          {/* Area principal con las demás tarjetas */}
          <div className="progress-cards-row">
            {/* Tabla comparativa */}
            <section className="progress-section">
              <h2>Comparativa</h2>
              <MetricsTable data={data?.comparison} />
            </section>

            {/* Objetivo */}
            <section className="progress-section">
              <ObjectiveCard data={data?.objective} />
            </section>
          </div>

          {/* Indicaciones - fila completa abajo */}
          <section className="progress-section progress-indications-full">
            <TrainingIndications data={data?.indications} />
          </section>
        </main>

        {/* Sidebar derecho */}
        <aside className="progress-sidebar">
          <SidebarCards data={data?.sidebar} objective={data?.objective} />
          <HealthBlock data={data?.health} />
          <NextAssessment data={data?.next} />
        </aside>
      </div>
    </div>
  )
}