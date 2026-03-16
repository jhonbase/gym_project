/**
 * Netlify Function — wrapper serverless para Express.
 *
 * En desarrollo local: el backend corre con `node src/server.js` (app.listen).
 * En Netlify: este archivo envuelve la misma app de Express con serverless-http,
 * permitiendo que corra como una Lambda function sin cambiar nada en la lógica.
 *
 * Flujo de una petición en Netlify:
 *   Navegador → /api/users
 *   → netlify.toml redirect → /.netlify/functions/api/users
 *   → este handler recibe el evento de Lambda
 *   → serverless-http convierte el evento a req/res de Express
 *   → Express procesa normalmente (rutas, middlewares, Prisma, JWT, etc.)
 *   → respuesta JSON de vuelta al navegador
 */
import serverless from 'serverless-http'
import app from '../../src/app.js'

export const handler = serverless(app)
