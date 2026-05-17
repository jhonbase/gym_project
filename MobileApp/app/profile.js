import { View, Text, StyleSheet, TouchableOpacity, Image, ActivityIndicator, Alert } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useRouter } from 'expo-router'
import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext.js'
import { uploadAvatar, getMe } from '../services/api.js'
import * as ImagePicker from 'expo-image-picker'
import { Ionicons } from '@expo/vector-icons'

const COLORS = {
  background: '#0B0B0B',
  surface: '#1A1A1A',
  accent: '#E10600',
  textPrimary: '#FFFFFF',
  textSecondary: '#9A9A9A',
  border: '#2A2A2A',
}

export default function ProfileScreen() {
  const { user, updateUser } = useAuth()
  const router = useRouter()
  const [uploading, setUploading] = useState(false)
  const [userData, setUserData] = useState(null)

  useEffect(() => {
    async function fetchUserData() {
      try {
        const data = await getMe()
        setUserData(data)
      } catch (err) {
        console.error('Error fetching user data:', err)
      }
    }
    fetchUserData()
  }, [])

  const displayUser = userData 
    ? { ...userData, avatar: user?.avatar || userData.avatar } 
    : { ...user, email: user?.email || 'No disponible', telefono: user?.telefono || 'No disponible' }

  function getInitials(nombre) {
    if (!nombre) return '?'
    const parts = nombre.trim().split(/\s+/)
    if (parts.length === 1) return parts[0].charAt(0).toUpperCase()
    return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase()
  }

  async function pickImage() {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync()
    if (status !== 'granted') {
      Alert.alert('Permiso requerido', 'Se necesita acceso a la galería para cambiar tu foto de perfil.')
      return
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    })

    if (!result.canceled && result.assets[0]) {
      setUploading(true)
      try {
        const updatedUser = await uploadAvatar(result.assets[0].uri)
        updateUser({ avatar: updatedUser.avatar })
        Alert.alert('Éxito', 'Tu foto de perfil ha sido actualizada.')
      } catch (err) {
        Alert.alert('Error', 'No se pudo subir la imagen. Intenta de nuevo.')
      } finally {
        setUploading(false)
      }
    }
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={COLORS.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.title}>Perfil</Text>
        <View style={styles.placeholder} />
      </View>

      <View style={styles.content}>
        <View style={styles.avatarSection}>
          <TouchableOpacity onPress={pickImage} disabled={uploading} style={styles.avatarContainer}>
            {uploading ? (
              <View style={styles.avatarPlaceholder}>
                <ActivityIndicator color={COLORS.textPrimary} />
              </View>
            ) : user?.avatar ? (
              <Image source={{ uri: user.avatar }} style={styles.avatarImage} />
            ) : (
              <View style={styles.avatarPlaceholder}>
                <Text style={styles.avatarText}>{getInitials(user?.nombre)}</Text>
              </View>
            )}
            <View style={styles.editBadge}>
              <Ionicons name="camera" size={16} color={COLORS.textPrimary} />
            </View>
          </TouchableOpacity>
          <Text style={styles.avatarHint}>Toca para cambiar tu foto</Text>
        </View>

        <View style={styles.infoSection}>
          <View style={styles.infoCard}>
            <Text style={styles.infoLabel}>Nombre</Text>
            <Text style={styles.infoValue}>{user?.nombre || 'No disponible'}</Text>
          </View>
          
          <View style={styles.infoCard}>
            <Text style={styles.infoLabel}>Email</Text>
            <Text style={styles.infoValue}>{displayUser?.email || 'No disponible'}</Text>
          </View>

          <View style={styles.infoCard}>
            <Text style={styles.infoLabel}>Teléfono</Text>
            <Text style={styles.infoValue}>{displayUser?.telefono || 'No disponible'}</Text>
          </View>

          <View style={styles.infoCard}>
            <Text style={styles.infoLabel}>Membresía</Text>
            <Text style={styles.infoValue}>{user?.membresia || 'Activa'}</Text>
          </View>
        </View>

        <TouchableOpacity 
          style={styles.actionButton}
          onPress={() => router.push('/valoraciones')}
        >
          <Ionicons name="star-outline" size={20} color={COLORS.textPrimary} />
          <Text style={styles.actionText}>Ver mis valoraciones</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 12 },
  backButton: { padding: 8 },
  title: { fontSize: 20, fontWeight: '700', color: COLORS.textPrimary },
  placeholder: { width: 40 },

  content: { flex: 1, paddingHorizontal: 16 },
  avatarSection: { alignItems: 'center', paddingVertical: 32 },
  avatarContainer: { position: 'relative' },
  avatarImage: { width: 120, height: 120, borderRadius: 60, borderWidth: 3, borderColor: COLORS.accent },
  avatarPlaceholder: { width: 120, height: 120, borderRadius: 60, backgroundColor: COLORS.accent, alignItems: 'center', justifyContent: 'center', borderWidth: 3, borderColor: COLORS.accent },
  avatarText: { fontSize: 40, fontWeight: '700', color: COLORS.textPrimary },
  editBadge: { position: 'absolute', bottom: 4, right: 4, width: 32, height: 32, borderRadius: 16, backgroundColor: COLORS.surface, alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: COLORS.accent },
  avatarHint: { marginTop: 12, fontSize: 13, color: COLORS.textSecondary },

  infoSection: { gap: 12 },
  infoCard: { backgroundColor: COLORS.surface, borderRadius: 12, padding: 16 },
  infoLabel: { fontSize: 12, color: COLORS.textSecondary, marginBottom: 4 },
  infoValue: { fontSize: 16, color: COLORS.textPrimary, fontWeight: '500' },

  actionButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: COLORS.surface, borderRadius: 12, padding: 16, marginTop: 24 },
  actionText: { fontSize: 16, fontWeight: '600', color: COLORS.textPrimary },
})