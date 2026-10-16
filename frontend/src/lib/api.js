import { pedirConReintentos } from './peticion'

/**
 * ===== Cliente de la API publica =====
 *
 * Las respuestas GET se guardan un minuto en memoria: volver del detalle al
 * catalogo, o del catalogo al inicio, se pinta al instante sin repetir peticiones.
 */

/*
 * Sin VITE_API_URL las peticiones salen al mismo origen del sitio. En
 * desarrollo eso lo recoge el proxy de Vite (ver vite.config.js) y lo manda al
 * backend: asi no hay CORS ni direcciones que se desincronicen. En produccion
 * hay que definirla con la URL del servicio de la API.
 */
export const API = (import.meta.env.VITE_API_URL || '').trim().replace(/\/$/, '')

if (import.meta.env.PROD && !API) {
	console.error(
		'[api] Falta VITE_API_URL en la compilacion: el sitio buscara la API en su propio dominio y no encontrara el catalogo.'
	)
}

const VIGENCIA_MS = 60_000
const cache = new Map()

export class ErrorApi extends Error {
  constructor(mensaje, estado) {
    super(mensaje)
    this.name = 'ErrorApi'
    this.estado = estado
  }
}

async function pedir(ruta, { signal } = {}) {
  const guardada = cache.get(ruta)
  if (guardada && Date.now() - guardada.hora < VIGENCIA_MS) return guardada.datos

  let respuesta
  try {
    /* Reintenta solo si no se pudo conectar: puede ser la API arrancando o despertando */
    respuesta = await pedirConReintentos(`${API}${ruta}`, { signal })
  } catch (error) {
    if (error.name === 'AbortError') throw error
    throw new ErrorApi('No pudimos conectar con el catálogo. Revisa tu conexión e intenta de nuevo.', 0)
  }

  const datos = await respuesta.json().catch(() => null)

  if (!respuesta.ok) {
    /* 502/503/504 los pone quien hace de intermediario cuando la API no responde */
    const sinServidor = [502, 503, 504].includes(respuesta.status)
    throw new ErrorApi(
      datos?.error || (sinServidor ? 'El catálogo no está disponible en este momento. Vuelve a intentarlo en unos segundos.' : 'Ocurrió un error al cargar la información'),
      respuesta.status
    )
  }

  cache.set(ruta, { datos, hora: Date.now() })
  return datos
}

function consulta(parametros) {
  const limpios = Object.entries(parametros).filter(([, v]) => v !== undefined && v !== null && v !== '' && v !== false)
  return limpios.length ? `?${new URLSearchParams(limpios)}` : ''
}

export const catalogo = {
  productos: (parametros = {}, opciones) => pedir(`/api/productos${consulta(parametros)}`, opciones),
  producto: (slug, opciones) => pedir(`/api/productos/${encodeURIComponent(slug)}`, opciones),
  categorias: (opciones) => pedir('/api/categorias', opciones),
  ajustes: (opciones) => pedir('/api/ajustes', opciones),
}

/** El panel llama a esto al guardar, para que el sitio no muestre datos viejos */
export function limpiarCacheCatalogo() {
  cache.clear()
}

export default catalogo
