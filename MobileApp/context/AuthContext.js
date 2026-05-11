import { createContext, useState, useEffect, useContext } from 'react'
import AsyncStorage from '@react-native-async-storage/async-storage'

const AuthContext = createContext(null)

function decodeToken(token) {
  try {
    const payload = token.split('.')[1]
    const base64 = payload.replace(/-/g, '+').replace(/_/g, '/')
    const binary = atob(base64)
    const bytes = Uint8Array.from(binary, char => char.charCodeAt(0))
    return JSON.parse(new TextDecoder().decode(bytes))
  } catch {
    return null
  }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadToken() {
      const token = await AsyncStorage.getItem('gym_token')
      if (token) {
        const payload = decodeToken(token)
        if (payload && payload.exp * 1000 > Date.now()) {
          setUser({ id: payload.sub, nombre: payload.nombre, rol: payload.rol })
        } else {
          await AsyncStorage.removeItem('gym_token')
        }
      }
      setLoading(false)
    }
    loadToken()
  }, [])

  async function login(token, userData = null) {
    await AsyncStorage.setItem('gym_token', token)
    const payload = decodeToken(token)
    setUser({ id: payload.sub, nombre: payload.nombre, rol: payload.rol, ...userData })
  }

  async function logout() {
    setUser(null)
    await AsyncStorage.removeItem('gym_token')
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}

export default AuthContext