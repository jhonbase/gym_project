import { View, Text, StyleSheet, ScrollView, Dimensions, ActivityIndicator, TouchableOpacity } from 'react-native'
import { useEffect, useState } from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import Svg, { Path, Line, Circle, Text as SvgText } from 'react-native-svg'
import mockMetricas, { mockUser } from '../../mocks/metricsMock.js'

const COLORS = {
  background: '#0B0B0B',
  surface: '#1A1A1A',
  surfaceAlt: '#242424',
  accent: '#E10600',
  accentMuted: '#7C0400',
  textPrimary: '#FFFFFF',
  textSecondary: '#9A9A9A',
  success: '#2ECC71',
  warning: '#F39C12',
  danger: '#E10600',
  border: '#2A2A2A',
}

const SEMAPHOROS = {
  imc: (valor) => {
    if (valor < 18.5) return { color: COLORS.danger, label: 'Bajo peso' }
    if (valor <= 24.9) return { color: COLORS.success, label: 'Normal' }
    if (valor <= 29.9) return { color: COLORS.warning, label: 'Sobrepeso' }
    return { color: COLORS.danger, label: 'Obesidad' }
  },
  grasaCorporal: (valor) => {
    const isMale = mockUser.genero === 'masculino'
    if (isMale) {
      if (valor < 6) return { color: COLORS.danger, label: 'Muy baja' }
      if (valor <= 24) return { color: COLORS.success, label: 'Buena' }
      if (valor <= 31) return { color: COLORS.warning, label: 'Alta' }
      return { color: COLORS.danger, label: 'Muy alta' }
    } else {
      if (valor < 14) return { color: COLORS.danger, label: 'Muy baja' }
      if (valor <= 30) return { color: COLORS.success, label: 'Buena' }
      if (valor <= 36) return { color: COLORS.warning, label: 'Alta' }
      return { color: COLORS.danger, label: 'Muy alta' }
    }
  },
  aguaCorporal: (valor) => {
    if (valor < 50) return { color: COLORS.danger, label: 'Baja' }
    if (valor <= 65) return { color: COLORS.success, label: 'Normal' }
    return { color: COLORS.warning, label: 'Alta' }
  },
  grasaVisceral: (valor) => {
    if (valor <= 9) return { color: COLORS.success, label: 'Normal' }
    if (valor <= 14) return { color: COLORS.warning, label: 'Elevada' }
    return { color: COLORS.danger, label: 'Muy elevada' }
  },
}

function fmtFecha(dateStr) {
  const d = new Date(dateStr)
  const meses = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic']
  return `${d.getDate()} ${meses[d.getMonth()]}`
}

function fmtFechaCorta(dateStr) {
  const d = new Date(dateStr)
  const meses = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic']
  return `${d.getDate()} ${meses[d.getMonth()]}`
}

function SemaphoreCard({ label, value, unit, tipo }) {
  const semaforo = SEMAPHOROS[tipo]?.(value) || { color: COLORS.textSecondary, label: 'N/A' }
  
  return (
    <View style={[styles.semaphoreCard, { borderLeftColor: semaforo.color }]}>
      <Text style={styles.semaphoreLabel}>{label}</Text>
      <Text style={styles.semaphoreValue}>{value}{unit}</Text>
      <Text style={[styles.semaphoreStatus, { color: semaforo.color }]}>{semaforo.label}</Text>
    </View>
  )
}

const SELECTOR_OPTS = [
  { key: 'peso', label: 'Peso', unit: 'kg' },
  { key: 'grasaCorporal', label: 'Grasa', unit: '%' },
  { key: 'masaMuscular', label: 'Músculo', unit: 'kg' },
]

function EvolutionChart({ data, metricKey, metricLabel, unit }) {
  const chartW = Dimensions.get('window').width - 32
  const chartH = 180
  const padding = 32

  if (!data || data.length === 0) {
    return (
      <View style={[styles.chartContainer, { width: '100%' }]}>
        <Text style={styles.chartEmpty}>Sin datos</Text>
      </View>
    )
  }

  const vals = data.map(d => d.value)
  const maxY = Math.max(...vals)
  const minY = Math.min(...vals)
  const range = maxY - minY || 1
  const yPadding = (maxY - minY) * 0.1 || 1

  const points = data.map((d, i) => ({
    x: padding + (i / Math.max(data.length - 1, 1)) * (chartW - padding * 2),
    y: padding + chartH - padding - ((d.value - minY + yPadding) / (range + yPadding * 2)) * (chartH - padding * 2),
    value: d.value,
    date: d.date,
  }))

  const pathD = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x},${p.y}`).join(' ')
  const lastPoint = points[points.length - 1]

  return (
    <View style={styles.chartContainer}>
      <Svg width={chartW} height={chartH}>
        <Line x1={padding} y1={padding} x2={padding} y2={chartH - padding} stroke={COLORS.border} strokeWidth={1} />
        <Line x1={padding} y1={chartH - padding} x2={chartW - padding} y2={chartH - padding} stroke={COLORS.border} strokeWidth={1} />
        {data.length > 1 && <Path d={pathD} stroke={COLORS.accent} strokeWidth={2.5} fill="none" strokeLinejoin="round" />}
        {points.map((p, i) => (
          <Circle key={i} cx={p.x} cy={p.y} r={i === data.length - 1 ? 6 : 4} fill={i === data.length - 1 ? COLORS.textPrimary : COLORS.border} stroke={COLORS.accent} strokeWidth={i === data.length - 1 ? 2 : 0} />
        ))}
        {points.map((p, i) => (
          <SvgText key={`x-${i}`} x={p.x} y={chartH - 8} fontSize={10} fill={COLORS.textSecondary} textAnchor="middle">
            {fmtFechaCorta(p.date)}
          </SvgText>
        ))}
      </Svg>
      <Text style={styles.chartLastValue}>{lastPoint?.value.toFixed(1)} {unit}</Text>
    </View>
  )
}

function ComparisonTable({ actual, anterior }) {
  if (!actual || !anterior) return null

  const metrics = [
    { key: 'peso', label: 'Peso', unit: 'kg', mejor: 'neutro' },
    { key: 'grasaCorporal', label: 'Grasa corporal', unit: '%', mejor: 'bajo' },
    { key: 'masaMuscular', label: 'Masa muscular', unit: 'kg', mejor: 'sube' },
    { key: 'imc', label: 'IMC', unit: '', mejor: 'rango' },
    { key: 'grasaVisceral', label: 'Grasa visceral', unit: '', mejor: 'bajo' },
  ]

  const getCambio = (metric, valorActual, valorAnterior) => {
    const diff = valorActual - valorAnterior
    const isSame = Math.abs(diff) < 0.01

    if (metric.mejor === 'neutro') {
      return { diff, color: COLORS.textSecondary, arrow: '−', direction: 'same' }
    }
    if (metric.mejor === 'bajo') {
      if (isSame) return { diff, color: COLORS.textSecondary, arrow: '−', direction: 'same' }
      if (diff < 0) return { diff, color: COLORS.success, arrow: '↓', direction: 'better' }
      return { diff, color: COLORS.danger, arrow: '↑', direction: 'worse' }
    }
    if (metric.mejor === 'sube') {
      if (isSame) return { diff, color: COLORS.textSecondary, arrow: '−', direction: 'same' }
      if (diff > 0) return { diff, color: COLORS.success, arrow: '↑', direction: 'better' }
      return { diff, color: COLORS.danger, arrow: '↓', direction: 'worse' }
    }
    if (metric.mejor === 'rango') {
      const enRango = (v) => v >= 18.5 && v <= 24.9
      const estabaEnRango = enRango(valorAnterior)
      const estaEnRango = enRango(valorActual)
      if (estaEnRango && !estabaEnRango) return { diff, color: COLORS.success, arrow: '↓', direction: 'better' }
      if (!estaEnRango && estabaEnRango) return { diff, color: COLORS.danger, arrow: '↑', direction: 'worse' }
      if (diff < 0) return { diff, color: COLORS.success, arrow: '↓', direction: 'better' }
      if (diff > 0) return { diff, color: COLORS.danger, arrow: '↑', direction: 'worse' }
      return { diff, color: COLORS.textSecondary, arrow: '−', direction: 'same' }
    }
    return { diff, color: COLORS.textSecondary, arrow: '−', direction: 'same' }
  }

  return (
    <View style={styles.comparisonTable}>
      <View style={styles.tableHeader}>
        <Text style={[styles.tableHeaderText, { flex: 1.2 }]}>Métrica</Text>
        <Text style={[styles.tableHeaderText, { flex: 1 }]}>Anterior</Text>
        <Text style={[styles.tableHeaderText, { flex: 1 }]}>Actual</Text>
        <Text style={[styles.tableHeaderText, { flex: 1 }]}>Cambio</Text>
      </View>
      {metrics.map((m, i) => {
        const actualVal = actual[m.key]
        const anteriorVal = anterior[m.key]
        const cambio = getCambio(m, actualVal, anteriorVal)
        const bgColor = i % 2 === 0 ? COLORS.surface : COLORS.surfaceAlt
        
        return (
          <View key={m.key} style={[styles.tableRow, { backgroundColor: bgColor }]}>
            <Text style={[styles.tableCell, { flex: 1.2, color: COLORS.textPrimary }]}>{m.label}</Text>
            <Text style={[styles.tableCell, { flex: 1 }]}>{anteriorVal}{m.unit}</Text>
            <Text style={[styles.tableCell, { flex: 1 }]}>{actualVal}{m.unit}</Text>
            <View style={[styles.tableCell, { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 4 }]}>
              <Text style={{ color: cambio.color, fontSize: 14 }}>{cambio.arrow}</Text>
              <Text style={{ color: cambio.color, fontSize: 12 }}>
                {cambio.diff !== 0 ? Math.abs(cambio.diff).toFixed(1) : '-'}
              </Text>
            </View>
          </View>
        )
      })}
    </View>
  )
}

function LoadingSkeleton() {
  return (
    <View style={styles.skeletonContainer}>
      {[1, 2, 3, 4].map(i => (
        <View key={i} style={[styles.skeletonCard, { backgroundColor: COLORS.surface }]}>
          <View style={[styles.skeletonLine, { width: '40%', backgroundColor: COLORS.surfaceAlt }]} />
          <View style={[styles.skeletonLine, { width: '60%', backgroundColor: COLORS.surfaceAlt }]} />
          <View style={[styles.skeletonLine, { width: '30%', backgroundColor: COLORS.surfaceAlt }]} />
        </View>
      ))}
    </View>
  )
}

export default function MetricsScreen() {
  const [loading, setLoading] = useState(true)
  const [metricaSeleccionada, setMetricaSeleccionada] = useState('peso')

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 800)
    return () => clearTimeout(timer)
  }, [])

  const metricas = mockMetricas
  const actual = metricas[metricas.length - 1]
  const anterior = metricas.length >= 2 ? metricas[metricas.length - 2] : null

  const chartData = metricas.map(m => ({
    date: m.createdAt,
    value: m[metricaSeleccionada],
  }))

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
    <ScrollView contentContainerStyle={styles.scrollContent}>
      <Text style={styles.title}>Tu evolución</Text>
      <Text style={styles.subtitle}>Hola, {mockUser.nombre}</Text>

      {loading ? (
        <LoadingSkeleton />
      ) : (
        <>
          <Text style={styles.sectionTitle}>Semáforo de salud</Text>
          <View style={styles.semaphoreGrid}>
            <SemaphoreCard label="IMC" value={actual.imc} unit="" tipo="imc" />
            <SemaphoreCard label="Grasa corporal" value={actual.grasaCorporal} unit="%" tipo="grasaCorporal" />
            <SemaphoreCard label="Agua corporal" value={actual.aguaCorporal} unit="%" tipo="aguaCorporal" />
            <SemaphoreCard label="Grasa visceral" value={actual.grasaVisceral} unit="" tipo="grasaVisceral" />
          </View>

          <Text style={styles.sectionTitle}>Evolución</Text>
          <View style={styles.selectorRow}>
            {SELECTOR_OPTS.map(opt => (
              <TouchableOpacity
                key={opt.key}
                style={[styles.selectorBtn, metricaSeleccionada === opt.key && styles.selectorBtnActive]}
                onPress={() => setMetricaSeleccionada(opt.key)}
              >
                <Text style={[styles.selectorBtnText, metricaSeleccionada === opt.key && styles.selectorBtnTextActive]}>
                  {opt.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          <EvolutionChart data={chartData} metricKey={metricaSeleccionada} unit={SELECTOR_OPTS.find(o => o.key === metricaSeleccionada)?.unit || ''} />

          {anterior && (
            <>
              <Text style={styles.sectionTitle}>Vs. semana anterior</Text>
              <ComparisonTable actual={actual} anterior={anterior} />
            </>
          )}
        </>
      )}
    </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  scrollContent: { paddingBottom: 32 },
  title: { fontSize: 24, fontWeight: '700', color: COLORS.textPrimary, marginHorizontal: 16, marginTop: 16 },
  subtitle: { fontSize: 14, color: COLORS.textSecondary, marginHorizontal: 16, marginBottom: 20 },
  sectionTitle: { fontSize: 16, fontWeight: '600', color: COLORS.textPrimary, marginHorizontal: 16, marginTop: 20, marginBottom: 12 },
  
  semaphoreGrid: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 12 },
  semaphoreCard: {
    width: '48%',
    margin: '1%',
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: 16,
    borderLeftWidth: 4,
  },
  semaphoreLabel: { fontSize: 12, color: COLORS.textSecondary, marginBottom: 4 },
  semaphoreValue: { fontSize: 28, fontWeight: '700', color: COLORS.textPrimary, marginBottom: 4 },
  semaphoreStatus: { fontSize: 13, fontWeight: '500' },

  selectorRow: { flexDirection: 'row', marginHorizontal: 16, marginBottom: 12, gap: 8 },
  selectorBtn: { flex: 1, paddingVertical: 10, borderRadius: 8, backgroundColor: COLORS.surface, alignItems: 'center' },
  selectorBtnActive: { backgroundColor: COLORS.accentMuted },
  selectorBtnText: { fontSize: 13, color: COLORS.textSecondary, fontWeight: '500' },
  selectorBtnTextActive: { color: COLORS.textPrimary, fontWeight: '600' },

  chartContainer: { marginHorizontal: 16, backgroundColor: COLORS.surface, borderRadius: 12, padding: 16, alignItems: 'center' },
  chartLastValue: { fontSize: 20, fontWeight: '700', color: COLORS.textPrimary, marginTop: 8 },
  chartEmpty: { fontSize: 14, color: COLORS.textSecondary },

  comparisonTable: { marginHorizontal: 16, borderRadius: 12, overflow: 'hidden' },
  tableHeader: { flexDirection: 'row', backgroundColor: COLORS.accentMuted, paddingVertical: 10, paddingHorizontal: 12 },
  tableHeaderText: { fontSize: 12, fontWeight: '600', color: COLORS.textPrimary, textAlign: 'center' },
  tableRow: { flexDirection: 'row', paddingVertical: 10, paddingHorizontal: 12 },
  tableCell: { fontSize: 13, color: COLORS.textSecondary, textAlign: 'center' },

  skeletonContainer: { paddingHorizontal: 16 },
  skeletonCard: { borderRadius: 12, padding: 16, marginBottom: 12 },
  skeletonLine: { height: 16, borderRadius: 4, marginBottom: 8 },
})