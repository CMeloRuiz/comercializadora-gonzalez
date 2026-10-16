/**
 * "Panel LED 60x60 Ñandú" -> "panel-led-60x60-nandu"
 * Igual que en el backend, para que la vista previa del enlace coincida.
 *
 * Mientras se escribe se conserva el guion final, o no se podria teclear uno.
 */
export function crearSlug(texto, { conservarGuionFinal = false } = {}) {
  const slug = String(texto ?? '')
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+/, '')
    .slice(0, 150)

  return conservarGuionFinal ? slug : slug.replace(/-+$/, '')
}

const FORMATO_RELATIVO = new Intl.RelativeTimeFormat('es', { numeric: 'auto' })

/** "hace 5 minutos", "ayer", "hace 3 días" */
export function tiempoRelativo(fecha) {
  const segundos = (new Date(fecha).getTime() - Date.now()) / 1000
  const tramos = [[60, 'second'], [3600, 'minute'], [86400, 'hour'], [604800, 'day'], [2629800, 'week'], [31557600, 'month'], [Infinity, 'year']]
  const divisores = { second: 1, minute: 60, hour: 3600, day: 86400, week: 604800, month: 2629800, year: 31557600 }
  for (const [limite, unidad] of tramos) {
    if (Math.abs(segundos) < limite) return FORMATO_RELATIVO.format(Math.round(segundos / divisores[unidad]), unidad)
  }
  return ''
}

export const formatoPesos = new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 })
