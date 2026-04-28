import { createContext, useContext, useState, useCallback } from 'react'

const AlertContext = createContext(null)

export function AlertProvider({ children }) {
  const [alerts, setAlerts] = useState([])

  const addAlert = useCallback((type, message) => {
    const id = Date.now() + Math.random()
    setAlerts(prev => [...prev, { id, type, message }])
  }, [])

  const dismissAlert = useCallback((id) => {
    setAlerts(prev => prev.filter(a => a.id !== id))
  }, [])

  const value = { alerts, addAlert, dismissAlert }

  return (
    <AlertContext.Provider value={value}>
      {children}
    </AlertContext.Provider>
  )
}

export function useAlerts() {
  const context = useContext(AlertContext)
  if (!context) {
    throw new Error('useAlerts must be used within an AlertProvider')
  }
  return context
}

export { AlertContext }