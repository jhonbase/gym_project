import nodemailer from 'nodemailer'
import config from '../config/environment.js'

async function enviarCorreoActivacion(email, nombre, token) {
  const transporter = nodemailer.createTransport({
    service: 'Gmail',
    auth: {
      user: config.gmailUser,
      pass: config.gmailPassword,
    },
  })

  // Si hay URL de desarrollo configurada, usarla (abre Expo Go desde navegador)
  // Si no, usar deep link scheme (para producción/app nativa)
  const deepLink = config.expoDevWebUrl
    ? `${config.expoDevWebUrl}/crear-password?token=${token}`
    : `${config.expoProdUrl || 'unifit://'}crear-password?token=${token}`
  
const html = `
    <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto; padding: 20px;">
      <h2 style="color: #2563eb;">¡Crea tu contraseña UniFit!</h2>
      <p>Hola <strong>${nombre}</strong>,</p>
      <p>Se ha creado tu cuenta en el sistema de valoración física universitaria.</p>
      <p>Para crear tu contraseña, haz clic en el siguiente botón:</p>
      <div style="text-align: center; margin: 30px 0;">
        <a href="${deepLink}" style="background-color: #2563eb; color: white; padding: 14px 28px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">Crear contraseña</a>
      </div>
      <p style="font-size: 14px; color: #666;">O copia y pega este enlace en tu navegador:</p>
      <p style="font-size: 12px; color: #888; word-break: break-all;">${deepLink}</p>
      <hr style="margin: 20px 0; border: none; border-top: 1px solid #eee;">
      <p style="font-size: 12px; color: #999;">Este enlace expira en 1 hora. Si no solicitaste este correo, ignóralo.</p>
    </div>
  `

  await transporter.sendMail({
    from: `"UniFit - Valoración Física" <${config.gmailUser}>`,
    to: email,
    subject: 'Crea tu contraseña UniFit',
    html,
  })
}

export { enviarCorreoActivacion }
