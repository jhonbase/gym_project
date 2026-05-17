import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, RefreshControl, Image } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useRouter } from 'expo-router'
import { useAuth } from '../../context/AuthContext.js'
import { useTrainerStatus } from '../../hooks/useTrainerStatus.js'
import { STATUS_COLORS, STATUS_LABELS } from '../../constants/App.js'
import { Ionicons } from '@expo/vector-icons'

export default function HomeScreen() {
  const { user } = useAuth()
  const router = useRouter()
  const { status: trainerStatus, trainerName, loading: statusLoading, refetch } = useTrainerStatus()

  function getStatusColor() {
    if (!trainerStatus) return '#888888'
    return STATUS_COLORS[trainerStatus] || '#888888'
  }

  function getStatusLabel() {
    if (!trainerStatus) return 'Estado no disponible'
    return STATUS_LABELS[trainerStatus] || trainerStatus
  }

  function getFirstName(nombre) {
    if (!nombre) return 'Usuario'
    const parts = nombre.trim().split(' ')
    return parts[0]
  }

  function getInitials(nombre) {
    if (!nombre) return '?'
    const parts = nombre.trim().split(' ')
    if (parts.length === 1) return parts[0].charAt(0).toUpperCase()
    return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase()
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView 
        refreshControl={
          <RefreshControl
            refreshing={statusLoading}
            onRefresh={refetch}
            tintColor="#E10600"
            colors={['#E10600']}
          />
        }
      >
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Hola, {getFirstName(user?.nombre)}</Text>
            <Text style={styles.subGreeting}>Bienvenido a UniFit</Text>
          </View>
          <TouchableOpacity onPress={() => router.push('/profile')} style={styles.avatarButton}>
            {user?.avatar ? (
              <Image source={{ uri: user.avatar }} style={styles.avatarImage} />
            ) : (
              <View style={styles.avatarPlaceholder}>
                <Text style={styles.avatarText}>{getInitials(user?.nombre)}</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>

      <View style={styles.statusCard}>
        <View style={styles.statusHeader}>
          <Text style={styles.statusLabel}>Tu trainer</Text>
          {statusLoading ? (
            <ActivityIndicator size="small" color="#E10600" />
          ) : (
            <View style={[styles.statusDot, { backgroundColor: getStatusColor() }]} />
          )}
        </View>
        <Text style={styles.statusName}>{trainerName || 'Entrenador'}</Text>
        <Text style={styles.statusValue}>{getStatusLabel()}</Text>
      </View>

      <Text style={styles.sectionTitle}>Tu Plan de Entrenamiento</Text>
      <TouchableOpacity style={styles.ctaCard}>
        <View style={styles.ctaIcon}>
          <Ionicons name="fitness" size={24} color="#FFFFFF" />
        </View>
        <View style={styles.ctaContent}>
          <Text style={styles.ctaTitle}>Ver Plan</Text>
          <Text style={styles.ctaText}>Consulta tu plan de entrenamiento personalizado</Text>
        </View>
        <Ionicons name="chevron-forward" size={20} color="#888888" />
      </TouchableOpacity>

      <Text style={styles.sectionTitle}>Tus Métricas</Text>
      <TouchableOpacity style={styles.ctaCard}>
        <View style={[styles.ctaIcon, { backgroundColor: '#3B82F6' }]}>
          <Ionicons name="bar-chart" size={24} color="#FFFFFF" />
        </View>
        <View style={styles.ctaContent}>
          <Text style={styles.ctaTitle}>Ver Métricas</Text>
          <Text style={styles.ctaText}>Consulta tu evolución física</Text>
        </View>
        <Ionicons name="chevron-forward" size={20} color="#888888" />
      </TouchableOpacity>

      <View style={styles.infoCard}>
        <Ionicons name="information-circle" size={20} color="#888888" />
        <Text style={styles.infoText}>
          ¿Necesitas una valoración física? Contacta a tu trainer para programar una cita.
        </Text>
      </View>
    </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0B0B0B' },
  header: { backgroundColor: '#0B0B0B', padding: 24, paddingTop: 16, paddingBottom: 16, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  greeting: { fontSize: 24, fontWeight: '700', color: '#FFFFFF' },
  subGreeting: { fontSize: 14, color: '#888888', marginTop: 4 },
  avatarButton: { marginLeft: 16, overflow: 'visible' },
  avatarImage: { width: 44, height: 44, borderRadius: 22 },
  avatarPlaceholder: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#E10600', alignItems: 'center', justifyContent: 'center' },
  avatarText: { fontSize: 16, fontWeight: '700', color: '#FFFFFF' },

  statusCard: { backgroundColor: '#1A1A1A', borderRadius: 12, padding: 16, marginHorizontal: 16, marginBottom: 24, borderLeftWidth: 4, borderLeftColor: '#E10600' },
  statusHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  statusLabel: { fontSize: 11, fontWeight: '700', color: '#888888', textTransform: 'uppercase', letterSpacing: 0.05 },
  statusDot: { width: 10, height: 10, borderRadius: 5 },
  statusName: { fontSize: 18, fontWeight: '700', color: '#FFFFFF', marginBottom: 4 },
  statusValue: { fontSize: 14, color: '#888888' },

  sectionTitle: { fontSize: 16, fontWeight: '600', color: '#FFFFFF', marginHorizontal: 16, marginBottom: 12, marginTop: 8 },

  ctaCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#1A1A1A', borderRadius: 12, padding: 16, marginHorizontal: 16, marginBottom: 12 },
  ctaIcon: { width: 48, height: 48, borderRadius: 12, backgroundColor: '#E10600', alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  ctaContent: { flex: 1 },
  ctaTitle: { fontSize: 16, fontWeight: '600', color: '#FFFFFF', marginBottom: 4 },
  ctaText: { fontSize: 13, color: '#888888' },

  infoCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#1A1A1A', borderRadius: 12, padding: 16, marginHorizontal: 16, marginTop: 12, gap: 12 },
  infoText: { flex: 1, fontSize: 13, color: '#888888', lineHeight: 18 },
})