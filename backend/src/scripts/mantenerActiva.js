process.env.SOLO_BASE_DATOS = '1'

const { consultar, cerrarPool } = await import('../config/db.js')

/**
 * Mantiene despierto el proyecto de Supabase.
 *
 *   npm run db:ping
 *
 * En el plan gratuito, Supabase pausa un proyecto tras unos 7 dias sin
 * actividad: los datos no se pierden, pero el sitio responde error hasta que
 * alguien lo restaura a mano desde el panel.
 *
 * Una consulta cualquiera cuenta como actividad, asi que basta con esto. Si el
 * sitio ya esta publicado y recibe visitas, no hace falta: cada visita consulta
 * el catalogo. Sirve sobre todo mientras el sitio aun no esta en linea.
 *
 * Para automatizarlo esta .github/workflows/mantener-base-activa.yml
 */

const inicio = Date.now()

try {
	const { rows } = await consultar(
		`SELECT NOW() AS hora,
		        (SELECT COUNT(*)::int FROM productos) AS productos,
		        (SELECT COUNT(*)::int FROM categorias) AS categorias`
	)

	const { hora, productos, categorias } = rows[0]
	console.log(`  Base despierta en ${Date.now() - inicio} ms`)
	console.log(`  ${productos} productos · ${categorias} categorias · ${hora.toISOString()}`)
} catch (error) {
	console.error(`\n  No se pudo contactar la base: ${error.message}`)
	if (error.code === '42P01') console.error('  Faltan las tablas. Ejecuta antes:  npm run db:crear')
	console.error('')
	process.exitCode = 1
} finally {
	await cerrarPool()
}
