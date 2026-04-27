import multer from 'multer'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const historialStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, '../../uploads/historial'))
  },
  filename: function (req, file, cb) {
    const timestamp = Date.now()
    const ext = path.extname(file.originalname)
    cb(null, `historial_${timestamp}${ext}`)
  }
})

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