import { API, limpiarCacheCatalogo } from '../lib/api'
import { pedirConReintentos } from '../lib/peticion'

/**
 * ===== Cliente de la API administrativa =====
 *
 * Concentra la URL base, el token y el manejo de errores para que las
 * paginas del panel solo se ocupen de su interfaz.
 */

const LLAVE_TOKEN = 'cg_admin_token'
const LLAVE_USUARIO = 'cg_admin_usuario'

/* Aviso interno de que la sesion dejo de valer, para redirigir al login */
export const EVENTO_SESION = 'cg:sesion-caducada'

/*
 * El token vive en sessionStorage: dura mientras la pestana este abierta y el
 * navegador lo descarta al cerrarla. Es lo esperable en un panel que puede
 * usarse en un equipo compartido.
 */
export const sesion = {
  leer: () => sessionStorage.getItem(LLAVE_TOKEN),
  usuario: () => sessionStorage.getItem(LLAVE_USUARIO) ?? 'admin',
  guardar: (token, usuario) => {
    sessionStorage.setItem(LLAVE_TOKEN, token)
    sessionStorage.setItem(LLAVE_USUARIO, usuario)
  },
  borrar: () => {
    sessionStorage.removeItem(LLAVE_TOKEN)
    sessionStorage.removeItem(LLAVE_USUARIO)
  },
}

export function cerrarSesion() {
  sesion.borrar()
  window.dispatchEvent(new CustomEvent(EVENTO_SESION))
}

export class ErrorApi extends Error {
  constructor(mensaje, estado, campos) {
    super(mensaje)
    this.name = 'ErrorApi'
    this.estado = estado
    /* Errores por campo que devuelve la validacion del backend */
    this.campos = campos ?? {}
  }
}

async function llamar(ruta, { metodo = 'GET', cuerpo, autenticado = true, signal, idempotente, alReintentar } = {}) {
  const cabeceras = {}
  const esFormulario = cuerpo instanceof FormData

  if (autenticado) {
    const token = sesion.leer()
    if (token) cabeceras.Authorization = `Bearer ${token}`
  }
  /* Con FormData el navegador pone el Content-Type con su boundary */
  if (cuerpo && !esFormulario) cabeceras['Content-Type'] = 'application/json'

  let respuesta
  try {
    /*
     * Reintenta solo cuando no se logro conectar (API arrancando o
     * despertando). Si el servidor contesta, aunque sea un error, no se
     * repite: la peticion ya llego y podria duplicar una escritura.
     */
    respuesta = await pedirConReintentos(
      `${API}${ruta}`,
      {
        method: metodo,
        headers: cabeceras,
        body: esFormulario ? cuerpo : cuerpo ? JSON.stringify(cuerpo) : undefined,
        signal,
        /* El panel siempre necesita el dato recien guardado, nunca una copia en cache */
        cache: 'no-store',
      },
      { idempotente, alReintentar }
    )
  } catch (error) {
    if (error.name === 'AbortError') throw error
    throw new ErrorApi('No se pudo conectar con el servidor. Revisa tu conexión o que la API esté encendida.', 0)
  }

  const datos = await respuesta.json().catch(() => null)

  if (!respuesta.ok) {
    if (respuesta.status === 401 && autenticado) cerrarSesion()

    /*
     * 502/503/504 no los manda nuestra API: los pone quien esta delante (el
     * proxy en desarrollo, Render en produccion) cuando no logra hablar con
     * ella. Se traduce al mismo mensaje que un fallo de conexion, que es lo
     * que de verdad esta pasando.
     */
    const sinServidor = [502, 503, 504].includes(respuesta.status)
    throw new ErrorApi(
      datos?.error || (sinServidor ? 'El servidor no responde. Puede estar arrancando: espera unos segundos y vuelve a intentar.' : `Error ${respuesta.status}`),
      respuesta.status,
      datos?.campos
    )
  }

  /* Cualquier escritura deja viejo lo que el sitio tenia en memoria */
  if (metodo !== 'GET') limpiarCacheCatalogo()

  return datos
}

const consulta = (parametros) => {
  const limpios = Object.entries(parametros).filter(([, v]) => v)
  return limpios.length ? `?${new URLSearchParams(limpios)}` : ''
}

export const api = {
  /*
   * El login no crea ni modifica nada: repetirlo es inofensivo. Por eso es la
   * unica escritura que insiste tambien cuando el intermediario contesta 502,
   * que es lo que devuelve Render mientras la API duerme. Antes ese primer
   * intento moria con "No se pudo conectar" y habia que reintentar a mano.
   */
  login: (usuario, clave, { alReintentar } = {}) =>
    llamar('/api/auth/login', {
      metodo: 'POST',
      cuerpo: { usuario, clave },
      autenticado: false,
      idempotente: true,
      alReintentar,
    }),
  verificarSesion: () => llamar('/api/auth/verificar'),

  /*
   * Toque sin efectos para ir despertando la API en cuanto se abre el login,
   * mientras el usuario escribe sus datos. Si falla, da igual: solo adelanta
   * trabajo.
   */
  despertar: (signal) => llamar('/api/salud', { autenticado: false, signal }),

  resumen: (opciones) => llamar('/api/admin/resumen', opciones),

  productos: (filtros = {}, opciones) => llamar(`/api/admin/productos${consulta(filtros)}`, opciones),
  producto: (id, opciones) => llamar(`/api/admin/productos/${id}`, opciones),
  crearProducto: (datos) => llamar('/api/admin/productos', { metodo: 'POST', cuerpo: datos }),
  guardarProducto: (id, datos) => llamar(`/api/admin/productos/${id}`, { metodo: 'PUT', cuerpo: datos }),
  cambiarProducto: (id, cambios) => llamar(`/api/admin/productos/${id}`, { metodo: 'PATCH', cuerpo: cambios }),
  eliminarProducto: (id) => llamar(`/api/admin/productos/${id}`, { metodo: 'DELETE' }),

  categorias: (opciones) => llamar('/api/admin/categorias', opciones),
  crearCategoria: (datos) => llamar('/api/admin/categorias', { metodo: 'POST', cuerpo: datos }),
  guardarCategoria: (id, datos) => llamar(`/api/admin/categorias/${id}`, { metodo: 'PUT', cuerpo: datos }),
  eliminarCategoria: (id) => llamar(`/api/admin/categorias/${id}`, { metodo: 'DELETE' }),
  ordenarCategorias: (ids) => llamar('/api/admin/categorias/orden', { metodo: 'PUT', cuerpo: { ids } }),

  ajustes: (opciones) => llamar('/api/ajustes', { ...opciones, autenticado: false }),
  guardarAjustes: (datos) => llamar('/api/admin/ajustes', { metodo: 'PUT', cuerpo: datos }),

  subirImagen: (archivo, carpeta = 'productos') => {
    const formulario = new FormData()
    formulario.append('imagen', archivo)
    return llamar(`/api/admin/imagenes?carpeta=${carpeta}`, { metodo: 'POST', cuerpo: formulario })
  },
}

export default api
