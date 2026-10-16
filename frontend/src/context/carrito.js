import { createContext } from 'react'

/**
 * ===== Carrito de cotizacion =====
 *
 * No es un carrito de compra: no hay pagos ni checkout. Sirve para juntar
 * varios productos y mandarlos de una sola vez por WhatsApp, en lugar de
 * escribir una conversacion por cada uno.
 *
 * El boton "Cotizar" de cada producto sigue existiendo y es independiente:
 * quien solo quiere preguntar por una referencia no pasa por aqui.
 */

export const LLAVE_CARRITO = 'cg_carrito'

export const CarritoContext = createContext(null)

/**
 * Identifica una linea del carrito. El mismo producto en dos presentaciones
 * distintas son dos lineas, porque son dos referencias que se cotizan aparte.
 */
export const claveLinea = (slug, variante = '') => `${slug}::${variante}`

/** Deja en el navegador solo lo necesario para pintar el carrito */
export function aLinea(producto, variante = '', cantidad = 1) {
	return {
		clave: claveLinea(producto.slug, variante),
		slug: producto.slug,
		nombre: producto.nombre,
		variante,
		cantidad,
		marca: producto.marca ?? null,
		referencia: producto.referencia ?? null,
		categoria: producto.categoria?.nombre ?? null,
		imagen: producto.imagenes?.[0]?.url ?? null,
	}
}

/**
 * Lee el carrito guardado. En navegacion privada o con el almacenamiento
 * bloqueado, localStorage lanza excepcion: ahi se empieza con el carrito vacio
 * en lugar de romper el sitio.
 */
export function leerGuardado() {
	try {
		const crudo = localStorage.getItem(LLAVE_CARRITO)
		if (!crudo) return []

		const lineas = JSON.parse(crudo)
		if (!Array.isArray(lineas)) return []

		/* Se valida lo que viene del navegador: pudo quedar de una version anterior */
		return lineas
			.filter((l) => l && typeof l.slug === 'string' && typeof l.nombre === 'string')
			.map((l) => ({
				...l,
				clave: l.clave ?? claveLinea(l.slug, l.variante ?? ''),
				variante: l.variante ?? '',
				cantidad: Math.min(Math.max(Number(l.cantidad) || 1, 1), 99),
			}))
			.slice(0, 50)
	} catch {
		return []
	}
}

export function guardar(lineas) {
	try {
		localStorage.setItem(LLAVE_CARRITO, JSON.stringify(lineas))
	} catch {
		/* Sin almacenamiento el carrito vive solo mientras dure la pestana */
	}
}
