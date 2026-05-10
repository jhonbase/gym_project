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

  const enlace = `${config.frontendUrl}/activar-cuenta?token=${token}`

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto; padding: 20px;">
      <h2 style="color: #2563eb;">¡Activa tu cuenta UniFit!</h2>
      <p>Hola <strong>${nombre}</strong>,</p>
      <p>Se ha creado tu cuenta en el sistema de valoración física universitaria.</p>
      <p>Para activar tu cuenta, haz clic en el siguiente botón:</p>
      <div style="text-align: center; margin: 30px 0;">
        <a href="${enlace}" style="background-color: #2563eb; color: white; padding: 14px 28px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">Activar cuenta</a>
      </div>
      <p style="font-size: 14px; color: #666;">O copia y pega este enlace en tu navegador:</p>
      <p style="font-size: 12px; color: #888; word-break: break-all;">${enlace}</p>
      <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
      <p style="font-size: 12px; color: #999;">Este enlace expira en 1 hora. Si no solicitaste este correo, ignóralo.</p>
    </div>
  `

  await transporter.sendMail({
    from: `"UniFit - Valoración Física" <${config.gmailUser}>`,
    to: email,
    subject: 'Activa tu cuenta UniFit',
    html,
  })
}

export { enviarCorreoActivacion }