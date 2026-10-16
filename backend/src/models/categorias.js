import { consultar, transaccion } from '../config/db.js'
import { borrarImagen } from '../config/imagenes.js'
import { slugDisponible, ErrorNoEncontrado } from './utilidades.js'

/**
 * ===== Modelo de categorias =====
 *
 * Cada categoria trae cuantos productos tiene y una imagen de respaldo (la
 * portada de uno de sus productos) para cuando no se le ha subido una propia.
 */

function aObjeto(fila, { publico }) {
	const categoria = {
		id: fila.id,
		slug: fila.slug,
		nombre: fila.nombre,
		descripcion: fila.descripcion,
		imagen: fila.imagen ? { url: fila.imagen.url } : null,
		imagenRespaldo: fila.imagen_respaldo ?? null,
		orden: fila.orden,
		totalProductos: fila.total_productos ?? 0,
	}
	return publico ? categoria : { ...categoria, imagen: fila.imagen, actualizadoEn: fila.actualizado_en }
}

function selectConConteo(soloPublicados) {
	const filtro = soloPublicados ? 'AND p.publicado = TRUE' : ''
	return `
		SELECT c.*,
			(SELECT COUNT(*)::int FROM productos p WHERE p.categoria_id = c.id ${filtro}) AS total_productos,
			(SELECT p.imagenes->0->>'url' FROM productos p
			 WHERE p.categoria_id = c.id ${filtro} AND jsonb_array_length(p.imagenes) > 0
			 ORDER BY p.destacado DESC, p.id LIMIT 1) AS imagen_respaldo
		FROM categorias c
	`
}

export async function listar({ publico = true } = {}) {
	const { rows } = await consultar(`${selectConConteo(publico)} ORDER BY c.orden, c.nombre`)
	return rows.map((fila) => aObjeto(fila, { publico }))
}

export async function obtenerPorId(id, consulta = consultar) {
	const { rows } = await consulta(`${selectConConteo(false)} WHERE c.id = $1`, [id])
	if (!rows[0]) throw new ErrorNoEncontrado('La categoria no existe')
	return aObjeto(rows[0], { publico: false })
}

export async function crear({ nombre, descripcion, imagen, orden }) {
	return transaccion(async (consulta) => {
		const slug = await slugDisponible(consulta, 'categorias', nombre)
		const { rows } = await consulta(
			`INSERT INTO categorias (slug, nombre, descripcion, imagen, orden)
			 VALUES ($1, $2, $3, $4, COALESCE($5, (SELECT COALESCE(MAX(orden), 0) + 1 FROM categorias)))
			 RETURNING id`,
			[slug, nombre, descripcion ?? '', imagen ? JSON.stringify(imagen) : null, orden ?? null]
		)
		return obtenerPorId(rows[0].id, consulta)
	})
}

export async function actualizar(id, { nombre, descripcion, imagen, orden }) {
	let imagenQuitada = null

	const categoria = await transaccion(async (consulta) => {
		const anterior = await obtenerPorId(id, consulta)

		if (imagen !== undefined && anterior.imagen?.id && anterior.imagen.id !== imagen?.id) {
			imagenQuitada = anterior.imagen.id
		}

		await consulta(
			`UPDATE categorias SET
				nombre = COALESCE($1, nombre),
				descripcion = COALESCE($2, descripcion),
				imagen = CASE WHEN $3::boolean THEN $4::jsonb ELSE imagen END,
				orden = COALESCE($5, orden),
				actualizado_en = NOW()
			 WHERE id = $6`,
			[nombre ?? null, descripcion ?? null, imagen !== undefined, imagen ? JSON.stringify(imagen) : null, orden ?? null, id]
		)
		return obtenerPorId(id, consulta)
	})

	if (imagenQuitada) await borrarImagen(imagenQuitada)
	return categoria
}

/** Los productos de la categoria no se borran: quedan "sin categoria" */
export async function eliminar(id) {
	const categoria = await obtenerPorId(id)
	await consultar('DELETE FROM categorias WHERE id = $1', [id])
	if (categoria.imagen?.id) await borrarImagen(categoria.imagen.id)
	return categoria
}

/** Guarda el orden recibido: [idA, idB, ...] */
export async function reordenar(ids) {
	await transaccion(async (consulta) => {
		for (const [indice, id] of ids.entries()) {
			await consulta('UPDATE categorias SET orden = $1 WHERE id = $2', [indice + 1, id])
		}
	})
	return listar({ publico: false })
}

export default { listar, obtenerPorId, crear, actualizar, eliminar, reordenar }
