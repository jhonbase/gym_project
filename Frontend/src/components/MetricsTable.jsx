/**
 * Tabla comparativa de métricas
 * Soporta modo comparación entre dos valoraciones
 */

function formatDiff(val, unit) {
  if (val === 0) return { text: '0 ' + unit, cls: 'change-neutral' }
  return {
    text: (val > 0 ? '+' : '') + val + ' ' + unit,
    cls: val > 0 ? 'change-positive' : 'change-negative'
  }
}

export default function MetricsTable({ data, compareData }) {
  if (!data) return null

  const rows = [
    { key: 'peso', label: 'Peso', unit: 'kg' },
    { key: 'grasaCorporal', label: 'Grasa corporal', unit: '%' },
    { key: 'masaMuscular', label: 'Masa muscular', unit: 'kg' },
    { key: 'imc', label: 'IMC', unit: '' },
    { key: 'grasaVisceral', label: 'Grasa visceral', unit: 'nivel' }
  ]

  if (compareData) {
    return (
      <div className="metrics-table">
        <table>
          <thead>
            <tr>
              <th>Métrica</th>
              <th>Val. 1</th>
              <th>Val. 2</th>
              <th>Diferencia</th>
            </tr>
          </thead>
          <tbody>
            {rows.map(row => {
              const d1 = data[row.key]
              const d2 = compareData[row.key]
              if (!d1 || !d2) return null
              const diff = Math.round((d2.current - d1.current) * 10) / 10
              const df = formatDiff(diff, d2.unit)
              return (
                <tr key={row.key}>
                  <td>{row.label}</td>
                  <td>{d1.current} {d1.unit}</td>
                  <td>{d2.current} {d2.unit}</td>
                  <td className={df.cls}>{df.text}</td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    )
  }

  return (
    <div className="metrics-table">
      <table>
        <thead>
          <tr>
            <th>Métrica</th>
            <th>Inicio</th>
            <th>Actual</th>
            <th>Cambio</th>
          </tr>
        </thead>
        <tbody>
          {rows.map(row => {
            const d = data[row.key]
            if (!d) return null
            return (
              <tr key={row.key}>
                <td>{row.label}</td>
                <td>{d.start} {d.unit}</td>
                <td>{d.current} {d.unit}</td>
                <td className={d.change < 0 ? 'change-negative' : 'change-positive'}>
                  {d.change > 0 ? '+' : ''}{d.change} {d.unit}
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
