/**
 * ===== Peticiones con reintentos =====
 *
 * Una peticion puede fallar sin que el servidor llegue a contestar nada util:
 *
 *  - fetch lanza excepcion cuando ni siquiera se pudo abrir la conexion.
 *  - Con un intermediario de por medio, el backend caido se ve como una
 *    respuesta suya: el proxy de Vite contesta 502 en desarrollo, y en
 *    produccion el borde de Render devuelve 502 o 503 mientras el servicio
 *    despierta.
 *
 * Los dos casos significan lo mismo ("todavia no hay nadie al otro lado") y se
 * reintentan. Un 401, un 404 o un 500 no: ahi el servidor ya respondio y
 * repetir la peticion no cambiaria nada.
 *
 * Pasa mas de lo que parece: en desarrollo Vite esta listo en menos de un
 * segundo y la API tarda dos o tres en arrancar y conectarse a la base; quien
 * entra en ese hueco veia "No se pudo conectar" aunque un segundo despues todo
 * estuviera bien.
 */

/*
 * Esperas crecientes. Las lecturas aguantan mas porque mientras tanto se ve el
 * esqueleto de carga y nadie se queda mirando un error que se habria arreglado
 * solo: un servicio gratuito de Render puede tardar en despertar.
 */
const ESPERAS_LECTURA = [400, 1200, 2500, 4000, 7000]

/*
 * Las escrituras solo se repiten si no se logro conectar (ahi es seguro:
 * la peticion no llego). Nunca ante un 502, porque podria haber llegado y
 * duplicar lo guardado.
 */
const ESPERAS_ESCRITURA = [400, 1200, 2500]

const ESTADOS_REINTENTABLES = [502, 503, 504]

const esLectura = (metodo = 'GET') => ['GET', 'HEAD'].includes(metodo.toUpperCase())

const dormir = (ms) => new Promise((listo) => setTimeout(listo, ms))

/** Lo cancelo yo (cambio de pagina, nueva busqueda): no es un fallo de red */
const esCancelacion = (error) => error.name === 'AbortError'

function cancelado(opciones) {
	if (opciones.signal?.aborted) throw new DOMException('Cancelado', 'AbortError')
}

/**
 * fetch que reintenta mientras el servidor no este disponible.
 *
 * @param {string} url
 * @param {RequestInit} opciones
 * @returns {Promise<Response>}
 */
export async function pedirConReintentos(url, opciones = {}) {
	const lectura = esLectura(opciones.method)
	const esperas = lectura ? ESPERAS_LECTURA : ESPERAS_ESCRITURA
	let ultimoError

	for (let intento = 0; intento <= esperas.length; intento++) {
		const ultimoIntento = intento === esperas.length

		try {
			const respuesta = await fetch(url, opciones)

			/* El intermediario dice que el destino no responde: vale la pena insistir */
			if (lectura && ESTADOS_REINTENTABLES.includes(respuesta.status) && !ultimoIntento) {
				await dormir(esperas[intento])
				cancelado(opciones)
				continue
			}

			return respuesta
		} catch (error) {
			if (esCancelacion(error)) throw error

			ultimoError = error
			if (ultimoIntento) break

			cancelado(opciones)
			await dormir(esperas[intento])
			cancelado(opciones)
		}
	}

	throw ultimoError ?? new TypeError('No se pudo completar la peticion')
}

export default pedirConReintentos
