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
  container: { flex: 1, backgroundColor: '#f3f4f6' },
  header: { backgroundColor: '#2563eb', padding: 24, paddingTop: 40 },
  greeting: { fontSize: 24, fontWeight: 'bold', color: '#fff' },
  subGreeting: { fontSize: 14, color: '#bfdbfe', marginTop: 4 },
  card: { backgroundColor: '#fff', borderRadius: 12, padding: 16, margin: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 2 },
  cardTitle: { fontSize: 16, fontWeight: '600', color: '#1f2937', marginBottom: 8 },
  cardText: { fontSize: 14, color: '#6b7280' },
})