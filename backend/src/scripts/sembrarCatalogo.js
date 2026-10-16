process.env.SOLO_BASE_DATOS = '1'

const { transaccion, cerrarPool } = await import('../config/db.js')
const { crearSlug } = await import('../models/utilidades.js')
const { AJUSTES_POR_DEFECTO } = await import('../models/ajustes.js')
const { categorias, productos } = await import('../data/catalogoInicial.js')

/**
 * Carga el catalogo inicial (el del sitio anterior, ya reescrito).
 *
 *   npm run db:sembrar                 agrega lo que falte, no toca lo existente
 *   npm run db:sembrar -- --reemplazar sobrescribe los productos del catalogo inicial
 *
 * Se identifica cada registro por su slug, asi que repetirlo no duplica nada.
 * Los productos creados desde el panel nunca se tocan.
 */

const reemplazar = process.argv.includes('--reemplazar')

try {
	const resultado = await transaccion(async (consulta) => {
		const idsCategorias = {}
		let categoriasNuevas = 0
		let productosNuevos = 0
		let productosActualizados = 0

		for (const [indice, categoria] of categorias.entries()) {
			const { rows, rowCount } = await consulta(
				`INSERT INTO categorias (slug, nombre, descripcion, orden)
				 VALUES ($1, $2, $3, $4)
				 ON CONFLICT (slug) DO NOTHING
				 RETURNING id`,
				[categoria.slug, categoria.nombre, categoria.descripcion, indice + 1]
			)
			categoriasNuevas += rowCount
			idsCategorias[categoria.slug] = rows[0]?.id
				?? (await consulta('SELECT id FROM categorias WHERE slug = $1', [categoria.slug])).rows[0].id
		}

		for (const producto of productos) {
			const valores = [
				crearSlug(producto.nombre),
				producto.nombre,
				idsCategorias[producto.categoria] ?? null,
				producto.marca ?? null,
				producto.referencia ?? null,
				producto.resumen,
				producto.descripcion,
				JSON.stringify(producto.caracteristicas ?? []),
				JSON.stringify(producto.aplicaciones ?? []),
				JSON.stringify(producto.especificaciones ?? []),
				JSON.stringify(producto.variantes ?? []),
				JSON.stringify(producto.imagen ? [{ url: producto.imagen }] : []),
				Boolean(producto.destacado),
				Boolean(producto.nuevo),
			]

			const { rows } = await consulta(
				`INSERT INTO productos (slug, nombre, categoria_id, marca, referencia, resumen, descripcion,
					caracteristicas, aplicaciones, especificaciones, variantes, imagenes, destacado, nuevo)
				 VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
				 ON CONFLICT (slug) DO ${reemplazar
					? `UPDATE SET nombre = EXCLUDED.nombre, categoria_id = EXCLUDED.categoria_id, marca = EXCLUDED.marca,
						referencia = EXCLUDED.referencia, resumen = EXCLUDED.resumen, descripcion = EXCLUDED.descripcion,
						caracteristicas = EXCLUDED.caracteristicas, aplicaciones = EXCLUDED.aplicaciones,
						especificaciones = EXCLUDED.especificaciones, variantes = EXCLUDED.variantes,
						imagenes = EXCLUDED.imagenes, destacado = EXCLUDED.destacado, nuevo = EXCLUDED.nuevo,
						actualizado_en = NOW()`
					: 'NOTHING'}
				 RETURNING (xmax = 0) AS insertado`,
				valores
			)

			if (rows[0]?.insertado) productosNuevos++
			else if (rows[0]) productosActualizados++
		}

		await consulta(
			`INSERT INTO ajustes (clave, datos) VALUES ('negocio', $1) ON CONFLICT (clave) DO NOTHING`,
			[JSON.stringify(AJUSTES_POR_DEFECTO)]
		)

		return { categoriasNuevas, productosNuevos, productosActualizados }
	})

	console.log('\n  Catalogo inicial cargado:')
	console.log(`    - Categorias nuevas:     ${resultado.categoriasNuevas} de ${categorias.length}`)
	console.log(`    - Productos nuevos:      ${resultado.productosNuevos} de ${productos.length}`)
	if (reemplazar) console.log(`    - Productos reemplazados: ${resultado.productosActualizados}`)
	console.log('')
} catch (error) {
	console.error(`\n  No se pudo cargar el catalogo: ${error.message}`)
	if (error.code === '42P01') console.error('  Parece que faltan las tablas. Ejecuta primero:  npm run db:crear')
	console.error('')
	process.exitCode = 1
} finally {
	await cerrarPool()
}
