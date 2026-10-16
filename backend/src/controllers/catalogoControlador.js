import productos from '../models/productos.js'
import categorias from '../models/categorias.js'
import ajustes from '../models/ajustes.js'

/**
 * ===== API publica =====
 *
 * Lo que consume el sitio. Solo productos publicados y nunca el precio.
 */

const entero = (valor, porDefecto, min, max) => {
	const n = Number.parseInt(valor, 10)
	return Number.isFinite(n) ? Math.min(Math.max(n, min), max) : porDefecto
}

export async function listarProductos(req, res) {
	const { categoria, q, destacado, nuevo, orden } = req.query

	const resultado = await productos.listarPublicos({
		categoria: typeof categoria === 'string' ? categoria.slice(0, 120) : undefined,
		q: typeof q === 'string' ? q.slice(0, 80).trim() : undefined,
		destacado: destacado === 'true',
		nuevo: nuevo === 'true',
		orden: typeof orden === 'string' ? orden : undefined,
		pagina: entero(req.query.pagina, 1, 1, 10_000),
		limite: entero(req.query.limite, 12, 1, 48),
	})

	/* no-cache: el navegador revalida con ETag (respuesta 304 si nada cambio), asi lo guardado en el panel se ve al instante */
	res.set('Cache-Control', 'no-cache')
	res.json(resultado)
}

export async function obtenerProducto(req, res) {
	res.set('Cache-Control', 'no-cache')
	res.json(await productos.obtenerPublicoPorSlug(req.params.slug))
}

export async function listarCategorias(req, res) {
	res.set('Cache-Control', 'no-cache')
	res.json(await categorias.listar({ publico: true }))
}

export async function obtenerAjustes(req, res) {
	res.set('Cache-Control', 'no-cache')
	res.json(await ajustes.obtener())
}

export default { listarProductos, obtenerProducto, listarCategorias, obtenerAjustes }
