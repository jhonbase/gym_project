import { View, Text, StyleSheet, ScrollView, ActivityIndicator, TouchableOpacity } from 'react-native'
import { useEffect, useState } from 'react'
import { getMyTrainingPlan } from '../../services/api.js'
import { useAuth } from '../../context/AuthContext.js'

const COLORS = {
  background: '#0B0B0B',
  surface: '#1A1A1A',
  surfaceAlt: '#242424',
  accent: '#E10600',
  accentMuted: '#7C0400',
  textPrimary: '#FFFFFF',
  textSecondary: '#9A9A9A',
  success: '#22c55e',
  warning: '#f97316',
  border: '#2A2A2A',
}

function DaySelector({ dias, selectedDia, onSelect }) {
  return (
    <View style={styles.daysContainer}>
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
    </View>
  )
}

function ExerciseCard({ ejercicio }) {
  return (
    <View style={styles.exerciseCard}>
      <View style={styles.exerciseHeader}>
        <Text style={styles.exerciseGroup}>{ejercicio.grupo}</Text>
      </View>
      <Text style={styles.exerciseName}>{ejercicio.nombre}</Text>
      <View style={styles.exerciseDetails}>
        <View style={styles.exerciseDetail}>
          <Text style={styles.exerciseDetailLabel}>Series</Text>
          <Text style={styles.exerciseDetailValue}>{ejercicio.series}</Text>
        </View>
        <View style={styles.exerciseDetail}>
          <Text style={styles.exerciseDetailLabel}>Reps</Text>
          <Text style={styles.exerciseDetailValue}>{ejercicio.reps}</Text>
        </View>
        <View style={styles.exerciseDetail}>
          <Text style={styles.exerciseDetailLabel}>Descanso</Text>
          <Text style={styles.exerciseDetailValue}>{ejercicio.descanso}s</Text>
        </View>
      </View>
    </View>
  )
}

function MetaBadge({ label, value, color }) {
  return (
    <View style={[styles.metaBadge, { borderColor: color }]}>
      <Text style={[styles.metaLabel, { color }]}>{label}</Text>
      <Text style={styles.metaValue}>{value}</Text>
    </View>
  )
}

export default function TrainingPlanScreen() {
  const { user } = useAuth()
  const [loading, setLoading] = useState(true)
  const [plan, setPlan] = useState(null)
  const [error, setError] = useState(null)
  const [selectedDia, setSelectedDia] = useState(null)

  useEffect(() => {
    fetchPlan()
  }, [])

  async function fetchPlan() {
    try {
      setLoading(true)
      const data = await getMyTrainingPlan()
      setPlan(data)
      if (data?.planEntrenamiento?.dias?.length > 0) {
        setSelectedDia(data.planEntrenamiento.dias[0].dia)
      }
    } catch (err) {
      console.error('Error fetching plan:', err)
      setError(err.response?.data?.message || 'No se pudo cargar el plan')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={COLORS.accent} />
        <Text style={styles.loadingText}>Cargando tu plan...</Text>
      </View>
    )
  }

  if (error || !plan) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Tu Plan</Text>
          <Text style={styles.subtitle}>Hola, {user?.nombre || 'Usuario'}</Text>
        </View>
        <View style={styles.emptyCard}>
          <Text style={styles.emptyIcon}>📋</Text>
          <Text style={styles.emptyTitle}>Sin plan disponible</Text>
          <Text style={styles.emptyText}>
            {error || 'Contacta a tu trainer para obtener tu plan de entrenamiento.'}
          </Text>
        </View>
      </View>
    )
  }

  const { planEntrenamiento, valoracionFecha, objetivo } = plan
  const dias = planEntrenamiento.dias || []
  const selectedDayData = dias.find(d => d.dia === selectedDia) || dias[0]

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
      <View style={styles.header}>
        <Text style={styles.title}>Tu Plan</Text>
        <Text style={styles.subtitle}>Hola, {user?.nombre || 'Usuario'}</Text>
      </View>

      <View style={styles.metaContainer}>
        <MetaBadge label="Objetivo" value={planEntrenamiento.objetivo || objetivo || '-'} color={COLORS.warning} />
        <MetaBadge label="Nivel" value={planEntrenamiento.nivel || '-'} color={COLORS.accent} />
        <MetaBadge label="Frecuencia" value={planEntrenamiento.frecuencia || `${dias.length} días`} color={COLORS.success} />
      </View>

      {dias.length > 0 && (
        <>
          <Text style={styles.sectionTitle}>Días de entrenamiento</Text>
          <DaySelector dias={dias} selectedDia={selectedDia} onSelect={setSelectedDia} />

          {selectedDayData && (
            <View style={styles.dayExercises}>
              <Text style={styles.dayTitle}>{selectedDayData.dia}</Text>
              {(selectedDayData.ejercicios || []).map((ej, i) => (
                <ExerciseCard key={i} ejercicio={ej} />
              ))}
            </View>
          )}
        </>
      )}

      {planEntrenamiento.notas && (
        <View style={styles.notesCard}>
          <Text style={styles.notesTitle}>Notas</Text>
          <Text style={styles.notesText}>{planEntrenamiento.notas}</Text>
        </View>
      )}

      {valoracionFecha && (
        <Text style={styles.dateInfo}>
          Plan generado el {new Date(valoracionFecha).toLocaleDateString('es-CO')}
        </Text>
      )}
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  scrollContent: { paddingBottom: 32 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: COLORS.background },
  loadingText: { marginTop: 12, color: COLORS.textSecondary, fontSize: 14 },
  
  header: { padding: 16, paddingTop: 24 },
  title: { fontSize: 24, fontWeight: '700', color: COLORS.textPrimary },
  subtitle: { fontSize: 14, color: COLORS.textSecondary, marginTop: 4 },

  metaContainer: { flexDirection: 'row', paddingHorizontal: 16, gap: 8 },
  metaBadge: { flex: 1, backgroundColor: COLORS.surface, borderRadius: 12, padding: 12, borderLeftWidth: 3, alignItems: 'center' },
  metaLabel: { fontSize: 10, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.05 },
  metaValue: { fontSize: 13, fontWeight: '600', color: COLORS.textPrimary, marginTop: 4, textAlign: 'center' },

  sectionTitle: { fontSize: 16, fontWeight: '600', color: COLORS.textPrimary, marginHorizontal: 16, marginTop: 24, marginBottom: 12 },

  daysContainer: { flexDirection: 'row', paddingHorizontal: 16, gap: 8 },
  dayButton: { flex: 1, paddingVertical: 12, borderRadius: 8, backgroundColor: COLORS.surface, alignItems: 'center' },
  dayButtonActive: { backgroundColor: COLORS.accent },
  dayButtonText: { fontSize: 12, fontWeight: '600', color: COLORS.textSecondary, textTransform: 'uppercase' },
  dayButtonTextActive: { color: COLORS.textPrimary },

  dayExercises: { marginTop: 16, paddingHorizontal: 16 },
  dayTitle: { fontSize: 18, fontWeight: '700', color: COLORS.textPrimary, marginBottom: 12 },

  exerciseCard: { backgroundColor: COLORS.surface, borderRadius: 12, padding: 16, marginBottom: 12 },
  exerciseHeader: { marginBottom: 8 },
  exerciseGroup: { fontSize: 11, fontWeight: '700', color: COLORS.accent, textTransform: 'uppercase', letterSpacing: 0.05 },
  exerciseName: { fontSize: 16, fontWeight: '600', color: COLORS.textPrimary, marginBottom: 12 },
  exerciseDetails: { flexDirection: 'row', gap: 16 },
  exerciseDetail: { alignItems: 'center' },
  exerciseDetailLabel: { fontSize: 10, color: COLORS.textSecondary, textTransform: 'uppercase' },
  exerciseDetailValue: { fontSize: 14, fontWeight: '600', color: COLORS.textPrimary, marginTop: 2 },

  notesCard: { marginHorizontal: 16, marginTop: 24, backgroundColor: COLORS.surface, borderRadius: 12, padding: 16 },
  notesTitle: { fontSize: 14, fontWeight: '700', color: COLORS.textPrimary, marginBottom: 8 },
  notesText: { fontSize: 13, color: COLORS.textSecondary, lineHeight: 20 },

  dateInfo: { fontSize: 11, color: COLORS.textSecondary, textAlign: 'center', marginTop: 16 },

  emptyCard: { backgroundColor: COLORS.surface, borderRadius: 12, padding: 32, margin: 16, alignItems: 'center' },
  emptyIcon: { fontSize: 40, marginBottom: 16 },
  emptyTitle: { fontSize: 18, fontWeight: '700', color: COLORS.textPrimary, marginBottom: 8 },
  emptyText: { fontSize: 14, color: COLORS.textSecondary, textAlign: 'center', lineHeight: 20 },
})