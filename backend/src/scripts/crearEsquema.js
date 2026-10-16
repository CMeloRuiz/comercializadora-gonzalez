process.env.SOLO_BASE_DATOS = '1'

const { readFile } = await import('node:fs/promises')
const { dirname, join } = await import('node:path')
const { fileURLToPath } = await import('node:url')
const { consultar, cerrarPool } = await import('../config/db.js')

/**
 * Aplica db/schema.sql sobre la base de DATABASE_URL.
 *
 *   npm run db:crear
 *
 * Es idempotente (CREATE ... IF NOT EXISTS): repetirlo no borra datos.
 */

const ESQUEMA = join(dirname(fileURLToPath(import.meta.url)), '..', '..', 'db', 'schema.sql')

try {
	console.log('\n  Aplicando db/schema.sql...')
	await consultar(await readFile(ESQUEMA, 'utf8'))

	const { rows } = await consultar(
		`SELECT table_name, COUNT(*)::int AS columnas
		 FROM information_schema.columns
		 WHERE table_schema = 'public' AND table_name IN ('categorias', 'productos', 'ajustes')
		 GROUP BY table_name ORDER BY table_name`
	)

	if (rows.length < 3) {
		console.error('\n  Faltan tablas despues de aplicar el esquema.\n')
		process.exitCode = 1
	} else {
		for (const t of rows) console.log(`    - ${t.table_name.padEnd(12)} ${t.columnas} columnas`)
		console.log('\n  Esquema listo. Siguiente paso:  npm run db:sembrar\n')
	}
} catch (error) {
	console.error(`\n  No se pudo aplicar el esquema: ${error.message}\n`)
	process.exitCode = 1
} finally {
	await cerrarPool()
}
