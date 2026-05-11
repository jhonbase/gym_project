import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, RefreshControl } from 'react-native'
import { useEffect, useState, useCallback } from 'react'
import api from '../../services/api.js'

export default function CalendarScreen() {
  const [eventos, setEventos] = useState([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  const fetchCalendar = useCallback(async () => {
    try {
      const res = await api.get('/calendar')
      setEventos(res.data.data.eventos || [])
    } catch {
      setEventos([])
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [])

  useEffect(() => {
    fetchCalendar()
  }, [fetchCalendar])

  const onRefresh = () => {
    setRefreshing(true)
    fetchCalendar()
  }

  if (loading) {
    return <View style={styles.center}><ActivityIndicator size="large" color="#E10600" /></View>
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.titleText}>Calendario global</Text>
        <TouchableOpacity onPress={onRefresh}>
          <Text style={styles.refreshBtn}>Actualizar</Text>
        </TouchableOpacity>
      </View>

      {eventos.length === 0 ? (
        <View style={styles.emptyCard}>
          <Text style={styles.emptyText}>No hay citas programadas.</Text>
        </View>
      ) : (
        <FlatList
          data={eventos}
          keyExtractor={item => item.id}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
          contentContainerStyle={{ padding: 16 }}
          renderItem={({ item }) => (
            <View style={styles.eventCard}>
              <View style={styles.eventDate}>
                <Text style={styles.eventDay}>{new Date(item.fecha).getDate()}</Text>
                <Text style={styles.eventMonth}>
                  {new Date(item.fecha).toLocaleString('es', { month: 'short' })}
                </Text>
              </View>
              <View style={styles.eventInfo}>
                <Text style={styles.eventName}>{item.usuario?.nombre || 'Sin nombre'}</Text>
                <Text style={styles.eventDetail}>Entrenador: {item.entrenador || 'Por asignar'}</Text>
                <Text style={styles.eventDetail}>Estado: {item.estado || 'pendiente'}</Text>
              </View>
            </View>
          )}
        />
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0B0B0B' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#0B0B0B' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, backgroundColor: '#1A1A1A', borderBottomColor: '#2A2A2A', borderBottomWidth: 1 },
  titleText: { fontSize: 18, fontWeight: '700', color: '#FFFFFF' },
  refreshBtn: { color: '#E10600', fontSize: 14, fontWeight: '600' },
  emptyCard: { backgroundColor: '#1A1A1A', borderRadius: 12, padding: 24, margin: 16, alignItems: 'center' },
  emptyText: { fontSize: 16, color: '#888888' },
  eventCard: { flexDirection: 'row', backgroundColor: '#1A1A1A', borderRadius: 12, padding: 16, marginBottom: 12 },
  eventDate: { width: 50, height: 50, borderRadius: 8, backgroundColor: '#E10600', justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  eventDay: { color: '#FFFFFF', fontSize: 20, fontWeight: '700' },
  eventMonth: { color: '#B0B0B0', fontSize: 12, textTransform: 'capitalize' },
  eventInfo: { flex: 1 },
  eventName: { fontSize: 16, fontWeight: '600', color: '#FFFFFF' },
  eventDetail: { fontSize: 13, color: '#888888', marginTop: 2 },
})