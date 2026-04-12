import multer from 'multer'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, '../../uploads/certificados'))
  },
  filename: function (req, file, cb) {
    const userId = req.params.userId || req.body.userId || 'unknown'
    const timestamp = Date.now()
    const ext = path.extname(file.originalname)
    cb(null, `certificado_eps_${userId}_${timestamp}${ext}`)
  }
})

const fileFilter = (req, file, cb) => {
  if (file.mimetype === 'application/pdf') {
    cb(null, true)
  } else {
    cb(new Error('Solo se permiten archivos PDF'), false)
  }
}

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024
  }
})

export default upload