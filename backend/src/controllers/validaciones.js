import { ErrorValidacion } from '../models/utilidades.js'

/**
 * Validacion de lo que llega del panel.
 *
 * Cada funcion devuelve un objeto limpio con solo los campos conocidos y ya
 * normalizados, o lanza ErrorValidacion con el detalle por campo para que el
 * formulario marque exactamente que corregir.
 */

const texto = (valor, max) => String(valor ?? '').trim().slice(0, max)

const listaTextos = (valor, maxItems = 30, maxLargo = 200) =>
	(Array.isArray(valor) ? valor : [])
		.map((item) => texto(item, maxLargo))
		.filter(Boolean)
		.slice(0, maxItems)

function listaImagenes(valor) {
	return (Array.isArray(valor) ? valor : [])
		.filter((img) => img && typeof img.url === 'string' && img.url.trim())
		.map((img) => ({ url: img.url.trim(), ...(img.id ? { id: String(img.id) } : {}) }))
		.slice(0, 12)
}

function listaEspecificaciones(valor) {
	return (Array.isArray(valor) ? valor : [])
		.map((fila) => ({ etiqueta: texto(fila?.etiqueta, 80), valor: texto(fila?.valor, 200) }))
		.filter((fila) => fila.etiqueta && fila.valor)
		.slice(0, 30)
}

const booleano = (valor) => valor === true || valor === 'true'

/**
 * @param {object} cuerpo
 * @param {{ parcial?: boolean }} opciones  Parcial: solo valida los campos presentes (PATCH)
 */
export function validarProducto(cuerpo = {}, { parcial = false } = {}) {
	const campos = {}
	const datos = {}
	const tiene = (clave) => cuerpo[clave] !== undefined

	if (!parcial || tiene('nombre')) {
		datos.nombre = texto(cuerpo.nombre, 160)
		if (datos.nombre.length < 3) campos.nombre = 'Escribe un nombre de al menos 3 caracteres'
	}

	if (tiene('slug')) datos.slug = texto(cuerpo.slug, 160)

	if (!parcial || tiene('categoriaId')) {
		const crudo = cuerpo.categoriaId
		const id = crudo === '' || crudo === null || crudo === undefined ? null : Number(crudo)
		if (id !== null && !Number.isInteger(id)) campos.categoriaId = 'Categoria no valida'
		datos.categoriaId = id
	}

	for (const [clave, max] of [['marca', 80], ['referencia', 80]]) {
		if (!parcial || tiene(clave)) datos[clave] = texto(cuerpo[clave], max) || null
	}

	if (!parcial || tiene('resumen')) datos.resumen = texto(cuerpo.resumen, 300)
	if (!parcial || tiene('descripcion')) datos.descripcion = texto(cuerpo.descripcion, 8000)

	if (!parcial || tiene('caracteristicas')) datos.caracteristicas = listaTextos(cuerpo.caracteristicas)
	if (!parcial || tiene('aplicaciones')) datos.aplicaciones = listaTextos(cuerpo.aplicaciones)
	if (!parcial || tiene('variantes')) datos.variantes = listaTextos(cuerpo.variantes, 60, 120)
	if (!parcial || tiene('especificaciones')) datos.especificaciones = listaEspecificaciones(cuerpo.especificaciones)
	if (!parcial || tiene('imagenes')) datos.imagenes = listaImagenes(cuerpo.imagenes)

	if (!parcial || tiene('precio')) {
		const crudo = cuerpo.precio
		if (crudo === null || crudo === undefined || crudo === '') {
			datos.precio = null
		} else {
			const numero = Number(String(crudo).replace(/[^\d.]/g, ''))
			if (!Number.isFinite(numero) || numero < 0) campos.precio = 'El precio debe ser un numero positivo'
			else if (numero > 9_999_999_999) campos.precio = 'El precio es demasiado alto'
			else datos.precio = Math.round(numero * 100) / 100
		}
	}

	for (const clave of ['disponible', 'destacado', 'nuevo', 'publicado']) {
		if (tiene(clave)) datos[clave] = booleano(cuerpo[clave])
		else if (!parcial) datos[clave] = clave === 'disponible' || clave === 'publicado'
	}

	if (Object.keys(campos).length) {
		throw new ErrorValidacion('Revisa los campos marcados', campos)
	}
	return datos
}

export function validarCategoria(cuerpo = {}, { parcial = false } = {}) {
	const campos = {}
	const datos = {}

	if (!parcial || cuerpo.nombre !== undefined) {
		datos.nombre = texto(cuerpo.nombre, 120)
		if (datos.nombre.length < 2) campos.nombre = 'Escribe un nombre de al menos 2 caracteres'
	}
	if (cuerpo.descripcion !== undefined) datos.descripcion = texto(cuerpo.descripcion, 400)
	if (cuerpo.imagen !== undefined) {
		datos.imagen = cuerpo.imagen?.url ? listaImagenes([cuerpo.imagen])[0] : null
	}
	if (cuerpo.orden !== undefined && Number.isInteger(Number(cuerpo.orden))) datos.orden = Number(cuerpo.orden)

	if (Object.keys(campos).length) throw new ErrorValidacion('Revisa los campos marcados', campos)
	return datos
}

/** Id numerico de la URL */
export function idDeRuta(valor) {
	const id = Number(valor)
	if (!Number.isInteger(id) || id <= 0) throw new ErrorValidacion('Identificador no valido')
	return id
}
