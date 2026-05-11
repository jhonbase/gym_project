import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native'
import { useAuth } from '../../context/AuthContext.js'
import { useRouter } from 'expo-router'

export default function ProfileScreen() {
  const { user, logout } = useAuth()
  const router = useRouter()

  function handleLogout() {
    Alert.alert('Cerrar sesión', '¿Estás seguro?', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Cerrar', style: 'destructive', onPress: () => { logout(); router.replace('/') } }
    ])
  }

  return (
    <View style={styles.container}>
      <View style={styles.avatar}>
        <Text style={styles.avatarText}>{user?.nombre?.charAt(0) || 'U'}</Text>
      </View>
      <Text style={styles.name}>{user?.nombre || 'Usuario'}</Text>
      <Text style={styles.role}>{user?.rol === 'usuario' ? 'Estudiante' : user?.rol}</Text>

      <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
        <Text style={styles.logoutText}>Cerrar sesión</Text>
      </TouchableOpacity>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f3f4f6', alignItems: 'center', paddingTop: 40 },
  avatar: { width: 80, height: 80, borderRadius: 40, backgroundColor: '#2563eb', justifyContent: 'center', alignItems: 'center' },
  avatarText: { color: '#fff', fontSize: 32, fontWeight: 'bold' },
  name: { fontSize: 22, fontWeight: 'bold', color: '#1f2937', marginTop: 16 },
  role: { fontSize: 14, color: '#6b7280', marginTop: 4 },
  logoutBtn: { backgroundColor: '#ef4444', borderRadius: 8, paddingHorizontal: 32, paddingVertical: 12, marginTop: 40 },
  logoutText: { color: '#fff', fontSize: 16, fontWeight: '600' },
})