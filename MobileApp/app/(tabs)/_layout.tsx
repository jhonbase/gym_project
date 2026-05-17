import { Tabs } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
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
      <Tabs
        screenOptions={{
          tabBarStyle: {
            backgroundColor: '#1A1A1A',
            borderTopColor: '#2A2A2A',
            borderTopWidth: 1,
          },
          tabBarActiveTintColor: '#E10600',
          tabBarInactiveTintColor: '#888888',
          headerShown: false,
        }}
      >
        <Tabs.Screen
          name="home"
          options={{
            title: 'Inicio',
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="home" size={size} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="metrics"
          options={{
            title: 'Métricas',
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="bar-chart" size={size} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="training-plan"
          options={{
            title: 'Plan',
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="fitness" size={size} color={color} />
            ),
          }}
        />
      </Tabs>
    </>
  )
}