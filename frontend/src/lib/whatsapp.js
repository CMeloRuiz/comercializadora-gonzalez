/**
 * ===== Enlaces de WhatsApp =====
 *
 * El flujo de venta del negocio: el cliente elige un producto y llega a
 * WhatsApp con un mensaje ya escrito que dice que producto le interesa.
 */

const SITIO = (import.meta.env.VITE_SITIO_URL || '').replace(/\/$/, '')

function urlSitio(ruta) {
  const base = SITIO || (typeof window !== 'undefined' ? window.location.origin : '')
  return `${base}${ruta}`
}

export function enlaceWhatsApp(numero, mensaje) {
  const digitos = String(numero || '').replace(/\D/g, '')
  return `https://wa.me/${digitos}?text=${encodeURIComponent(mensaje)}`
}

/**
 * Mensaje prellenado para cotizar un producto.
 *
 * @param {object} producto
 * @param {string} [variante]  Presentacion elegida en el detalle
 */
export function mensajeCotizacion(producto, variante) {
  const lineas = [
    '¡Hola, Comercializadora Gonzalez! 👋',
    'Quiero cotizar este producto:',
    '',
    `🛒 *${producto.nombre}*`,
  ]

  if (variante) lineas.push(`• Presentación: ${variante}`)
  if (producto.marca) lineas.push(`• Marca: ${producto.marca}`)
  if (producto.referencia) lineas.push(`• Ref.: ${producto.referencia}`)

  lineas.push('• Cantidad: ', '', `Enlace: ${urlSitio(`/productos/${producto.slug}`)}`)

  return lineas.join('\n')
}

export function enlaceCotizacion(numero, producto, variante) {
  return enlaceWhatsApp(numero, mensajeCotizacion(producto, variante))
}

/**
 * Mensaje con todo lo que el visitante junto en el carrito.
 *
 * @param {Array<{nombre: string, variante?: string, cantidad: number, referencia?: string}>} lineas
 */
export function mensajeCarrito(lineas) {
  const articulos = lineas.reduce((suma, l) => suma + l.cantidad, 0)

  const texto = [
    '¡Hola, Comercializadora Gonzalez! 👋',
    `Quiero cotizar ${lineas.length === 1 ? 'este producto' : 'estos productos'}:`,
    '',
  ]

  lineas.forEach((linea, i) => {
    texto.push(`${i + 1}. *${linea.nombre}*`)
    if (linea.variante) texto.push(`   • Presentación: ${linea.variante}`)
    if (linea.referencia) texto.push(`   • Ref.: ${linea.referencia}`)
    texto.push(`   • Cantidad: ${linea.cantidad}`)
  })

  texto.push('', `Total: ${articulos} ${articulos === 1 ? 'artículo' : 'artículos'}`, '', `Catálogo: ${urlSitio('/productos')}`)

  return texto.join('\n')
}

export function enlaceCarrito(numero, lineas) {
  return enlaceWhatsApp(numero, mensajeCarrito(lineas))
}
