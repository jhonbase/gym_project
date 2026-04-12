import multer from 'multer'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const lesionStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, '../../uploads/lesiones'))
  },
  filename: function (req, file, cb) {
    const assessmentId = req.params.assessmentId || 'unknown'
    const timestamp = Date.now()
    const ext = path.extname(file.originalname)
    cb(null, `lesion_${assessmentId}_${timestamp}${ext}`)
  }
})

const lesionFileFilter = (req, file, cb) => {
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

const uploadLesion = multer({
  storage: lesionStorage,
  fileFilter: lesionFileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024
  }
})

export default uploadLesion