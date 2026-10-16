import multer from 'multer'

/** Ruta que no existe */
export function noEncontrado(req, res) {
	res.status(404).json({ error: `No existe ${req.method} ${req.originalUrl}` })
}

/**
 * Manejador final de errores.
 *
 * Al cliente solo le llega un mensaje util; el detalle queda en el log para no
 * filtrar rutas internas ni trazas.
 */
export function manejadorErrores(error, req, res, next) {
	if (res.headersSent) return next(error)

	if (error instanceof multer.MulterError) {
		const grande = error.code === 'LIMIT_FILE_SIZE'
		return res.status(400).json({
			error: grande ? 'La imagen supera el tamano maximo permitido' : 'No se pudo procesar el archivo',
		})
	}

	/* JSON mal formado en el cuerpo */
	if (error.type === 'entity.parse.failed') {
		return res.status(400).json({ error: 'El cuerpo de la peticion no es JSON valido' })
	}

	/* Slug u otra restriccion UNIQUE repetida */
	if (error.code === '23505') {
		return res.status(409).json({ error: 'Ya existe un registro con ese identificador' })
	}

	/* Errores con status propio (validacion, no encontrado, base de datos caida) */
	if ([400, 404, 409, 503].includes(error.status)) {
		if (error.status === 503) console.error('[error] Servicio:', error.causa?.message ?? error.message)
		return res.status(error.status).json({ error: error.message, ...(error.campos ? { campos: error.campos } : {}) })
	}

	console.error('[error]', error)
	res.status(500).json({ error: 'Error interno del servidor' })
}

export default { noEncontrado, manejadorErrores }
