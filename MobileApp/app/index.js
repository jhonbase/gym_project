import { useState } from 'react'
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ActivityIndicator } from 'react-native'
import { useRouter } from 'expo-router'
import api from '../services/api.js'
import { useAuth } from '../context/AuthContext.js'

export default function LoginScreen() {
  const { login } = useAuth()
  const router = useRouter()
  const [mode, setMode] = useState('login')
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({ email: '', password: '' })

  async function handleLogin() {
    if (!form.email || !form.password) {
      Alert.alert('Error', 'Completa todos los campos.')
      return
    }
    setLoading(true)
    try {
      const res = await api.post('/auth/login', { email: form.email, password: form.password })
      login(res.data.data.token, res.data.data.user)
      router.replace('/(tabs)/home')
    } catch (err) {
      // Error de red (CORS, timeout, servidor caído)
      if (!err.response) {
        Alert.alert('Error', 'Sin conexión al servidor. Verifica tu conexión.')
        return
      }

      // Error del backend con código de estado
      const status = err.response.status
      const msg = err.response.data?.error

      if (status === 400) {
        Alert.alert('Solicitud inválida', msg || 'Verifica los datos ingresados.')
      } else if (status === 401) {
        Alert.alert('Credenciales incorrectas', 'Email o contraseña inválidos.')
      } else if (status === 403) {
        Alert.alert('Acceso denegado', msg || 'No tienes permiso.')
      } else {
        Alert.alert('Error', msg || 'Error al iniciar sesión.')
      }
    } finally {
      setLoading(false)
    }
  }

  async function handleRequestActivation() {
    if (!form.email) {
      Alert.alert('Error', 'Ingresa tu correo electrónico.')
      return
    }
    setLoading(true)
    try {
      await api.post('/auth/solicitar-activacion', { email: form.email })
      Alert.alert('Correo enviado', 'Revisa tu bandeja de entrada para activar tu cuenta.')
      setMode('login')
    } catch (err) {
      // Error de red
      if (!err.response) {
        Alert.alert('Error', 'Sin conexión al servidor. Verifica tu conexión.')
        return
      }

      const status = err.response.status
      const msg = err.response.data?.error

      if (status === 400 && msg?.includes('ya está activada')) {
        Alert.alert('Cuenta ya activada', 'Esta cuenta ya tiene una contraseña. Usa tu contraseña para iniciar sesión.')
      } else if (status === 404) {
        Alert.alert('Usuario no encontrado', 'No existe una cuenta con este email.')
      } else if (status === 400) {
        Alert.alert('Error', msg || 'Verifica los datos ingresados.')
      } else {
        Alert.alert('Error', msg || 'No se pudo enviar el correo.')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.logo}>UniFit</Text>
        <Text style={styles.subtitle}>Sistema de valoración física</Text>

        <Text style={styles.label}>Correo electrónico</Text>
        <TextInput
          style={styles.input}
          value={form.email}
          onChangeText={text => setForm({ ...form, email: text })}
          placeholder="correo@ejemplo.com"
          keyboardType="email-address"
          autoCapitalize="none"
        />

        {mode === 'login' && (
          <>
            <Text style={styles.label}>Contraseña</Text>
            <TextInput
              style={styles.input}
              value={form.password}
              onChangeText={text => setForm({ ...form, password: text })}
              placeholder="••••••••"
              secureTextEntry
            />
          </>
        )}

        {mode === 'login' ? (
          <TouchableOpacity style={styles.btnPrimary} onPress={handleLogin} disabled={loading}>
            {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.btnText}>Ingresar</Text>}
          </TouchableOpacity>
        ) : (
          <TouchableOpacity style={styles.btnPrimary} onPress={handleRequestActivation} disabled={loading}>
            {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.btnText}>Enviar enlace</Text>}
          </TouchableOpacity>
        )}

        <TouchableOpacity onPress={() => setMode(mode === 'login' ? 'activate' : 'login')}>
          <Text style={styles.linkText}>
            {mode === 'login' ? '¿Primera vez? Crea tu contraseña' : '¿Ya tienes cuenta? Inicia sesión'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0B0B0B', justifyContent: 'center', paddingHorizontal: 20 },
  card: { backgroundColor: '#1A1A1A', borderRadius: 12, padding: 24 },
  logo: { fontSize: 32, fontWeight: '700', color: '#E10600', textAlign: 'center' },
  subtitle: { fontSize: 14, color: '#888888', textAlign: 'center', marginBottom: 24 },
  label: { fontSize: 14, fontWeight: '600', color: '#FFFFFF', marginBottom: 6, marginTop: 12 },
  input: { borderWidth: 1, borderColor: '#3A3A3A', borderRadius: 8, padding: 12, fontSize: 16, backgroundColor: '#2A2A2A', color: '#FFFFFF' },
  btnPrimary: { backgroundColor: '#E10600', borderRadius: 8, padding: 14, alignItems: 'center', marginTop: 20 },
  btnText: { color: '#FFFFFF', fontSize: 16, fontWeight: '600' },
  linkText: { color: '#E10600', textAlign: 'center', marginTop: 16, fontSize: 14 },
})