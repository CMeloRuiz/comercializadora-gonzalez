import { createInterface } from 'node:readline'
import { readFile, writeFile } from 'node:fs/promises'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import bcrypt from 'bcryptjs'

/**
 * Cambia la clave del administrador del panel.
 *
 *   npm run hash                 pide la clave por teclado y la guarda en .env
 *   npm run hash -- --mostrar    solo imprime el hash, no toca el .env: es lo
 *                                que hay que pegar en Render, donde las
 *                                variables no salen de ningun archivo
 *   npm run hash -- miClave      toma la clave del argumento (queda en el
 *                                historial de la terminal: evitalo)
 *
 * Desde la raiz funciona igual gracias al "--" del final de su script: sin el,
 * npm se quedaba con las banderas en vez de pasarlas aqui y --mostrar no
 * llegaba nunca.
 *
 * En el .env nunca se guarda la clave, solo su hash bcrypt: un resumen del que
 * no se puede volver atras. Si alguien lee el archivo, no puede entrar al panel.
 */

const ARCHIVO_ENV = join(dirname(fileURLToPath(import.meta.url)), '..', '..', '.env')

const argumentos = process.argv.slice(2)
const soloMostrar = argumentos.includes('--mostrar')
const claveDeArgumento = argumentos.find((a) => !a.startsWith('--'))

const interactivo = Boolean(process.stdin.isTTY)

/*
 * Un unico lector para todas las preguntas: creando uno por pregunta, el
 * primero se queda con el resto de la entrada y el siguiente no recibe nada.
 */
let lector = null
let ocultando = false

function obtenerLector() {
	if (lector) return lector

	lector = createInterface({ input: process.stdin, output: process.stdout, terminal: true })

	/* readline va escribiendo cada tecla; mientras "ocultando" este activo, no se imprime */
	lector._writeToOutput = (texto) => {
		if (!ocultando) process.stdout.write(texto)
	}

	return lector
}

/*
 * Sin terminal (tuberia, CI) se lee toda la entrada de una vez y se va
 * repartiendo entre las preguntas. Con readline se perderia la segunda linea:
 * llega mientras nadie la esta esperando todavia.
 */
let lineasEnCola = null

async function leerEntradaCompleta() {
	const trozos = []
	for await (const trozo of process.stdin) trozos.push(trozo)
	return Buffer.concat(trozos).toString('utf8').split(/\r?\n/)
}

/** Pregunta sin que lo escrito aparezca en pantalla, como hace sudo */
async function preguntarOculto(pregunta) {
	if (!interactivo) {
		lineasEnCola ??= await leerEntradaCompleta()
		process.stdout.write(`${pregunta}\n`)
		return (lineasEnCola.shift() ?? '').trim()
	}

	return new Promise((resolver) => {
		obtenerLector().question(pregunta, (respuesta) => {
			ocultando = false
			process.stdout.write('\n')
			resolver(respuesta)
		})
		ocultando = true
	})
}

/** Reemplaza (o agrega) una variable en el contenido del .env */
function fijarVariable(contenido, nombre, valor) {
	const linea = `${nombre}=${valor}`
	const patron = new RegExp(`^${nombre}=.*$`, 'm')
	return patron.test(contenido) ? contenido.replace(patron, linea) : `${contenido.trimEnd()}\n${linea}\n`
}

/* ------------------------------ 1. La clave ------------------------------ */

let clave = claveDeArgumento

if (!clave) {
	console.log('\n  Clave nueva para entrar al panel (/admin).')
	console.log('  No se vera mientras la escribes.\n')

	clave = await preguntarOculto('  Clave: ')
	const repetida = await preguntarOculto('  Repitela: ')
	lector?.close()

	if (clave !== repetida) {
		console.error('\n  Las dos claves no coinciden. No se cambio nada.\n')
		process.exit(1)
	}
}

if (!clave || clave.length < 8) {
	console.error('\n  Usa una clave de al menos 8 caracteres. No se cambio nada.\n')
	process.exit(1)
}

/* El coste 12 hace que probar claves por fuerza bruta sea lento */
const hash = await bcrypt.hash(clave, 12)

/* ------------------------- 2. Guardar o mostrar ------------------------- */

if (soloMostrar || claveDeArgumento) {
	console.log('\n  Copia esta linea en backend/.env y deja ADMIN_CLAVE vacia:\n')
	/* Comillas simples: los $ del hash se guardan literales, sin interpretarse */
	console.log(`ADMIN_CLAVE_HASH='${hash}'\n`)
	process.exit(0)
}

try {
	let contenido = await readFile(ARCHIVO_ENV, 'utf8')

	contenido = fijarVariable(contenido, 'ADMIN_CLAVE_HASH', `'${hash}'`)
	/* La clave en texto plano deja de usarse: el hash tiene prioridad */
	contenido = fijarVariable(contenido, 'ADMIN_CLAVE', '')

	await writeFile(ARCHIVO_ENV, contenido)

	console.log('  Clave actualizada en backend/.env (guardada como hash).')
	console.log('  Reinicia la API para que tome la nueva:  npm run dev\n')
} catch (error) {
	console.error(`\n  No se pudo escribir en backend/.env: ${error.message}`)
	console.error('  Copia esta linea a mano:\n')
	console.error(`ADMIN_CLAVE_HASH='${hash}'\n`)
	process.exitCode = 1
}
