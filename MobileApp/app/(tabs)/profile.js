import { useState } from 'react'
import { View, Text, TouchableOpacity, StyleSheet, Modal, Pressable } from 'react-native'
import { useAuth } from '../../context/AuthContext.js'
import { useRouter } from 'expo-router'

export default function ProfileScreen() {
  const { user, logout } = useAuth()
  const router = useRouter()
  const [showConfirm, setShowConfirm] = useState(false)

  function handleLogout() {
    setShowConfirm(true)
  }

  async function confirmLogout() {
    await logout()
    router.replace('/')
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

      <Modal
        visible={showConfirm}
        transparent
        animationType="fade"
        onRequestClose={() => setShowConfirm(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>¿Deseas cerrar sesión?</Text>
            <Text style={styles.modalText}>¿Estás seguro?</Text>
            <View style={styles.modalButtons}>
              <Pressable style={styles.modalCancelBtn} onPress={() => setShowConfirm(false)}>
                <Text style={styles.modalCancelText}>Cancelar</Text>
              </Pressable>
              <Pressable style={styles.modalLogoutBtn} onPress={confirmLogout}>
                <Text style={styles.modalLogoutText}>Aceptar</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0B0B0B', alignItems: 'center', paddingTop: 40 },
  avatar: { width: 80, height: 80, borderRadius: 40, backgroundColor: '#1A1A1A', borderColor: '#E10600', borderWidth: 2, justifyContent: 'center', alignItems: 'center' },
  avatarText: { color: '#FFFFFF', fontSize: 32, fontWeight: '700' },
  name: { fontSize: 22, fontWeight: '700', color: '#FFFFFF', marginTop: 16 },
  role: { fontSize: 14, color: '#888888', marginTop: 4 },
  logoutBtn: { backgroundColor: 'transparent', borderColor: '#E10600', borderWidth: 1, borderRadius: 8, paddingHorizontal: 32, paddingVertical: 12, marginTop: 40 },
  logoutText: { color: '#E10600', fontSize: 16, fontWeight: '600' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', alignItems: 'center' },
  modalContent: { backgroundColor: '#1A1A1A', borderRadius: 12, padding: 24, width: '80%', alignItems: 'center' },
  modalTitle: { fontSize: 20, fontWeight: '700', color: '#FFFFFF', marginBottom: 8 },
  modalText: { fontSize: 16, color: '#888888', marginBottom: 24 },
  modalButtons: { flexDirection: 'row', justifyContent: 'space-between' },
  modalCancelBtn: { flex: 1, minWidth: 100, paddingVertical: 12, paddingHorizontal: 24, alignItems: 'center', borderRadius: 8 },
  modalCancelText: { color: '#888888', fontSize: 16, fontWeight: '600' },
  modalLogoutBtn: { flex: 1, minWidth: 100, paddingVertical: 12, paddingHorizontal: 24, alignItems: 'center', backgroundColor: '#E10600', borderRadius: 8 },
  modalLogoutText: { color: '#FFFFFF', fontSize: 16, fontWeight: '600' },
})