/**
 * AuthContext — Maneja la sesión del usuario logueado.
 *
 * CAMBIO DE SEGURIDAD:
 * Antes: se guardaba el objeto user completo (con datos médicos, EPS, grupo
 *        sanguíneo, etc.) en localStorage — visible para cualquier script XSS.
 * Ahora: solo se guarda el JWT en localStorage. El payload del token contiene
 *        únicamente { sub (id), nombre } — los datos mínimos necesarios.
 *        Para decodificar el payload sin librerías usamos atob() sobre la
 *        parte central del JWT (formato: header.payload.signature).
 */
import { createContext, useState, useEffect } from 'react'

export const AuthContext = createContext(null)

// Decodifica el payload de un JWT sin verificar la firma (solo para UI)
// Soporta texto UTF-8 para nombres con acentos.
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
  const [user, setUser]     = useState(null)   // { id, nombre }
  const [loading, setLoading] = useState(true)

  // Al cargar la app, revisamos si ya había sesión guardada
  useEffect(() => {
    const token = localStorage.getItem('gym_token')
    if (token) {
      const payload = decodeToken(token)
      if (payload && payload.exp * 1000 > Date.now()) {
        // Token presente y no expirado → restaurar sesión
        setUser({ id: payload.sub, nombre: payload.nombre, rol: payload.rol })
      } else {
        // Token expirado → limpiar
        localStorage.removeItem('gym_token')
      }
    }
    setLoading(false)
  }, [])

  /**
   * login(token, userData) — recibe el JWT devuelto por /api/auth/login
   * o /api/fingerprint/login y extrae los datos del payload para el estado.
   */
  function login(token, userData = null) {
    localStorage.setItem('gym_token', token)
    const payload = decodeToken(token)
    setUser({ 
      id: payload.sub, 
      nombre: payload.nombre, 
      rol: payload.rol,
      ...userData
    })
  }

  function logout() {
    setUser(null)
    localStorage.removeItem('gym_token')
    // NO borramos la huella — el "dedo" sigue registrado en el dispositivo
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}
