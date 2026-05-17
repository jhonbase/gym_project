import { Stack } from 'expo-router'
import { StatusBar } from 'expo-status-bar'
import { AuthProvider } from '../context/AuthContext.js'

export default function RootLayout() {
  return (
    <AuthProvider>
      <StatusBar style="light" />
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: '#0B0B0B' },
          headerTintColor: '#fff',
          headerTitleStyle: { fontWeight: 'bold' },
        }}
      >
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen name="activate" options={{ title: 'Activar cuenta' }} />
        <Stack.Screen name="crear-password" options={{ title: 'Crear contraseña' }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="profile" options={{ title: 'Perfil', headerShown: false }} />
        <Stack.Screen name="valoraciones" options={{ title: 'Valoraciones', headerShown: false }} />
      </Stack>
    </AuthProvider>
  )
}