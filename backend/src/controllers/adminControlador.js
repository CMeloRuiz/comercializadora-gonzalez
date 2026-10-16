import multer from 'multer'
import { config } from '../config/entorno.js'
import { guardarImagen, almacenamiento } from '../config/imagenes.js'
import productos from '../models/productos.js'
import categorias from '../models/categorias.js'
import ajustes from '../models/ajustes.js'
import { ErrorValidacion } from '../models/utilidades.js'
import { validarProducto, validarCategoria, idDeRuta } from './validaciones.js'

/**
 * ===== API del panel administrativo =====
 *
 * Todas estas rutas pasan antes por requiereSesion.
 */

/* ------------------------------ Resumen ------------------------------ */

export async function resumen(req, res) {
	res.json({ ...(await productos.estadisticas()), almacenamiento })
}

/* ----------------------------- Productos ----------------------------- */

export async function listarProductos(req, res) {
	const { q, categoria, estado } = req.query
	res.json(await productos.listarAdmin({
		q: typeof q === 'string' ? q.slice(0, 80).trim() : undefined,
		categoria: typeof categoria === 'string' ? categoria : undefined,
		estado: typeof estado === 'string' ? estado : undefined,
	}))
}

export async function obtenerProducto(req, res) {
	res.json(await productos.obtenerPorId(idDeRuta(req.params.id)))
}

export async function crearProducto(req, res) {
	res.status(201).json(await productos.crear(validarProducto(req.body)))
}

export async function actualizarProducto(req, res) {
	res.json(await productos.actualizar(idDeRuta(req.params.id), validarProducto(req.body)))
}

/** Cambios rapidos desde el listado: publicar, destacar, marcar agotado */
export async function actualizarProductoParcial(req, res) {
	res.json(await productos.actualizar(idDeRuta(req.params.id), validarProducto(req.body, { parcial: true })))
}

export async function eliminarProducto(req, res) {
	const eliminado = await productos.eliminar(idDeRuta(req.params.id))
	res.json({ ok: true, id: eliminado.id, nombre: eliminado.nombre })
}

/* ----------------------------- Categorias ---------------------------- */

export async function listarCategorias(req, res) {
	res.json(await categorias.listar({ publico: false }))
}

export async function crearCategoria(req, res) {
	res.status(201).json(await categorias.crear(validarCategoria(req.body)))
}

export async function actualizarCategoria(req, res) {
	res.json(await categorias.actualizar(idDeRuta(req.params.id), validarCategoria(req.body, { parcial: true })))
}

export async function eliminarCategoria(req, res) {
	const eliminada = await categorias.eliminar(idDeRuta(req.params.id))
	res.json({ ok: true, id: eliminada.id, nombre: eliminada.nombre })
}

export async function reordenarCategorias(req, res) {
	const ids = Array.isArray(req.body?.ids) ? req.body.ids.map(Number).filter(Number.isInteger) : []
	if (!ids.length) throw new ErrorValidacion('Falta el nuevo orden')
	res.json(await categorias.reordenar(ids))
}

/* ------------------------------ Ajustes ------------------------------ */

export async function guardarAjustes(req, res) {
	res.json(await ajustes.guardar(req.body ?? {}))
}

/* ------------------------------ Imagenes ----------------------------- */

const TIPOS = ['image/jpeg', 'image/png', 'image/webp', 'image/avif']

/* En memoria: el archivo pasa por sharp y de ahi al almacenamiento, sin tocar disco temporal */
export const subida = multer({
	storage: multer.memoryStorage(),
	limits: { fileSize: config.maxImagenMb * 1024 * 1024, files: 1 },
	fileFilter: (req, archivo, cb) => {
		if (!TIPOS.includes(archivo.mimetype)) {
			return cb(new ErrorValidacion('Solo se aceptan imagenes JPG, PNG, WEBP o AVIF'))
		}
		cb(null, true)
	},
}).single('imagen')

export async function subirImagen(req, res) {
	if (!req.file) throw new ErrorValidacion('No llego ninguna imagen')

	const carpeta = req.query.carpeta === 'categorias' ? 'categorias' : 'productos'
	res.status(201).json(await guardarImagen(req.file.buffer, carpeta))
}

export default {
	resumen, listarProductos, obtenerProducto, crearProducto, actualizarProducto,
	actualizarProductoParcial, eliminarProducto, listarCategorias, crearCategoria,
	actualizarCategoria, eliminarCategoria, reordenarCategorias, guardarAjustes,
	subida, subirImagen,
}
