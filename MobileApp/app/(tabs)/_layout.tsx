import { Tabs } from 'expo-router'
import { useEffect } from 'react'
import { useRouter } from 'expo-router'
import { useAuth } from '../../context/AuthContext.js'

function RedirectToLogin() {
  const { user, loading } = useAuth()
  const router = useRouter()
  useEffect(() => {
    if (!loading && !user) {
      router.replace('/')
    }
  }, [user, loading])
  return null
}

export default function TabsLayout() {
  return (
    <>
      <RedirectToLogin />
      <Tabs>
        <Tabs.Screen name="home" options={{ title: 'Inicio' }} />
        <Tabs.Screen name="metrics" options={{ title: 'Métricas' }} />
        <Tabs.Screen name="calendar" options={{ title: 'Calendario' }} />
        <Tabs.Screen name="profile" options={{ title: 'Perfil' }} />
      </Tabs>
    </>
  )
}