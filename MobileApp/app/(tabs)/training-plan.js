import { View, Text, StyleSheet, ScrollView, ActivityIndicator, TouchableOpacity, RefreshControl } from 'react-native'
import { useEffect, useState } from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import { getMyTrainingPlan } from '../../services/api.js'
import { useAuth } from '../../context/AuthContext.js'

const COLORS = {
  background: '#0a0a0a',
  surface: '#1c1c1e',
  surfaceAlt: '#2a2a2a',
  accent: '#E10600',
  accentMuted: '#7C0400',
  textPrimary: '#FFFFFF',
  textSecondary: '#9A9A9A',
  success: '#22c55e',
  warning: '#f97316',
  border: '#2A2A2A',
  muted: '#666666',
  subtle: '#999999',
  gold: '#F59E0B',
  purple: '#8b5cf6',
  blue: '#3b82f6',
}

function getNivelColor(nivel) {
  if (!nivel) return '#999999'
  const n = nivel.toLowerCase()
  if (n.includes('principiante') || n.includes('básico')) return '#22c55e'
  if (n.includes('intermedio') || n.includes('medio')) return '#3b82f6'
  if (n.includes('avanzado') || n.includes('alto')) return '#E10600'
  return '#3b82f6'
}

function DaySelector({ dias, selectedDia, onSelect }) {
  return (
    <ScrollView 
      horizontal 
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.daysContainer}
    >
      {dias.map((diaObj) => {
        const isSelected = selectedDia === diaObj.dia
        return (
          <TouchableOpacity
            key={diaObj.dia}
            style={[styles.dayButton, isSelected && styles.dayButtonActive]}
            onPress={() => onSelect(diaObj.dia)}
          >
            <Text style={[styles.dayButtonText, isSelected && styles.dayButtonTextActive]}>
              {diaObj.dia.toUpperCase().slice(0, 3)}
            </Text>
          </TouchableOpacity>
        )
      })}
    </ScrollView>
  )
}

function ExerciseRow({ ejercicio }) {
  return (
    <View style={styles.exerciseRow}>
      <Text style={styles.exerciseRowName}>{ejercicio.nombre}</Text>
      <View style={styles.exerciseRowDetails}>
        <View style={styles.exerciseRowDetail}>
          <Text style={styles.exerciseRowLabel}>Series</Text>
          <Text style={styles.exerciseRowValue}>{ejercicio.series}</Text>
        </View>
        <View style={styles.exerciseRowDetail}>
          <Text style={styles.exerciseRowLabel}>Reps</Text>
          <Text style={styles.exerciseRowValue}>{ejercicio.reps}</Text>
        </View>
        <View style={styles.exerciseRowDetail}>
          <Text style={styles.exerciseRowLabel}>Descanso</Text>
          <Text style={styles.exerciseRowValue}>{ejercicio.descanso}s</Text>
        </View>
      </View>
    </View>
  )
}

function MetaBadge({ label, value, labelColor }) {
  return (
    <View style={styles.metaBadge}>
      <Text style={[styles.metaLabel, labelColor ? { color: labelColor } : null]}>{label}</Text>
      <Text style={styles.metaValue}>{value}</Text>
    </View>
  )
}

function groupExercisesByMuscle(ejercicios) {
  const groups = []
  const seen = {}
  if (!ejercicios) return groups
  ejercicios.forEach(ej => {
    const grupo = ej.grupo || 'General'
    if (!seen[grupo]) {
      seen[grupo] = { grupo, ejercicios: [] }
      groups.push(seen[grupo])
    }
    seen[grupo].ejercicios.push(ej)
  })
  return groups
}

export default function TrainingPlanScreen() {
  const { user } = useAuth()
  const [loading, setLoading] = useState(true)
  const [plan, setPlan] = useState(null)
  const [error, setError] = useState(null)
  const [selectedDia, setSelectedDia] = useState(null)
  const [refreshing, setRefreshing] = useState(false)

  useEffect(() => {
    fetchPlan()
  }, [])

  async function fetchPlan() {
    try {
      const data = await getMyTrainingPlan()
      setPlan(data)
      setError(null)
      if (data?.planEntrenamiento?.dias?.length > 0) {
        setSelectedDia(data.planEntrenamiento.dias[0].dia)
      }
    } catch (err) {
      console.error('Error fetching plan:', err)
      setError(err.response?.data?.message || 'No se pudo cargar el plan')
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  const onRefresh = () => {
    setRefreshing(true)
    fetchPlan()
  }

  // Loading state sin refresh (muestra indicador)
  if (loading && !refreshing) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={COLORS.accent} />
        <Text style={styles.loadingText}>Cargando tu plan...</Text>
      </View>
    )
  }

  // Un solo ScrollView envolvente con RefreshControl
  const { aiStatus, planEntrenamiento, rawPlan, valoracionFecha, objetivo, message } = plan || {}
  const dias = planEntrenamiento?.dias || []
  const selectedDayData = dias.find(d => d.dia === selectedDia) || dias[0]

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
    <ScrollView 
      contentContainerStyle={styles.scrollContent}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          tintColor="#E10600"
          colors={['#E10600']}
        />
      }
    >
      <View style={styles.header}>
        <Text style={styles.title}>Tu Plan</Text>
      </View>

      {/* Estado: Error */}
      {error && (
        <View style={styles.emptyCard}>
          <Text style={styles.emptyIcon}>📋</Text>
          <Text style={styles.emptyTitle}>Sin plan disponible</Text>
          <Text style={styles.emptyText}>{error}</Text>
        </View>
      )}

      {/* Estado: rawPlan (legacy) */}
      {rawPlan && !error && (
        <View style={[styles.emptyCard, { backgroundColor: COLORS.surfaceAlt }]}>
          <Text style={styles.emptyIcon}>📝</Text>
          <Text style={styles.emptyTitle}>Plan en formato anterior</Text>
          <Text style={[styles.emptyText, { marginBottom: 12 }]}>
            Tu plan fue generado en un formato antiguo. El trainer puede regenerarlo para verlo estructurado.
          </Text>
          <Text style={[styles.emptyText, { fontSize: 12, fontStyle: 'italic' }]}>{rawPlan.substring(0, 500)}...</Text>
        </View>
      )}

      {/* Estado: Sin plan (PENDING/PARTIAL/FAILED) */}
      {!planEntrenamiento && !rawPlan && !error && (
        <View style={styles.emptyCard}>
          <Text style={styles.emptyIcon}>{aiStatus === 'PENDING' ? '⏳' : '⚠️'}</Text>
          <Text style={styles.emptyTitle}>
            {aiStatus === 'PENDING' ? 'Generando tu plan' : aiStatus === 'PARTIAL' ? 'Plan incompleto' : 'Sin plan disponible'}
          </Text>
          <Text style={styles.emptyText}>
            {message || 'Contacta a tu trainer para obtener tu plan de entrenamiento.'}
          </Text>
        </View>
      )}

      {/* Estado: Plan normal (COMPLETED) */}
      {planEntrenamiento && !error && (
        <>
          <View style={styles.objectiveCard}>
            <Text style={[styles.objectiveLabel, { color: COLORS.gold }]}>OBJETIVO</Text>
            <Text style={styles.objectiveValue}>{planEntrenamiento.objetivo || objetivo || '-'}</Text>
          </View>

          <View style={styles.metaRow}>
            <View style={styles.metaHalf}>
              <MetaBadge 
                label="Nivel" 
                value={planEntrenamiento.nivel || '-'} 
                labelColor={getNivelColor(planEntrenamiento.nivel)} 
              />
            </View>
            <View style={styles.metaHalf}>
              <MetaBadge 
                label="Frecuencia" 
                value={planEntrenamiento.frecuencia || `${dias.length} días`} 
                labelColor={COLORS.purple} 
              />
            </View>
          </View>

          {dias.length > 0 && (
            <>
              <DaySelector dias={dias} selectedDia={selectedDia} onSelect={setSelectedDia} />

              {selectedDayData && (
                <View style={styles.dayExercises}>
                  <Text style={styles.dayTitle}>{selectedDayData.dia}</Text>
                  {groupExercisesByMuscle(selectedDayData.ejercicios).map((group, groupIndex) => (
                    <View key={groupIndex}>
                      <Text style={styles.groupHeader}>{group.grupo.toUpperCase()}</Text>
                      <View style={styles.groupCard}>
                        {group.ejercicios.map((ej, ejIndex) => (
                          <View key={ejIndex}>
                            {ejIndex > 0 && <View style={styles.exerciseDivider} />}
                            <ExerciseRow ejercicio={ej} />
                          </View>
                        ))}
                      </View>
                    </View>
                  ))}
                </View>
              )}
            </>
          )}

          {planEntrenamiento.notas && (
            <View style={styles.notesCard}>
              <View style={styles.notesTitleRow}>
                <Text style={styles.notesIcon}>📋</Text>
                <Text style={styles.notesTitle}>Notas</Text>
              </View>
              <Text style={styles.notesText}>{planEntrenamiento.notas}</Text>
            </View>
          )}

          {valoracionFecha && (
            <Text style={styles.dateInfo}>
              Plan generado el {new Date(valoracionFecha).toLocaleDateString('es-CO')}
            </Text>
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
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: COLORS.background },
  loadingText: { marginTop: 12, color: COLORS.textSecondary, fontSize: 14 },

  header: { padding: 16, paddingTop: 24 },
  title: { fontSize: 24, fontWeight: '700', color: COLORS.textPrimary },

  objectiveCard: { backgroundColor: COLORS.surface, borderRadius: 14, padding: 16, marginHorizontal: 16, marginBottom: 8 },
  objectiveLabel: { fontSize: 11, fontWeight: '600', color: COLORS.muted, textTransform: 'uppercase', letterSpacing: 0.05 },
  objectiveValue: { fontSize: 22, fontWeight: '800', color: COLORS.textPrimary, marginTop: 6 },

  metaRow: { flexDirection: 'row', paddingHorizontal: 16, gap: 8 },
  metaHalf: { flex: 1 },
  metaBadge: { backgroundColor: COLORS.surface, borderRadius: 14, padding: 14, alignItems: 'center' },
  metaLabel: { fontSize: 10, fontWeight: '500', color: COLORS.muted, textTransform: 'uppercase', letterSpacing: 0.05 },
  metaValue: { fontSize: 15, fontWeight: '700', color: COLORS.textPrimary, marginTop: 4, textAlign: 'center' },

  daysContainer: { paddingHorizontal: 16, gap: 8, flexDirection: 'row', justifyContent: 'center', marginTop: 24, marginBottom: 20 },
  dayButton: { paddingVertical: 10, paddingHorizontal: 16, borderRadius: 20, backgroundColor: COLORS.surface, alignItems: 'center' },
  dayButtonActive: { backgroundColor: COLORS.accent, transform: [{ scale: 1.05 }] },
  dayButtonText: { fontSize: 13, fontWeight: '600', color: COLORS.muted, textTransform: 'uppercase' },
  dayButtonTextActive: { color: COLORS.textPrimary },

  dayExercises: { paddingHorizontal: 16 },
  dayTitle: { fontSize: 20, fontWeight: '700', color: COLORS.textPrimary, marginBottom: 8 },

  groupHeader: { fontSize: 12, fontWeight: '700', color: COLORS.subtle, textTransform: 'uppercase', marginBottom: 8, marginTop: 16 },
  groupCard: { backgroundColor: COLORS.surface, borderRadius: 14, overflow: 'hidden' },
  exerciseDivider: { height: 1, backgroundColor: COLORS.surfaceAlt, marginHorizontal: 0 },
  exerciseRow: { padding: 16 },
  exerciseRowName: { fontSize: 16, fontWeight: '700', color: COLORS.textPrimary, marginBottom: 8 },
  exerciseRowDetails: { flexDirection: 'row', justifyContent: 'space-between' },
  exerciseRowDetail: { flex: 1, alignItems: 'center' },
  exerciseRowLabel: { fontSize: 10, fontWeight: '500', color: COLORS.muted, textTransform: 'uppercase', marginBottom: 4 },
  exerciseRowValue: { fontSize: 20, fontWeight: '800', color: COLORS.textPrimary },

  notesCard: { marginHorizontal: 16, marginTop: 20, backgroundColor: COLORS.surface, borderRadius: 14, padding: 16 },
  notesTitleRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  notesIcon: { fontSize: 14, marginRight: 8 },
  notesTitle: { fontSize: 13, fontWeight: '600', color: COLORS.muted, textTransform: 'uppercase' },
  notesText: { fontSize: 14, color: '#cccccc', lineHeight: 22 },

  dateInfo: { fontSize: 12, color: '#444444', textAlign: 'center', marginBottom: 32, marginTop: 16 },

  emptyCard: { backgroundColor: COLORS.surface, borderRadius: 14, padding: 32, margin: 16, alignItems: 'center' },
  emptyIcon: { fontSize: 40, marginBottom: 16 },
  emptyTitle: { fontSize: 18, fontWeight: '700', color: COLORS.textPrimary, marginBottom: 8 },
  emptyText: { fontSize: 14, color: COLORS.textSecondary, textAlign: 'center', lineHeight: 20 },
})