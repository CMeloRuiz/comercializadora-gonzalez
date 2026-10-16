import { readFileSync } from 'node:fs'
import pg from 'pg'
import { config } from './entorno.js'

/**
 * ===== Conexion a PostgreSQL (Supabase) =====
 *
 * Unico modulo que importa "pg". Los modelos llaman a consultar() y
 * transaccion(); los controladores nunca hablan SQL directamente.
 *
 * Sirve igual para Supabase, Neon o un Postgres propio: lo unico que cambia
 * es DATABASE_URL y como se verifica el certificado (ver resolverSsl).
 */

const { Pool, types } = pg

/*
 * NUMERIC llega de pg como texto para no perder precision. Los precios de una
 * ferreteria caben de sobra en un double, asi que se convierten a numero.
 */
types.setTypeParser(types.builtins.NUMERIC, (valor) => (valor === null ? null : Number(valor)))

const POOL = {
	/* Un solo administrador y un catalogo pequeno: cinco conexiones sobran */
	max: 5,
	idleTimeoutMillis: 30_000,
	/* El plan gratuito puede tener la base dormida; despertarla tarda unos segundos */
	connectionTimeoutMillis: 10_000,
}

let pool = null

/** Un Postgres local normalmente no tiene TLS montado; los alojados siempre lo piden */
function necesitaSsl(url) {
	return !/@(localhost|127\.0\.0\.1)/.test(url)
}

/*
 * "sslmode" y "channel_binding" vienen en las cadenas de Supabase y Neon. Se
 * quitan y el TLS se configura de forma explicita en resolverSsl(), para no
 * depender de como interprete pg-connection-string cada version.
 */
function sinParametrosTls(url) {
	try {
		const direccion = new URL(url)
		direccion.searchParams.delete('sslmode')
		direccion.searchParams.delete('channel_binding')
		return direccion.toString()
	} catch {
		return url
	}
}

/**
 * Configuracion de TLS.
 *
 * Supabase no usa una autoridad certificadora publica: firma sus servidores
 * con su propia CA ("Supabase Root 2021 CA"), asi que Node no puede
 * verificarla por su cuenta y hay que darle el certificado.
 *
 *  - Con DB_SSL_CA (ruta al .crt que se descarga del panel de Supabase):
 *    conexion cifrada y certificado verificado. Es lo recomendado.
 *  - Sin el: se cifra igual, pero sin comprobar quien esta al otro lado. Es
 *    lo que hace la cadena por defecto de Supabase (sslmode=require) y lo que
 *    permite arrancar sin pasos previos; se avisa por consola una sola vez.
 *
 * Con un proveedor de CA publica (Neon y similares) se verifica siempre.
 */
let avisoSslDado = false

function resolverSsl(url) {
	if (!necesitaSsl(url)) return false

	if (config.baseDatos.certificado) {
		try {
			return { ca: readFileSync(config.baseDatos.certificado, 'utf8'), rejectUnauthorized: true }
		} catch (error) {
			console.error(`[db] No se pudo leer DB_SSL_CA (${config.baseDatos.certificado}): ${error.message}`)
			console.error('[db] Se continuara cifrando sin verificar el certificado.')
			return { rejectUnauthorized: false }
		}
	}

	if (/supabase\.(com|co)/.test(url)) {
		if (!avisoSslDado) {
			avisoSslDado = true
			console.warn('\n[db] Supabase usa su propia autoridad certificadora.')
			console.warn('[db] La conexion va cifrada, pero no se esta verificando el certificado.')
			console.warn('[db] Para verificarlo: Supabase -> Project Settings -> Database -> SSL Configuration,')
			console.warn('[db] descarga el certificado y apunta DB_SSL_CA a ese archivo.\n')
		}
		return { rejectUnauthorized: false }
	}

	return { rejectUnauthorized: true }
}

/** Error de infraestructura: responde 503 con un mensaje legible */
export class ErrorBaseDatos extends Error {
	constructor(mensaje, causa) {
		super(mensaje)
		this.name = 'ErrorBaseDatos'
		this.status = 503
		this.causa = causa
	}
}

function obtenerPool() {
	if (pool) return pool

	if (!config.baseDatos.url) {
		throw new ErrorBaseDatos('La base de datos no esta configurada. Falta DATABASE_URL en el servidor.')
	}

	pool = new Pool({
		connectionString: sinParametrosTls(config.baseDatos.url),
		ssl: resolverSsl(config.baseDatos.url),
		...POOL,
	})

	/* Sin este oyente, una conexion inactiva que se cae tumba el proceso */
	pool.on('error', (error) => {
		console.error('[db] Conexion inactiva perdida:', error.message)
	})

	return pool
}

const CODIGOS_RED = ['ECONNRESET', 'ETIMEDOUT', 'ENOTFOUND', 'ECONNREFUSED', '57P01']

async function conectar() {
	try {
		return await obtenerPool().connect()
	} catch (error) {
		if (error instanceof ErrorBaseDatos) throw error
		console.error('[db] No se pudo conectar:', error.message)
		throw new ErrorBaseDatos('No se pudo conectar a la base de datos', error)
	}
}

function traducirError(error) {
	if (CODIGOS_RED.includes(error.code)) {
		console.error('[db] Conexion interrumpida:', error.message)
		return new ErrorBaseDatos('Se perdio la conexion con la base de datos', error)
	}
	return error
}

/**
 * Lanza una consulta parametrizada ($1, $2...). Nunca concatenar valores.
 */
export async function consultar(sql, parametros = []) {
	const cliente = await conectar()

	try {
		return await cliente.query(sql, parametros)
	} catch (error) {
		throw traducirError(error)
	} finally {
		cliente.release()
	}
}

/**
 * Ejecuta varias consultas como una sola unidad: o se aplican todas o ninguna.
 *
 * @param {(consultar: Function) => Promise<any>} trabajo
 */
export async function transaccion(trabajo) {
	const cliente = await conectar()

	try {
		await cliente.query('BEGIN')
		const resultado = await trabajo((sql, parametros = []) => cliente.query(sql, parametros))
		await cliente.query('COMMIT')
		return resultado
	} catch (error) {
		await cliente.query('ROLLBACK').catch(() => {})
		throw traducirError(error)
	} finally {
		cliente.release()
	}
}

/**
 * A que base se apunta, sin credenciales.
 *
 * Se imprime al arrancar porque "Base de datos conectada" a secas no dice
 * nada: con la cadena equivocada en el .env, una prueba local escribiria
 * sobre la base de produccion sin que nada lo advierta.
 *
 * En Supabase el host es el del pooler compartido (aws-0-region.pooler...),
 * asi que el proyecto se saca del usuario, que viene como "postgres.<ref>".
 */
function describirDestino() {
	try {
		const { hostname, pathname, username } = new URL(config.baseDatos.url)
		const base = pathname.replace(/^\//, '') || '(sin nombre)'
		const proyecto = username.includes('.') ? username.slice(username.indexOf('.') + 1) : hostname.split('.')[0]
		return `${base} · proyecto ${proyecto} (${hostname})`
	} catch {
		return '(no se pudo leer DATABASE_URL)'
	}
}

/** Comprueba al arrancar que la base responde, sin cortar el arranque */
export async function verificarConexion() {
	try {
		await consultar('SELECT 1')
		console.log(`  Base de datos conectada: ${describirDestino()}`)
		return true
	} catch (error) {
		console.error('\n[db] AVISO: la base de datos no responde.')
		console.error(`[db] ${error.message}`)
		console.error('[db] La API arranca igual, pero el catalogo respondera 503 hasta que la conexion funcione.\n')
		return false
	}
}

/** Cierra el pool. Lo usan los scripts para que el proceso termine */
export async function cerrarPool() {
	if (!pool) return
	await pool.end()
	pool = null
}

export default { consultar, transaccion, verificarConexion, cerrarPool, ErrorBaseDatos }
