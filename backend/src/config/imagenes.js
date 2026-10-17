import { mkdir, writeFile, unlink } from 'node:fs/promises'
import { randomUUID } from 'node:crypto'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { v2 as cloudinary } from 'cloudinary'
import { createClient } from '@supabase/supabase-js'
import { config } from './entorno.js'

/**
 * ===== Almacenamiento de imagenes =====
 *
 * Toda imagen que llega del panel se optimiza aqui antes de guardarse: se
 * corrige la orientacion, se limita a 1600 px por lado y se convierte a WebP.
 * Una foto de celular de 5 MB queda en unos 100-200 KB.
 *
 * Tres destinos posibles, se usa el primero configurado:
 *  - Supabase Storage, en el mismo proyecto que la base de datos.
 *  - Cloudinary.
 *  - La carpeta backend/uploads, servida en /uploads. Solo para desarrollo:
 *    en Render el disco de un Web Service se vacia en cada despliegue.
 *
 * Cada imagen guardada se describe con { url, id }. El "id" lleva el prefijo
 * del destino ("supabase:", "cloudinary:", "local:") para poder borrarla
 * despues aunque mas adelante se cambie de proveedor.
 */

const CARPETA_REMOTA = 'comercializadora-gonzalez'
const LADO_MAXIMO = 1600

/* Los nombres llevan UUID, asi que el contenido de una URL nunca cambia */
const CACHE_SEGUNDOS = 31_536_000

const AQUI = dirname(fileURLToPath(import.meta.url))
export const CARPETA_LOCAL = join(AQUI, '..', '..', 'uploads')

export const haySupabase = Boolean(config.supabase.url && config.supabase.clave)

export const hayCloudinary = Boolean(
	config.cloudinary.nombre && config.cloudinary.clave && config.cloudinary.secreto
)

/** 'supabase' | 'cloudinary' | 'local'. El panel lo muestra en el resumen */
export const almacenamiento = haySupabase ? 'supabase' : hayCloudinary ? 'cloudinary' : 'local'

const supabase = haySupabase
	? createClient(config.supabase.url, config.supabase.clave, {
		auth: { persistSession: false, autoRefreshToken: false },
	})
	: null

if (hayCloudinary) {
	cloudinary.config({
		cloud_name: config.cloudinary.nombre,
		api_key: config.cloudinary.clave,
		api_secret: config.cloudinary.secreto,
		secure: true,
	})
}

export class ErrorImagenes extends Error {
	constructor(mensaje, status = 503, causa) {
		super(mensaje)
		this.name = 'ErrorImagenes'
		this.status = status
		this.causa = causa
	}
}

/*
 * sharp se carga cuando hace falta, no al arrancar.
 *
 * Trae un binario nativo distinto por sistema operativo, y si falta (por
 * ejemplo, cuando el package-lock.json se genero en otro sistema) importarlo
 * revienta. Cargandolo aqui, ese problema solo afecta a la subida de
 * imagenes: el catalogo, el panel y el resto de la API siguen en pie, y el
 * log dice exactamente que pasa.
 */
let sharpCargado

async function obtenerSharp() {
	if (sharpCargado !== undefined) return sharpCargado

	try {
		sharpCargado = (await import('sharp')).default
	} catch (error) {
		sharpCargado = null
		console.error('\n[imagenes] No se pudo cargar sharp:', error.message)
		console.error('[imagenes] El sitio funciona, pero el panel no podra subir imagenes.')
		console.error('[imagenes] En Linux suele faltar @img/sharp-linux-x64; reinstala con:')
		console.error('[imagenes]   npm install --include=optional\n')
	}

	return sharpCargado
}

/** Redimensiona y convierte a WebP. Lanza 400 si el archivo no es una imagen valida */
async function optimizar(contenido) {
	const sharp = await obtenerSharp()

	if (!sharp) {
		throw new ErrorImagenes(
			'El servidor no puede procesar imagenes en este momento. Avisa al administrador del sitio.',
			503
		)
	}

	try {
		return await sharp(contenido, { failOn: 'error' })
			.rotate()
			.resize({ width: LADO_MAXIMO, height: LADO_MAXIMO, fit: 'inside', withoutEnlargement: true })
			.webp({ quality: 82, alphaQuality: 90, effort: 5 })
			.toBuffer()
	} catch (error) {
		throw new ErrorImagenes('El archivo no es una imagen valida o esta danado', 400, error)
	}
}

/* ---------------------------- Supabase Storage ---------------------------- */

/*
 * El bucket se crea solo la primera vez, para no depender de que alguien lo
 * cree a mano en el panel. Publico: las fotos del catalogo se ven sin firmar
 * cada URL, que es justo lo que necesita un sitio de productos.
 */
let bucketListo = false

async function asegurarBucket() {
	if (bucketListo) return

	const { data, error } = await supabase.storage.getBucket(config.supabase.bucket)

	if (data) {
		bucketListo = true
		if (!data.public) {
			console.warn(`[imagenes] El bucket "${config.supabase.bucket}" es privado; las fotos no se veran en el sitio.`)
			console.warn('[imagenes] Marcalo como publico en Supabase -> Storage -> Configuration.')
		}
		return
	}

	/* getBucket falla tambien si no existe: se intenta crear y se ignora si ya estaba */
	const { error: errorCrear } = await supabase.storage.createBucket(config.supabase.bucket, {
		public: true,
		fileSizeLimit: `${config.maxImagenMb}MB`,
		allowedMimeTypes: ['image/webp'],
	})

	if (errorCrear && !/already exists/i.test(errorCrear.message)) {
		console.error('[imagenes] No se pudo preparar el bucket:', errorCrear.message, error?.message ?? '')
		throw new ErrorImagenes(
			`No se pudo preparar el bucket "${config.supabase.bucket}" en Supabase Storage. ` +
			'Revisa que SUPABASE_SERVICE_KEY sea la clave service_role.',
			503,
			errorCrear
		)
	}

	console.log(`[imagenes] Bucket "${config.supabase.bucket}" creado en Supabase Storage.`)
	bucketListo = true
}

async function subirASupabase(contenido, carpeta) {
	await asegurarBucket()

	const ruta = `${CARPETA_REMOTA}/${carpeta}/${randomUUID()}.webp`

	const { error } = await supabase.storage.from(config.supabase.bucket).upload(ruta, contenido, {
		contentType: 'image/webp',
		cacheControl: String(CACHE_SEGUNDOS),
		upsert: false,
	})

	if (error) {
		console.error('[imagenes] Fallo al subir a Supabase:', error.message)
		throw new ErrorImagenes('No se pudo subir la imagen. Intenta de nuevo.', 503, error)
	}

	const { data } = supabase.storage.from(config.supabase.bucket).getPublicUrl(ruta)
	return { url: data.publicUrl, id: `supabase:${ruta}` }
}

/* ------------------------------- Cloudinary ------------------------------- */

function subirACloudinary(contenido, carpeta) {
	return new Promise((resolver, rechazar) => {
		const flujo = cloudinary.uploader.upload_stream(
			{
				folder: `${CARPETA_REMOTA}/${carpeta}`,
				public_id: randomUUID(),
				resource_type: 'image',
			},
			(error, resultado) => {
				if (error) {
					console.error('[imagenes] Fallo al subir a Cloudinary:', error.message)
					return rechazar(new ErrorImagenes('No se pudo subir la imagen. Intenta de nuevo.', 503, error))
				}
				resolver({ url: resultado.secure_url, id: `cloudinary:${resultado.public_id}` })
			}
		)
		flujo.end(contenido)
	})
}

/* --------------------------------- Disco --------------------------------- */

async function guardarEnDisco(contenido, carpeta) {
	const nombre = `${randomUUID()}.webp`
	const destino = join(CARPETA_LOCAL, carpeta)

	await mkdir(destino, { recursive: true })
	await writeFile(join(destino, nombre), contenido)

	/* Ruta relativa: el frontend le antepone la URL de la API */
	return { url: `/uploads/${carpeta}/${nombre}`, id: `local:${carpeta}/${nombre}` }
}

/* ---------------------------------- API ---------------------------------- */

/**
 * Optimiza y guarda una imagen.
 *
 * @param {Buffer} contenido  Archivo tal como llego del formulario
 * @param {'productos'|'categorias'} carpeta
 * @returns {Promise<{url: string, id: string}>}
 */
export async function guardarImagen(contenido, carpeta) {
	const optimizada = await optimizar(contenido)

	if (haySupabase) return subirASupabase(optimizada, carpeta)
	if (hayCloudinary) return subirACloudinary(optimizada, carpeta)
	return guardarEnDisco(optimizada, carpeta)
}

/**
 * Borra una imagen guardada antes. Las que no tienen id (las del catalogo
 * inicial, que viven en el frontend) se ignoran. Un fallo al borrar solo se
 * registra: no debe impedir guardar el producto.
 */
export async function borrarImagen(id) {
	if (!id || typeof id !== 'string') return

	try {
		if (id.startsWith('supabase:') && haySupabase) {
			const ruta = id.slice('supabase:'.length)
			const { error } = await supabase.storage.from(config.supabase.bucket).remove([ruta])
			if (error) throw error
		} else if (id.startsWith('cloudinary:') && hayCloudinary) {
			await cloudinary.uploader.destroy(id.slice('cloudinary:'.length), { invalidate: true })
		} else if (id.startsWith('local:')) {
			const relativa = id.slice('local:'.length)
			/* Defensa ante ids manipulados: nada de subir directorios */
			if (relativa.includes('..')) return
			await unlink(join(CARPETA_LOCAL, relativa))
		}
	} catch (error) {
		if (error.code !== 'ENOENT') console.error('[imagenes] No se pudo borrar', id, error.message)
	}
}

export default { guardarImagen, borrarImagen, almacenamiento, haySupabase, hayCloudinary, ErrorImagenes, CARPETA_LOCAL }
