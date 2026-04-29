// Layout común: Navbar arriba + contenido abajo
import { Outlet } from 'react-router-dom'
import Navbar from './Navbar.jsx'
import Footer from './Footer.jsx'
import { AlertStack } from './AlertMessage.jsx'
import { useAlerts } from '../context/AlertContext.jsx'

function AlertStackWrapper() {
  const { alerts, dismissAlert } = useAlerts()
  return <AlertStack alerts={alerts} onDismiss={dismissAlert} />
}

export default function Layout() {
  return (
    <div className="app-layout">
      <Navbar />
      <main className="app-main">
        <Outlet />
      </main>
      <Footer />
      <AlertStackWrapper />
    </div>
  )
}
