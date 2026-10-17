/* Primero de todo: deja constancia en el log de que el proceso arranco */
import './config/arranque.js'

import express from 'express'
import cors from 'cors'
import { config } from './config/entorno.js'
import { verificarConexion } from './config/db.js'
import { almacenamiento, CARPETA_LOCAL } from './config/imagenes.js'
import { noEncontrado, manejadorErrores } from './middleware/errores.js'

import rutasAuth from './routes/auth.js'
import rutasPublicas from './routes/publicas.js'
import rutasAdmin from './routes/admin.js'

const app = express()

/* Render (y cualquier proxy) pone la IP real en X-Forwarded-For; el freno de login la necesita */
app.set('trust proxy', 1)
app.disable('x-powered-by')

/*
 * Solo se aceptan peticiones de los origenes declarados. Las herramientas sin
 * origen (curl, health checks) pasan. Al rechazar se responde 403 explicando
 * donde se corrige, en vez de un 500 que haria pensar que la API se rompio.
 */
app.use(cors({ origin: (origen, cb) => cb(null, !origen || config.origenes.includes(origen)) }))

app.use((req, res, siguiente) => {
	const origen = req.get('Origin')
	/* Las imagenes locales se cargan con <img>, que tambien puede mandar Origin */
	if (!origen || config.origenes.includes(origen) || req.path.startsWith('/uploads/')) return siguiente()

	console.warn(`[cors] Rechazado ${origen}. Permitidos: ${config.origenes.join(', ')}`)
	res.status(403).json({
		error: `El origen ${origen} no esta autorizado. Agregalo a ORIGENES_PERMITIDOS en el .env del servidor.`,
	})
})

app.use(express.json({ limit: '1mb' }))

/* Imagenes subidas en desarrollo (sin Cloudinary). Nombres con UUID: se pueden cachear para siempre */
app.use('/uploads', express.static(CARPETA_LOCAL, { maxAge: '365d', immutable: true, fallthrough: false }))

app.get('/api/salud', (req, res) => res.json({ ok: true, hora: new Date().toISOString() }))

app.use('/api/auth', rutasAuth)
app.use('/api/admin', rutasAdmin)
app.use('/api', rutasPublicas)

app.use(noEncontrado)
app.use(manejadorErrores)

app.listen(config.puerto, async () => {
	console.log(`\n  API Comercializadora Gonzalez en http://localhost:${config.puerto}`)
	console.log(`  Origenes permitidos: ${config.origenes.join(', ')}`)

	await verificarConexion()

	if (almacenamiento === 'local') {
		console.warn('  [imagenes] Las imagenes subidas se guardan en backend/uploads.')
		console.warn('  [imagenes] Sirve en desarrollo; para produccion configura Supabase Storage (o Cloudinary).')
	} else {
		console.log(`  Imagenes: ${almacenamiento === 'supabase' ? `Supabase Storage (bucket "${config.supabase.bucket}")` : 'Cloudinary'}`)
	}
	console.log('')
})
