import { useState } from 'react'
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ActivityIndicator } from 'react-native'
import { useLocalSearchParams, useRouter } from 'expo-router'
import api from '../services/api.js'

export default function CrearPasswordScreen() {
  const { token } = useLocalSearchParams()
  const router = useRouter()
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleCrearPassword() {
    const timestamp = new Date().toISOString()
    console.log('=== CREAR PASSWORD (timestamp: ' + timestamp + ') ===')
    console.log('token:', token)
    console.log('password length:', password.length)
    console.log('confirm length:', confirm.length)

    if (!token) {
      console.log('ERROR: No token')
      Alert.alert('Error', 'Token inválido. Solicita un nuevo enlace.')
      return
    }
    if (!password || password.length < 6) {
      console.log('ERROR: password muy corta')
      Alert.alert('Error', 'La contraseña debe tener al menos 6 caracteres.')
      return
    }
    if (password !== confirm) {
      console.log('ERROR: passwords no coinciden')
      Alert.alert('Error', 'Las contraseñas no coinciden.')
      return
    }
    setLoading(true)
    try {
      console.log('Enviando request...')
      const res = await api.post('/auth/activar-cuenta', { token, password })
      console.log('Response:', res.data)

      // Solo mostrar éxito si el backend lo confirma explícitamente
      if (res.data?.success) {
        console.log('=== ÉXITO: redirigiendo al login ===')
        Alert.alert('¡Listo!', 'Contraseña creada exitosamente.')
        router.replace('/')
        return
      }

      // Si success es false o no viene, mostrar el mensaje del backend
      const msg = res.data?.error || 'No se pudo crear la contraseña.'
      console.log('Respuesta sin success:', msg)
      Alert.alert('Error', msg)
    } catch (err) {
      console.log('ERROR catch:', err)
      console.log('err.response:', err.response)
      console.log('err.response?.data:', err.response?.data)
      const msg = err.response?.data?.error || 'No se pudo crear la contraseña.'
      Alert.alert('Error', msg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}>Crea tu contraseña</Text>
        <Text style={styles.subtitle}>Ingresa una contraseña segura para tu cuenta.</Text>

        <Text style={styles.label}>Nueva contraseña</Text>
        <TextInput
          style={styles.input}
          value={password}
          onChangeText={setPassword}
          placeholder="Mínimo 6 caracteres"
          secureTextEntry
        />

        <Text style={styles.label}>Confirmar contraseña</Text>
        <TextInput
          style={styles.input}
          value={confirm}
          onChangeText={setConfirm}
          placeholder="Repite la contraseña"
          secureTextEntry
        />

        <TouchableOpacity style={styles.btnPrimary} onPress={handleCrearPassword} disabled={loading}>
          {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.btnText}>Crear contraseña</Text>}
        </TouchableOpacity>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f3f4f6', justifyContent: 'center', padding: 20 },
  card: { backgroundColor: '#fff', borderRadius: 12, padding: 24, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 8, elevation: 3 },
  title: { fontSize: 22, fontWeight: 'bold', color: '#1f2937', textAlign: 'center' },
  subtitle: { fontSize: 14, color: '#6b7280', textAlign: 'center', marginBottom: 20, marginTop: 8 },
  label: { fontSize: 14, fontWeight: '600', color: '#374151', marginBottom: 6, marginTop: 12 },
  input: { borderWidth: 1, borderColor: '#d1d5db', borderRadius: 8, padding: 12, fontSize: 16, backgroundColor: '#fff' },
  btnPrimary: { backgroundColor: '#2563eb', borderRadius: 8, padding: 14, alignItems: 'center', marginTop: 20 },
  btnText: { color: '#fff', fontSize: 16, fontWeight: '600' },
})