import { useCallback, useEffect, useMemo, useState } from 'react'
import { aLinea, CarritoContext, claveLinea, guardar, leerGuardado } from './carrito'

const MAX_LINEAS = 50
const MAX_CANTIDAD = 99

/**
 * Guarda los productos que el visitante quiere cotizar juntos.
 *
 * El contenido se conserva en localStorage, asi que sobrevive a recargas y a
 * cerrar el navegador: es normal armar la lista en varias visitas.
 */
export function CarritoProvider({ children }) {
	const [lineas, setLineas] = useState(leerGuardado)
	const [abierto, setAbierto] = useState(false)
	/* Para la animacion del contador cuando entra algo nuevo */
	const [ultimaAgregada, setUltimaAgregada] = useState(null)

	useEffect(() => guardar(lineas), [lineas])

	const agregar = useCallback((producto, variante = '', cantidad = 1) => {
		const clave = claveLinea(producto.slug, variante)

		setLineas((previas) => {
			const existente = previas.find((l) => l.clave === clave)

			if (existente) {
				return previas.map((l) =>
					l.clave === clave ? { ...l, cantidad: Math.min(l.cantidad + cantidad, MAX_CANTIDAD) } : l
				)
			}

			if (previas.length >= MAX_LINEAS) return previas
			return [...previas, aLinea(producto, variante, cantidad)]
		})

		setUltimaAgregada({ clave, hora: Date.now() })
	}, [])

	const quitar = useCallback((clave) => {
		setLineas((previas) => previas.filter((l) => l.clave !== clave))
	}, [])

	const cambiarCantidad = useCallback((clave, cantidad) => {
		const limitada = Math.min(Math.max(cantidad, 1), MAX_CANTIDAD)
		setLineas((previas) => previas.map((l) => (l.clave === clave ? { ...l, cantidad: limitada } : l)))
	}, [])

	const vaciar = useCallback(() => setLineas([]), [])

	const valor = useMemo(() => {
		const articulos = lineas.reduce((suma, l) => suma + l.cantidad, 0)

		return {
			lineas,
			articulos,
			vacio: lineas.length === 0,
			tiene: (slug, variante = '') => lineas.some((l) => l.clave === claveLinea(slug, variante)),
			agregar,
			quitar,
			cambiarCantidad,
			vaciar,
			abierto,
			abrir: () => setAbierto(true),
			cerrar: () => setAbierto(false),
			ultimaAgregada,
		}
	}, [lineas, abierto, ultimaAgregada, agregar, quitar, cambiarCantidad, vaciar])

	return <CarritoContext.Provider value={valor}>{children}</CarritoContext.Provider>
}

export default CarritoProvider
