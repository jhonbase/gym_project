import { View, Text, StyleSheet, ScrollView, Dimensions, ActivityIndicator, TouchableOpacity } from 'react-native'
import { useEffect, useState, useCallback } from 'react'
import Svg, { Path, Line, Circle, Text as SvgText } from 'react-native-svg'
import { getUserMetrics } from '../../services/api.js'
import { useAuth } from '../../context/AuthContext.js'
import mockMetricas from '../../mocks/metricsMock.js'

const SCREEN_W = Dimensions.get('window').width
const CHART_W = (SCREEN_W * 0.48) - 16
const CHART_H = 130
const PADDING = 24

const METRICAS = [
  { key: 'peso',          label: 'Peso',            unit: 'kg',    color: '#3B82F6' },
  { key: 'grasaCorporal', label: 'Grasa corporal',  unit: '%',     color: '#E10600' },
  { key: 'imc',           label: 'IMC',             unit: '',       color: '#10B981' },
  { key: 'masaMuscular', label: 'Masa muscular',   unit: 'kg',    color: '#F97316' },
  { key: 'masaMagra',     label: 'Masa magra',      unit: 'kg',    color: '#8B5CF6' },
  { key: 'aguaCorporal', label: 'Agua corporal',   unit: '%',     color: '#06B6D4' },
  { key: 'grasaVisceral',label: 'Grasa visceral',  unit: '',      color: '#EAB308' },
  { key: 'edadMetabolica',label: 'Edad metab.',   unit: ' años', color: '#EC4899' },
]

const RANGOS = [
  { key: '7d',  label: 'Semana' },
  { key: '1m',  label: 'Mes' },
  { key: '3m',  label: '3 meses' },
  { key: 'all', label: 'Todo' },
]

function calcFechas(rango) {
  const hoy = new Date()
  if (rango === '7d') return new Date(hoy.setDate(hoy.getDate() - 7))
  if (rango === '1m') return new Date(hoy.setMonth(hoy.getMonth() - 1))
  if (rango === '3m') return new Date(hoy.setMonth(hoy.getMonth() - 3))
  return null
}

function fmtFecha(dateStr) {
  const d = new Date(dateStr)
  return `${d.getDate().toString().padStart(2, '0')}/${(d.getMonth() + 1).toString().padStart(2, '0')}`
}

function LineChart({ data, color, label, unit }) {
  if (!data || data.length === 0) {
    return (
      <View style={styles.chartContainer}>
        <Text style={styles.chartLabel}>{label}</Text>
        <View style={styles.emptyChart}>
          <Text style={styles.emptyChartText}>Sin datos</Text>
        </View>
        <Text style={styles.lastValue}>— {unit}</Text>
      </View>
    )
  }

  const vals = data.map(d => d.value)
  const maxY = Math.max(...vals)
  const minY = Math.min(...vals)
  const range = maxY - minY || 1

  const points = data.map((d, i) => ({
    x: PADDING + (i / (data.length - 1 || 1)) * (CHART_W - PADDING * 2),
    y: PADDING + CHART_H - ((d.value - minY) / range) * (CHART_H - PADDING * 2),
    value: d.value,
    date: d.date,
  }))

  const pathD = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x},${p.y}`).join(' ')

  const step = Math.max(1, Math.floor(data.length / 4))
  const xLabels = points.filter((_, i) => i % step === 0 || i === data.length - 1)
  const last = points[points.length - 1]

  return (
    <View style={styles.chartContainer}>
      <Text style={styles.chartLabel}>{label}</Text>
      <Svg width={CHART_W} height={CHART_H + 20}>
        <Line x1={PADDING} y1={PADDING} x2={PADDING} y2={CHART_H} stroke="#3A3A3A" strokeWidth={1} />
        <Line x1={PADDING} y1={CHART_H} x2={CHART_W - PADDING} y2={CHART_H} stroke="#3A3A3A" strokeWidth={1} />
        {data.length > 1 && <Path d={pathD} stroke={color} strokeWidth={2} fill="none" strokeLinejoin="round" />}
        {points.map((p, i) => (
          <Circle key={i} cx={p.x} cy={p.y} r={i === data.length - 1 ? 5 : 3} fill={i === data.length - 1 ? color : '#3A3A3A'} />
        ))}
        {xLabels.map((p, i) => (
          <SvgText key={`x-${i}`} x={p.x} y={CHART_H + 14} fontSize={8} fill="#666666" textAnchor="middle">
            {fmtFecha(p.date)}
          </SvgText>
        ))}
      </Svg>
      <Text style={styles.lastValue}>
        {last ? `${last.value.toFixed(1)} ${unit}` : `— ${unit}`}
      </Text>
    </View>
  )
}

export default function MetricsScreen() {
  const { user } = useAuth()
  const [metricas, setMetricas] = useState([])
  const [rango, setRango] = useState('3m')
  const [loading, setLoading] = useState(true)

  const fetchData = useCallback(async () => {
    if (!user?.id) return
    setLoading(true)
    try {
      const desde = calcFechas(rango)
      const data = await getUserMetrics(user.id, desde ? desde.toISOString() : null, null)
      const combined = [...mockMetricas, ...data].sort(
        (a, b) => new Date(a.createdAt) - new Date(b.createdAt)
      )
      setMetricas(combined)
    } catch {
      setMetricas(mockMetricas)
    } finally {
      setLoading(false)
    }
  }, [user?.id, rango])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const fechaLabels = metricas.map(m => fmtFecha(m.createdAt))

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.title}>Tu evolución</Text>

        <View style={styles.rangoRow}>
          {RANGOS.map(r => (
            <TouchableOpacity
              key={r.key}
              style={[styles.rangoBtn, rango === r.key && styles.rangoBtnActive]}
              onPress={() => setRango(r.key)}
            >
              <Text style={[styles.rangoBtnText, rango === r.key && styles.rangoBtnTextActive]}>
                {r.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {loading ? (
          <View style={styles.center}><ActivityIndicator size="large" color="#E10600" /></View>
        ) : metricas.length === 0 ? (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyText}>No hay evaluaciones registradas.</Text>
            <Text style={styles.emptySubtext}>Tu entrenador debe realizar una valoración física.</Text>
          </View>
        ) : (
          <>
            <View style={styles.chartGrid}>
              {METRICAS.map(m => {
                const chartData = metricas.map(ev => ({
                  value: ev[m.key] ?? 0,
                  date: ev.createdAt,
                }))
                return (
                  <LineChart
                    key={m.key}
                    data={chartData}
                    color={m.color}
                    label={m.label}
                    unit={m.unit}
                  />
                )
              })}
            </View>

            {metricas.length > 1 && (
              <View style={styles.fechaLabels}>
                <Text style={styles.fechaLabel}>Desde: {fechaLabels[0]}</Text>
                <Text style={styles.fechaLabel}>Hasta: {fechaLabels[fechaLabels.length - 1]}</Text>
              </View>
            )}
          </>
        )}
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0B0B0B' },
  scrollContent: { paddingBottom: 24 },
  title: { fontSize: 20, fontWeight: '700', color: '#FFFFFF', marginHorizontal: 16, marginTop: 16, marginBottom: 12 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingVertical: 60 },
  emptyCard: { backgroundColor: '#1A1A1A', borderRadius: 12, padding: 24, marginHorizontal: 16, alignItems: 'center' },
  emptyText: { fontSize: 16, fontWeight: '600', color: '#FFFFFF' },
  emptySubtext: { fontSize: 14, color: '#888888', marginTop: 8, textAlign: 'center' },
  rangoRow: { flexDirection: 'row', marginHorizontal: 16, marginBottom: 12, gap: 6 },
  rangoBtn: { flex: 1, paddingVertical: 7, borderRadius: 6, borderWidth: 1, borderColor: '#2A2A2A', alignItems: 'center' },
  rangoBtnActive: { backgroundColor: '#E10600', borderColor: '#E10600' },
  rangoBtnText: { fontSize: 11, color: '#888888', fontWeight: '500' },
  rangoBtnTextActive: { color: '#FFFFFF', fontWeight: '600' },
  chartGrid: { flexDirection: 'row', flexWrap: 'wrap', width: '100%', paddingHorizontal: 12 },
  chartContainer: { width: '48%', overflow: 'hidden', margin: '1%', padding: 8, backgroundColor: '#1A1A1A', borderRadius: 10, alignItems: 'center' },
  chartLabel: { fontSize: 12, fontWeight: '600', color: '#FFFFFF', marginBottom: 4, textAlign: 'center' },
  lastValue: { fontSize: 15, fontWeight: '700', color: '#FFFFFF', marginTop: 2 },
  emptyChart: { height: CHART_H, justifyContent: 'center', alignItems: 'center' },
  emptyChartText: { fontSize: 11, color: '#555555' },
  fechaLabels: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 16, marginTop: 10 },
  fechaLabel: { fontSize: 10, color: '#666666' },
})
