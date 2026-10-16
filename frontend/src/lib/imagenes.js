import { API } from './api'

/**
 * Convierte la URL guardada en la base en una que el navegador pueda cargar.
 *
 *  - "https://res.cloudinary.com/..."  imagen subida en produccion: tal cual
 *  - "/uploads/..."                     subida en desarrollo: vive en la API
 *  - "/productos/..."                   catalogo inicial: vive en este sitio
 */
export function resolverImagen(url) {
  if (!url) return null
  if (url.startsWith('/uploads/')) return `${API}${url}`
  return url
}

/**
 * En Cloudinary se puede pedir la imagen ya reducida al tamano en que se
 * muestra: una tarjeta no necesita la foto de 1600 px.
 *
 * Con Supabase Storage se sirve tal cual: el backend ya la guardo optimizada
 * en WebP y sus transformaciones de imagen solo estan en los planes de pago.
 */
export function imagenAncho(url, ancho) {
  const resuelta = resolverImagen(url)
  if (!resuelta?.includes('res.cloudinary.com') || !resuelta.includes('/upload/')) return resuelta
  return resuelta.replace('/upload/', `/upload/f_auto,q_auto,c_limit,w_${ancho}/`)
}

/** Portada de un producto (primera imagen) */
export function portada(producto, ancho = 600) {
  return imagenAncho(producto?.imagenes?.[0]?.url, ancho)
}
