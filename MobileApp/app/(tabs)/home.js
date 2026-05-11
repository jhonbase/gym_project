import { View, Text, StyleSheet, ScrollView } from 'react-native'
import { useAuth } from '../../context/AuthContext.js'

export default function HomeScreen() {
  const { user } = useAuth()

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.greeting}>Hola, {user?.nombre || 'Usuario'}</Text>
        <Text style={styles.subGreeting}>Bienvenido a UniFit</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Tu actividad reciente</Text>
        <Text style={styles.cardText}>Consultá tus métricas para ver tu evolución.</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Próximas citas</Text>
        <Text style={styles.cardText}>Revisá el calendario para ver tus citas programadas.</Text>
      </View>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0B0B0B' },
  header: { backgroundColor: '#0B0B0B', padding: 24, paddingTop: 40 },
  greeting: { fontSize: 24, fontWeight: '700', color: '#FFFFFF' },
  subGreeting: { fontSize: 14, color: '#888888', marginTop: 4 },
  card: { backgroundColor: '#1A1A1A', borderRadius: 12, padding: 16, margin: 16 },
  cardTitle: { fontSize: 16, fontWeight: '600', color: '#FFFFFF', marginBottom: 8 },
  cardText: { fontSize: 14, color: '#888888' },
})