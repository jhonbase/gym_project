// Punto de entrada de React.
// Monta el componente App en el div#root del index.html
import { createRoot } from 'react-dom/client'
import App from './App.jsx'
import './styles/index.css'

createRoot(document.getElementById('root')).render(<App />)