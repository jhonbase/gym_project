import { View, Text, StyleSheet, ScrollView, Dimensions, ActivityIndicator } from 'react-native'
import { useEffect, useState } from 'react'
import Svg, { Path, Line, Text as SvgText } from 'react-native-svg'
import api from '../../services/api.js'
import { useAuth } from '../../context/AuthContext.js'

const { width } = Dimensions.get('window')
const CHART_W = width - 48
const CHART_H = 160
const PADDING = 30

function LineChart({ data, color, label }) {
  if (!data.length) return null
  const vals = data.map(d => d.y)
  const maxY = Math.max(...vals)
  const minY = Math.min(...vals)
  const range = maxY - minY || 1

  const points = data.map((d, i) => {
    const x = PADDING + (i / (data.length - 1 || 1)) * (CHART_W - PADDING * 2)
    const y = PADDING + CHART_H - ((d.y - minY) / range) * (CHART_H - PADDING * 2)
    return `${x},${y}`
  }).join(' ')

  const last = data[data.length - 1]

  return (
    <View style={styles.chartContainer}>
      <Text style={styles.chartLabel}>{label}</Text>
      <Svg width={CHART_W} height={CHART_H + 20}>
        <Line x1={PADDING} y1={PADDING} x2={PADDING} y2={CHART_H} stroke="#3A3A3A" strokeWidth={1} />
        <Line x1={PADDING} y1={CHART_H} x2={CHART_W - PADDING} y2={CHART_H} stroke="#3A3A3A" strokeWidth={1} />
        <Path d={`M${points}`} stroke={color} strokeWidth={2.5} fill="none" />
      </Svg>
      <Text style={styles.lastValue}>{last?.y.toFixed(1)} {label.split('(')[1]?.replace(')', '') || ''}</Text>
    </View>
  )
}

export default function MetricsScreen() {
  const { user } = useAuth()
  const [evaluaciones, setEvaluaciones] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetch() {
      try {
        const res = await api.get(`/users/${user?.id}/metricas`)
        setEvaluaciones(res.data.data.evaluaciones || [])
      } catch {
        setEvaluaciones([])
      } finally {
        setLoading(false)
      }
    }
    if (user?.id) fetch()
  }, [user?.id])

  if (loading) {
    return <View style={styles.center}><ActivityIndicator size="large" color="#E10600" /></View>
  }

  const pesoData = evaluaciones.map((e, i) => ({ x: i, y: e.peso }))
  const grasaData = evaluaciones.map((e, i) => ({ x: i, y: e.grasaCorporal }))
  const imcData = evaluaciones.map((e, i) => ({ x: i, y: e.imc }))

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Tu evolución</Text>

      {evaluaciones.length === 0 ? (
        <View style={styles.emptyCard}>
          <Text style={styles.emptyText}>No hay evaluaciones registradas.</Text>
          <Text style={styles.emptySubtext}>Tu entrenador debe realizar una valoración física.</Text>
        </View>
      ) : (
        <>
          <LineChart data={pesoData} color="#3B82F6" label="Peso (kg)" />
          <LineChart data={grasaData} color="#E10600" label="Grasa (%)" />
          <LineChart data={imcData} color="#10B981" label="IMC" />
        </>
      )}
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0B0B0B' },
  title: { fontSize: 20, fontWeight: '700', color: '#FFFFFF', margin: 16 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#0B0B0B' },
  emptyCard: { backgroundColor: '#1A1A1A', borderRadius: 12, padding: 24, margin: 16, alignItems: 'center' },
  emptyText: { fontSize: 16, fontWeight: '600', color: '#FFFFFF' },
  emptySubtext: { fontSize: 14, color: '#888888', marginTop: 8, textAlign: 'center' },
  chartContainer: { backgroundColor: '#1A1A1A', borderRadius: 12, padding: 16, marginHorizontal: 16, marginBottom: 12, alignItems: 'center' },
  chartLabel: { fontSize: 14, fontWeight: '600', color: '#FFFFFF', marginBottom: 8 },
  lastValue: { fontSize: 18, fontWeight: '700', color: '#FFFFFF', marginTop: 4 },
})