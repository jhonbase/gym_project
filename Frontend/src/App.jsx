// App.jsx - Componente principal
// Configura las rutas y envuelve todo con el AuthProvider
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext.jsx'
import ProtectedRoute from './components/ProtectedRoute.jsx'
import Layout from './components/Layout.jsx'
import LoginPage from './pages/LoginPage.jsx'
import RegisterPage from './pages/RegisterPage.jsx'
import DashboardPage from './pages/DashboardPage.jsx'
import AssessmentFormPage from './pages/AssessmentFormPage.jsx'
import AssessmentResultPage from './pages/AssessmentResultPage.jsx'
import AssessmentEditPage from './pages/AssessmentEditPage.jsx'

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Rutas públicas (sin login) */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          {/* Rutas protegidas (requieren login con huella) */}
          <Route element={<ProtectedRoute />}>
            <Route element={<Layout />}>
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/assessment/new" element={<AssessmentFormPage />} />
              <Route path="/assessment/:id" element={<AssessmentResultPage />} />
              <Route path="/assessment/:id/edit" element={<AssessmentEditPage />} />
            </Route>
          </Route>

          {/* Cualquier otra ruta → redirige al login */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}