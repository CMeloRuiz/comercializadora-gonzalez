import { consultar, transaccion } from '../config/db.js'
import { borrarImagen } from '../config/imagenes.js'
import { sinTildes, sinTildesSql, slugDisponible, ErrorNoEncontrado } from './utilidades.js'

/**
 * ===== Modelo de productos =====
 *
 * Dos vistas del mismo producto:
 *  - publica: lo que ve el sitio. Nunca incluye el precio ni los borradores.
 *  - admin:   todo, para el panel.
 */

const SELECT_BASE = `
	SELECT p.*, c.slug AS categoria_slug, c.nombre AS categoria_nombre
	FROM productos p
	LEFT JOIN categorias c ON c.id = p.categoria_id
`

/** Fila de Postgres -> objeto de la API */
function aObjeto(fila, { publico }) {
	const producto = {
		id: fila.id,
		slug: fila.slug,
		nombre: fila.nombre,
		categoria: fila.categoria_id
			? { id: fila.categoria_id, slug: fila.categoria_slug, nombre: fila.categoria_nombre }
			: null,
		marca: fila.marca,
		referencia: fila.referencia,
		resumen: fila.resumen,
		descripcion: fila.descripcion,
		caracteristicas: fila.caracteristicas,
		aplicaciones: fila.aplicaciones,
		especificaciones: fila.especificaciones,
		variantes: fila.variantes,
		imagenes: fila.imagenes.map(({ url }) => ({ url })),
		disponible: fila.disponible,
		destacado: fila.destacado,
		nuevo: fila.nuevo,
		actualizadoEn: fila.actualizado_en,
	}

	if (publico) return producto

	return {
		...producto,
		/* El panel necesita el id de cada imagen para poder borrarla despues */
		imagenes: fila.imagenes,
		precio: fila.precio,
		publicado: fila.publicado,
		creadoEn: fila.creado_en,
	}
}

/** Condicion de busqueda sobre nombre, marca, referencia, resumen y variantes */
function filtroBusqueda(q, parametros) {
	parametros.push(`%${sinTildes(q)}%`)
	const $ = `$${parametros.length}`
	const campos = ['p.nombre', "coalesce(p.marca, '')", "coalesce(p.referencia, '')", 'p.resumen', 'p.variantes::text', "coalesce(c.nombre, '')"]
	return `(${campos.map((campo) => `${sinTildesSql(campo)} LIKE ${$}`).join(' OR ')})`
}

const ORDENES = {
	relevancia: 'p.destacado DESC, p.nuevo DESC, p.nombre ASC',
	nombre: 'p.nombre ASC',
	recientes: 'p.creado_en DESC, p.id DESC',
	actualizados: 'p.actualizado_en DESC, p.id DESC',
}

/* ============================ Vista publica ============================ */

export async function listarPublicos({ categoria, q, destacado, nuevo, orden = 'relevancia', pagina = 1, limite = 12 } = {}) {
	const condiciones = ['p.publicado = TRUE']
	const parametros = []

	if (categoria) {
		parametros.push(categoria)
		condiciones.push(`c.slug = $${parametros.length}`)
	}
	if (q) condiciones.push(filtroBusqueda(q, parametros))
	if (destacado) condiciones.push('p.destacado = TRUE')
	if (nuevo) condiciones.push('p.nuevo = TRUE')

	const donde = `WHERE ${condiciones.join(' AND ')}`
	const ordenSql = ORDENES[orden] ?? ORDENES.relevancia

	const { rows: [{ total }] } = await consultar(
		`SELECT COUNT(*)::int AS total FROM productos p LEFT JOIN categorias c ON c.id = p.categoria_id ${donde}`,
		parametros
	)

	const desplazamiento = (pagina - 1) * limite
	const { rows } = await consultar(
		`${SELECT_BASE} ${donde} ORDER BY ${ordenSql} LIMIT ${limite} OFFSET ${desplazamiento}`,
		parametros
	)

	return {
		productos: rows.map((fila) => aObjeto(fila, { publico: true })),
		total,
		pagina,
		paginas: Math.max(1, Math.ceil(total / limite)),
	}
}

export async function obtenerPublicoPorSlug(slug) {
	const { rows } = await consultar(`${SELECT_BASE} WHERE p.slug = $1 AND p.publicado = TRUE`, [slug])
	if (!rows[0]) throw new ErrorNoEncontrado('Este producto no existe o ya no esta disponible')

	const producto = aObjeto(rows[0], { publico: true })

	/* Relacionados: misma categoria primero; si no alcanza, destacados */
	const { rows: relacionados } = await consultar(
		`${SELECT_BASE}
		 WHERE p.publicado = TRUE AND p.id <> $1
		 ORDER BY (p.categoria_id IS NOT DISTINCT FROM $2) DESC, p.destacado DESC, random()
		 LIMIT 4`,
		[producto.id, rows[0].categoria_id]
	)

	return { producto, relacionados: relacionados.map((fila) => aObjeto(fila, { publico: true })) }
}

/* ============================= Vista admin ============================= */

export async function listarAdmin({ q, categoria, estado } = {}) {
	const condiciones = []
	const parametros = []

	if (categoria === 'sin-categoria') condiciones.push('p.categoria_id IS NULL')
	else if (categoria) {
		parametros.push(Number(categoria))
		condiciones.push(`p.categoria_id = $${parametros.length}`)
	}
	if (q) condiciones.push(filtroBusqueda(q, parametros))

	const estados = {
		publicados: 'p.publicado = TRUE',
		borradores: 'p.publicado = FALSE',
		destacados: 'p.destacado = TRUE',
		agotados: 'p.disponible = FALSE',
		'sin-imagen': "jsonb_array_length(p.imagenes) = 0",
	}
	if (estados[estado]) condiciones.push(estados[estado])

	const donde = condiciones.length ? `WHERE ${condiciones.join(' AND ')}` : ''
	const { rows } = await consultar(`${SELECT_BASE} ${donde} ORDER BY ${ORDENES.actualizados}`, parametros)

	return rows.map((fila) => aObjeto(fila, { publico: false }))
}

export async function obtenerPorId(id, consulta = consultar) {
	const { rows } = await consulta(`${SELECT_BASE} WHERE p.id = $1`, [id])
	if (!rows[0]) throw new ErrorNoEncontrado('El producto no existe')
	return aObjeto(rows[0], { publico: false })
}

const COLUMNAS = [
	'nombre', 'categoria_id', 'marca', 'referencia', 'resumen', 'descripcion',
	'caracteristicas', 'aplicaciones', 'especificaciones', 'variantes', 'imagenes',
	'precio', 'disponible', 'destacado', 'nuevo', 'publicado',
]
const JSON_COLUMNAS = new Set(['caracteristicas', 'aplicaciones', 'especificaciones', 'variantes', 'imagenes'])

/** Datos validados (camelCase) -> valores por columna */
function aColumnas(datos) {
	const columnas = {}
	const mapa = { categoriaId: 'categoria_id' }

	for (const [clave, valor] of Object.entries(datos)) {
		const columna = mapa[clave] ?? clave
		if (!COLUMNAS.includes(columna)) continue
		columnas[columna] = JSON_COLUMNAS.has(columna) ? JSON.stringify(valor) : valor
	}
	return columnas
}

export async function crear(datos) {
	return transaccion(async (consulta) => {
		const slug = await slugDisponible(consulta, 'productos', datos.slug || datos.nombre)
		const columnas = { slug, ...aColumnas(datos) }
		const nombres = Object.keys(columnas)

		const { rows } = await consulta(
			`INSERT INTO productos (${nombres.join(', ')})
			 VALUES (${nombres.map((_, i) => `$${i + 1}`).join(', ')})
			 RETURNING id`,
			Object.values(columnas)
		)
		return obtenerPorId(rows[0].id, consulta)
	})
}

/**
 * Actualiza los campos recibidos (todos o solo algunos).
 * Las imagenes que el producto tenia y ya no vienen se borran del almacenamiento.
 */
export async function actualizar(id, datos) {
	let imagenesQuitadas = []

	const producto = await transaccion(async (consulta) => {
		const anterior = await obtenerPorId(id, consulta)
		const columnas = aColumnas(datos)

		/* Cambiar el nombre no cambia el slug: los enlaces ya compartidos siguen sirviendo */
		if (datos.slug && datos.slug !== anterior.slug) {
			columnas.slug = await slugDisponible(consulta, 'productos', datos.slug, id)
		}

		if (datos.imagenes) {
			const siguen = new Set(datos.imagenes.map((img) => img.id).filter(Boolean))
			imagenesQuitadas = anterior.imagenes.filter((img) => img.id && !siguen.has(img.id))
		}

		const nombres = Object.keys(columnas)
		if (nombres.length === 0) return anterior

		await consulta(
			`UPDATE productos
			 SET ${nombres.map((n, i) => `${n} = $${i + 1}`).join(', ')}, actualizado_en = NOW()
			 WHERE id = $${nombres.length + 1}`,
			[...Object.values(columnas), id]
		)
		return obtenerPorId(id, consulta)
	})

	/* Despues del COMMIT: si el guardado fallara, las imagenes seguirian en uso */
	await Promise.all(imagenesQuitadas.map((img) => borrarImagen(img.id)))
	return producto
}

export async function eliminar(id) {
	const producto = await obtenerPorId(id)
	await consultar('DELETE FROM productos WHERE id = $1', [id])
	await Promise.all(producto.imagenes.map((img) => borrarImagen(img.id)))
	return producto
}

/** Cifras para el resumen del panel */
export async function estadisticas() {
	const { rows: [totales] } = await consultar(`
		SELECT
			COUNT(*)::int                                            AS total,
			COUNT(*) FILTER (WHERE publicado)::int                   AS publicados,
			COUNT(*) FILTER (WHERE NOT publicado)::int               AS borradores,
			COUNT(*) FILTER (WHERE destacado)::int                   AS destacados,
			COUNT(*) FILTER (WHERE NOT disponible)::int              AS agotados,
			COUNT(*) FILTER (WHERE jsonb_array_length(imagenes) = 0)::int AS sin_imagen,
			COUNT(*) FILTER (WHERE precio IS NULL)::int              AS sin_precio,
			COALESCE(SUM(GREATEST(jsonb_array_length(variantes), 1)), 0)::int AS referencias
		FROM productos
	`)

	const { rows: porCategoria } = await consultar(`
		SELECT c.id, c.nombre, COUNT(p.id)::int AS total
		FROM categorias c
		LEFT JOIN productos p ON p.categoria_id = c.id
		GROUP BY c.id
		ORDER BY total DESC, c.nombre
	`)

	const recientes = (await listarAdmin()).slice(0, 6)

	return {
		totales: {
			total: totales.total,
			publicados: totales.publicados,
			borradores: totales.borradores,
			destacados: totales.destacados,
			agotados: totales.agotados,
			sinImagen: totales.sin_imagen,
			sinPrecio: totales.sin_precio,
			referencias: totales.referencias,
		},
		porCategoria,
		recientes,
	}
}

export default {
	listarPublicos, obtenerPublicoPorSlug, listarAdmin, obtenerPorId,
	crear, actualizar, eliminar, estadisticas,
}
