// AuthContext - Maneja quién está logueado
// createContext crea un "canal" para compartir datos entre componentes
// sin tener que pasar props manualmente de padre a hijo a nieto.
import { createContext, useState, useEffect } from 'react'

export const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  // Al cargar la app, revisamos si ya había sesión guardada
  useEffect(() => {
    const saved = localStorage.getItem('gym_current_user')
    if (saved) setUser(JSON.parse(saved))
    setLoading(false)
  }, [])

  function login(userData) {
    setUser(userData)
    localStorage.setItem('gym_current_user', JSON.stringify(userData))
  }

  function logout() {
    setUser(null)
    localStorage.removeItem('gym_current_user')
    // NO borramos la huella - el "dedo" sigue en el dispositivo
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}