import axios from 'axios'
import config from '../config/environment.js'

// Creamos una instancia de axios pre-configurada con la URL del servicio C#.
// El timeout de 3 segundos evita que el backend se quede esperando
// si el servicio C# está caído.
const csharpClient = axios.create({
  baseURL: config.csharpUrl,
  timeout: 3000,
})

/**
 * Solicita al servicio C# que capture una huella.
 * En simulación: genera un template aleatorio.
 * Con lector real: el C# llamará al SDK del hardware.
 */
async function captureFingerprint() {
  const response = await csharpClient.post('/api/capture', {})
  return {
    template: response.data.template,
    quality: response.data.quality,
  }
}

/**
 * Solicita al servicio C# que mute un template.
 * SOLO se usa en simulación. Con lector real este método se ELIMINA.
 */
async function mutateFingerprint(template) {
  const response = await csharpClient.post('/api/mutate', { template })
  return response.data.mutatedFull
}

/**
 * Verifica que el servicio C# esté corriendo.
 */
async function healthCheck() {
  const response = await csharpClient.get('/health')
  return response.data
}

export { captureFingerprint, mutateFingerprint, healthCheck }
