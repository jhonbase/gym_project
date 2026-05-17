import { v2 as cloudinary } from 'cloudinary'
import { createCloudinaryStorage as cloudinaryStorageFn } from 'multer-storage-cloudinary'
import config from '../config/environment.js'

// NOTA: Cloudinary se usa como proveedor de almacenamiento para ambiente
// de desarrollo y pruebas. Para producción real se recomienda migrar a
// AWS S3, Google Cloud Storage o Azure Blob Storage con políticas de
// acceso privado, en cumplimiento con la Ley 1581 de 2012 (Habeas Data)
// y normativas de protección de datos de salud.
// El cambio de proveedor solo requiere modificar storage.service.js
// y las variables de entorno correspondientes.

// NOTE: Cloudinary credentials are loaded from environment variables.
// For Netlify deployment, set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET

cloudinary.config({
  cloud_name: config.cloudinaryCloudName,
  api_key: config.cloudinaryApiKey,
  api_secret: config.cloudinaryApiSecret,
})

/**
 * Crea una configuración de almacenamiento en Cloudinary.
 * @param {string} folder - Nombre de la carpeta en Cloudinary
 * @returns {multer.StorageCloudinary} Instancia de almacenamiento
 */
export function createCloudinaryStorage(folder) {
  return cloudinaryStorageFn({
    cloudinary: cloudinary,
    params: {
      folder: `unifit/${folder}`,
      allowed_formats: ['jpg', 'jpeg', 'png', 'webp', 'pdf'],
      transformation: [{ width: 800, height: 800, crop: 'limit' }],
    },
  })
}

/**
 * Elimina un archivo de Cloudinary.
 * @param {string} publicId - ID público del archivo en Cloudinary
 * @returns {Promise} Resultado de la eliminación
 */
export async function deleteFile(publicId) {
  return cloudinary.uploader.destroy(publicId)
}

export default cloudinary