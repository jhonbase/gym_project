import multer from 'multer'
import { createCloudinaryStorage } from '../services/storage.service.js'

// NOTA: Cloudinary se usa como proveedor de almacenamiento para ambiente
// de desarrollo y pruebas. Para producción real se recomienda migrar a
// AWS S3, Google Cloud Storage o Azure Blob Storage con políticas de
// acceso privado, en cumplimiento con la Ley 1581 de 2012 (Habeas Data)
// y normativas de protección de datos de salud.
// El cambio de proveedor solo requiere modificar storage.service.js
// y las variables de entorno correspondientes.

const historialStorage = createCloudinaryStorage('historial')

const historialFileFilter = (req, file, cb) => {
  const allowedMimes = [
    'application/pdf',
    'image/jpeg',
    'image/png',
    'image/jpg',
    'image/webp'
  ]
  
  if (allowedMimes.includes(file.mimetype)) {
    cb(null, true)
  } else {
    cb(new Error('Solo se permiten archivos PDF o imágenes (JPEG, PNG, WebP)'), false)
  }
}

const uploadHistorial = multer({
  storage: historialStorage,
  fileFilter: historialFileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024
  }
})

export default uploadHistorial