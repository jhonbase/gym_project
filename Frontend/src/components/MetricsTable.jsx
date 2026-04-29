/**
 * Tabla comparativa de métricas
 */

export default function MetricsTable({ data }) {
  if (!data) return null

  const rows = [
    { key: 'peso', label: 'Peso', data: data.peso },
    { key: 'grasaCorporal', label: 'Grasa corporal', data: data.grasaCorporal },
    { key: 'masaMuscular', label: 'Masa muscular', data: data.masaMuscular },
    { key: 'imc', label: 'IMC', data: data.imc }
  ]

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
          {rows.map(row => (
            <tr key={row.key}>
              <td>{row.label}</td>
              <td>{row.data.start} {row.data.unit}</td>
              <td>{row.data.current} {row.data.unit}</td>
              <td className={row.data.change < 0 ? 'change-negative' : 'change-positive'}>
                {row.data.change > 0 ? '+' : ''}{row.data.change} {row.data.unit}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}