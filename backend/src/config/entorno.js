import 'dotenv/config'
import bcrypt from 'bcryptjs'

/**
 * Lee y valida la configuracion del servidor.
 *
 * Nada de credenciales en el codigo: todo llega por variables de entorno,
 * documentadas en .env.example.
 */

function requerida(nombre) {
	const valor = process.env[nombre]

	if (!valor) {
		console.error(`\n[config] Falta la variable de entorno ${nombre}.`)
		console.error('[config] Copia .env.example a .env y completalo antes de arrancar.\n')
		process.exit(1)
	}

	return valor
}

/**
 * Hash de la clave del administrador.
 *
 * Lo recomendado es ADMIN_CLAVE_HASH (generalo con "npm run hash"). Para
 * empezar rapido se acepta ADMIN_CLAVE en texto plano y se hashea en memoria,
 * avisando por consola porque deja la clave legible en el .env.
 */
function resolverClave() {
	if (process.env.ADMIN_CLAVE_HASH) return process.env.ADMIN_CLAVE_HASH

	if (process.env.ADMIN_CLAVE) {
		console.warn('\n[config] Estas usando ADMIN_CLAVE en texto plano.')
		console.warn('[config] Para produccion genera el hash con "npm run hash" y guardalo en ADMIN_CLAVE_HASH.\n')
		return bcrypt.hashSync(process.env.ADMIN_CLAVE, 10)
	}

	console.error('\n[config] Falta ADMIN_CLAVE_HASH (o ADMIN_CLAVE) en el .env.\n')
	process.exit(1)
}

/* Los scripts de base de datos no necesitan sesion ni administrador */
const soloBaseDatos = process.env.SOLO_BASE_DATOS === '1'

export const config = {
	puerto: Number(process.env.PORT) || 4000,

	/* Origenes permitidos por CORS, separados por coma en el .env */
	origenes: (process.env.ORIGENES_PERMITIDOS || 'http://localhost:5173')
		.split(',')
		.map((o) => o.trim())
		.filter(Boolean),

	jwtSecreto: soloBaseDatos ? '' : requerida('JWT_SECRETO'),
	jwtDuracion: process.env.JWT_DURACION || '8h',

	admin: soloBaseDatos
		? null
		: {
			usuario: requerida('ADMIN_USUARIO'),
			claveHash: resolverClave(),
		},

	/* Limite de subida de imagenes, en megabytes (antes de optimizarlas) */
	maxImagenMb: Number(process.env.MAX_IMAGEN_MB) || 8,

	/*
	 * Donde se guardan las imagenes que se suben desde el panel. Se elige el
	 * primero que este configurado: Supabase Storage, Cloudinary o, si no hay
	 * ninguno, backend/uploads (solo desarrollo: en Render ese disco se vacia
	 * en cada despliegue).
	 */
	supabase: {
		url: (process.env.SUPABASE_URL || '').replace(/\/$/, ''),
		/* Clave service_role: es secreta, nunca debe llegar al navegador */
		clave: process.env.SUPABASE_SERVICE_KEY || '',
		bucket: process.env.SUPABASE_BUCKET || 'catalogo',
	},

	cloudinary: {
		nombre: process.env.CLOUDINARY_CLOUD_NAME || '',
		clave: process.env.CLOUDINARY_API_KEY || '',
		secreto: process.env.CLOUDINARY_API_SECRET || '',
	},

	baseDatos: {
		/* Sin requerida(): la API arranca igual y responde 503 explicando el motivo */
		url: process.env.DATABASE_URL || '',

		/*
		 * Ruta al certificado de la autoridad certificadora de la base, para
		 * poder verificar el servidor. Supabase firma con su propia CA y lo
		 * ofrece en Project Settings -> Database -> SSL Configuration.
		 */
		certificado: process.env.DB_SSL_CA || '',
	},
}

export default config
