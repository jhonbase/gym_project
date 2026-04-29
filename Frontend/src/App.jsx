// App.jsx - Componente principal
// Configura las rutas y envuelve todo con el AuthProvider
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext.jsx'
import { AlertProvider } from './context/AlertContext.jsx'
import ProtectedRoute from './components/ProtectedRoute.jsx'
import Layout from './components/Layout.jsx'
import LoginPage from './pages/LoginPage.jsx'
import PrivacyPolicyPage from './pages/PrivacyPolicyPage.jsx'
import DashboardPage from './pages/DashboardPage.jsx'
import StudentsPage from './pages/StudentsPage.jsx'
import StudentProfilePage from './pages/StudentProfilePage.jsx'
import AssessmentFormPage from './pages/AssessmentFormPage.jsx'
import AssessmentResultPage from './pages/AssessmentResultPage.jsx'
import AssessmentEditPage from './pages/AssessmentEditPage.jsx'
import StudentProgressPage from './pages/StudentProgressPage.jsx'

export default function App() {
  return (
    <AlertProvider>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            {/* Rutas públicas (sin login) */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/politica" element={<PrivacyPolicyPage />} />

            {/* Rutas protegidas (requieren login) */}
            <Route element={<ProtectedRoute />}>
              <Route element={<Layout />}>
                <Route path="/dashboard" element={<DashboardPage />} />
                <Route path="/students" element={<StudentsPage />} />
                <Route path="/student/:id" element={<StudentProfilePage />} />
                <Route path="/student/:id/progress" element={<StudentProgressPage />} />
                <Route path="/student/:userId/assessment/new" element={<AssessmentFormPage />} />
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
    </AlertProvider>
  )
}