/**
 * Utilidades compartidas por los modelos.
 */

/** "Panel LED 60x60 Ñandú" -> "panel-led-60x60-nandu" */
export function crearSlug(texto) {
	return String(texto ?? '')
		.normalize('NFD')
		.replace(/[̀-ͯ]/g, '')
		.toLowerCase()
		.replace(/[^a-z0-9]+/g, '-')
		.replace(/^-+|-+$/g, '')
		.slice(0, 150) || 'item'
}

/**
 * Expresion SQL que pasa un texto a minusculas y sin tildes, para que buscar
 * "iluminacion" encuentre "Iluminación". Se hace con translate() y no con la
 * extension unaccent para no depender de que este instalada.
 */
export function sinTildesSql(expresion) {
	return `translate(lower(${expresion}), 'áéíóúüñàèìòù', 'aeiouunaeiou')`
}

/** Mismo tratamiento del lado de JS, para el termino buscado */
export function sinTildes(texto) {
	return String(texto ?? '')
		.normalize('NFD')
		.replace(/[̀-ͯ]/g, '')
		.toLowerCase()
		.trim()
}

/** Error de validacion con el detalle por campo, para marcarlos en el panel */
export class ErrorValidacion extends Error {
	constructor(mensaje, campos = {}) {
		super(mensaje)
		this.name = 'ErrorValidacion'
		this.status = 400
		this.campos = campos
	}
}

export class ErrorNoEncontrado extends Error {
	constructor(mensaje) {
		super(mensaje)
		this.name = 'ErrorNoEncontrado'
		this.status = 404
	}
}

/**
 * Devuelve un slug libre en la tabla, anadiendo -2, -3... si ya existe.
 *
 * @param {Function} consultar
 * @param {'productos'|'categorias'} tabla  Nunca viene del usuario
 * @param {string} base
 * @param {number} [excluirId]  El propio registro al editar
 */
export async function slugDisponible(consultar, tabla, base, excluirId = null) {
	const slug = crearSlug(base)
	const { rows } = await consultar(
		`SELECT slug FROM ${tabla} WHERE (slug = $1 OR slug LIKE $1 || '-%') AND ($2::int IS NULL OR id <> $2)`,
		[slug, excluirId]
	)
	const usados = new Set(rows.map((r) => r.slug))
	if (!usados.has(slug)) return slug

	let n = 2
	while (usados.has(`${slug}-${n}`)) n++
	return `${slug}-${n}`
}
