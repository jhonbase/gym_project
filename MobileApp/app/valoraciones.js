import { View, Text, StyleSheet, FlatList, ActivityIndicator, RefreshControl, TouchableOpacity } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useRouter } from 'expo-router'
import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext.js'
import { getMyAssessments } from '../services/api.js'
import { useTrainerStatus } from '../hooks/useTrainerStatus.js'
import { STATUS_COLORS, STATUS_LABELS } from '../constants/App.js'
import { Ionicons } from '@expo/vector-icons'

const COLORS = {
  background: '#0B0B0B',
  surface: '#1A1A1A',
  accent: '#E10600',
  textPrimary: '#FFFFFF',
  textSecondary: '#9A9A9A',
  success: '#22c55e',
  border: '#2A2A2A',
}

export default function ValoracionesScreen() {
  const { user } = useAuth()
  const router = useRouter()
  const [assessments, setAssessments] = useState([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  
  const { status: trainerStatus, trainerName, loading: statusLoading, refetch: refetchStatus } = useTrainerStatus()

  async function fetchAssessments() {
    try {
      const data = await getMyAssessments()
      setAssessments(data)
    } catch (err) {
      console.error('Error fetching assessments:', err)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  useEffect(() => {
    fetchAssessments()
  }, [])

  function onRefresh() {
    setRefreshing(true)
    refetchStatus()
    fetchAssessments()
  }

  function getStatusColor() {
    if (!trainerStatus) return '#888888'
    return STATUS_COLORS[trainerStatus] || '#888888'
  }

  function getStatusLabel() {
    if (!trainerStatus) return 'Estado no disponible'
    return STATUS_LABELS[trainerStatus] || trainerStatus
  }

  function getStatusMessage() {
    if (!trainerStatus) return { emoji: '⚫', title: 'Estado no disponible', description: 'No se pudo obtener el estado de tu trainer.' }
    
    switch (trainerStatus) {
      case 'disponible':
        return { emoji: '🟢', title: 'Tu entrenador está disponible', description: 'Puedes acercarte para tu valoración física.' }
      case 'ocupado':
        return { emoji: '🟡', title: 'Tu entrenador está ocupado', description: 'En este momento está atendiendo a otro estudiante.' }
      case 'no_disponible':
        return { emoji: '🔴', title: 'Tu entrenador no está disponible', description: 'Intenta más tarde o contáctalo directamente.' }
      default:
        return { emoji: '⚫', title: getStatusLabel(), description: ' Estado desconocido.' }
    }
  }

  function formatDate(dateString) {
    if (!dateString) return '-'
    const date = new Date(dateString)
    return date.toLocaleDateString('es-CO', { day: 'numeric', month: 'short', year: 'numeric' })
  }

  const renderAssessment = ({ item }) => (
    <View style={styles.assessmentCard}>
      <View style={styles.assessmentHeader}>
        <Text style={styles.assessmentDate}>{formatDate(item.createdAt)}</Text>
        {item.trainer && <Text style={styles.trainerName}>{item.trainer.nombre}</Text>}
      </View>
      
      {item.peso && (
        <View style={styles.metricRow}>
          <Text style={styles.metricLabel}>Peso:</Text>
          <Text style={styles.metricValue}>{item.peso} kg</Text>
        </View>
      )}
      
      {item.altura && (
        <View style={styles.metricRow}>
          <Text style={styles.metricLabel}>Altura:</Text>
          <Text style={styles.metricValue}>{item.altura} cm</Text>
        </View>
      )}
      
      {item.imc && (
        <View style={styles.metricRow}>
          <Text style={styles.metricLabel}>IMC:</Text>
          <Text style={styles.metricValue}>{item.imc}</Text>
        </View>
      )}
      
      {item.grasaCorporal && (
        <View style={styles.metricRow}>
          <Text style={styles.metricLabel}>Grasa corporal:</Text>
          <Text style={styles.metricValue}>{item.grasaCorporal}%</Text>
        </View>
      )}
      
      {item.observaciones && (
        <View style={styles.observationsContainer}>
          <Text style={styles.observationsLabel}>Observaciones:</Text>
          <Text style={styles.observationsText}>{item.observaciones}</Text>
        </View>
      )}
    </View>
  )

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={COLORS.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.title}>Valoraciones</Text>
        <View style={styles.placeholder} />
      </View>

      <FlatList
        data={assessments}
        keyExtractor={(item, index) => item.id?.toString() || index.toString()}
        renderItem={renderAssessment}
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={
          (() => {
            const msg = getStatusMessage()
            return (
              <View style={[styles.statusCard, { borderLeftColor: getStatusColor() }]}>
                <Text style={styles.statusLabel}>Tu trainer</Text>
                {trainerName ? (
                  <>
                    <Text style={styles.trainerTitle}>{trainerName}</Text>
                    <View style={styles.statusMessageRow}>
                      <Text style={styles.statusEmoji}>{msg.emoji}</Text>
                      <View style={styles.statusMessageContent}>
                        <Text style={[styles.statusMessageTitle, { color: getStatusColor() }]}>{msg.title}</Text>
                        <Text style={styles.statusMessageDesc}>{msg.description}</Text>
                      </View>
                    </View>
                  </>
                ) : (
                  <Text style={styles.noTrainerText}>Sin trainer asignado</Text>
                )}
              </View>
            )
          })()
        }
        ListEmptyComponent={
          loading ? (
            <View style={styles.emptyContainer}>
              <ActivityIndicator color={COLORS.accent} size="large" />
            </View>
          ) : (
            <View style={styles.emptyContainer}>
              <Ionicons name="document-text-outline" size={48} color={COLORS.textSecondary} />
              <Text style={styles.emptyTitle}>Sin valoraciones</Text>
              <Text style={styles.emptyText}>
                Tu trainer aún no ha realizado ninguna valoración física.
              </Text>
            </View>
          )
        }
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={COLORS.accent}
            colors={[COLORS.accent]}
          />
        }
      />
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 12 },
  backButton: { padding: 8 },
  title: { fontSize: 20, fontWeight: '700', color: COLORS.textPrimary },
  placeholder: { width: 40 },

  listContent: { paddingHorizontal: 16, paddingBottom: 32 },
  
  statusCard: { backgroundColor: COLORS.surface, borderRadius: 12, padding: 16, marginBottom: 16, borderLeftWidth: 4 },
  statusLabel: { fontSize: 12, color: COLORS.textSecondary, marginBottom: 8 },
  statusRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  statusDot: { width: 10, height: 10, borderRadius: 5 },
  statusName: { fontSize: 18, fontWeight: '600', color: COLORS.textPrimary },
  statusValue: { fontSize: 14, marginTop: 4 },
  trainerTitle: { fontSize: 20, fontWeight: '700', color: COLORS.textPrimary, marginBottom: 12 },
  statusMessageRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 12, marginTop: 8 },
  statusEmoji: { fontSize: 24 },
  statusMessageContent: { flex: 1 },
  statusMessageTitle: { fontSize: 15, fontWeight: '600', marginBottom: 4 },
  statusMessageDesc: { fontSize: 14, color: COLORS.textSecondary, lineHeight: 20 },
  noTrainerText: { fontSize: 14, color: COLORS.textSecondary, marginTop: 8 },

  assessmentCard: { backgroundColor: COLORS.surface, borderRadius: 12, padding: 16, marginBottom: 12 },
  assessmentHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  assessmentDate: { fontSize: 14, fontWeight: '600', color: COLORS.textPrimary },
  trainerName: { fontSize: 12, color: COLORS.textSecondary },

  metricRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 4 },
  metricLabel: { fontSize: 14, color: COLORS.textSecondary },
  metricValue: { fontSize: 14, color: COLORS.textPrimary, fontWeight: '500' },

  observationsContainer: { marginTop: 12, paddingTop: 12, borderTopWidth: 1, borderTopColor: COLORS.border },
  observationsLabel: { fontSize: 12, color: COLORS.textSecondary, marginBottom: 4 },
  observationsText: { fontSize: 14, color: COLORS.textPrimary, lineHeight: 20 },

  emptyContainer: { alignItems: 'center', paddingVertical: 48 },
  emptyTitle: { fontSize: 18, fontWeight: '600', color: COLORS.textPrimary, marginTop: 16 },
  emptyText: { fontSize: 14, color: COLORS.textSecondary, textAlign: 'center', marginTop: 8, paddingHorizontal: 32 },
})