import { useContext, useEffect, useRef, useState } from 'react'
import { NegocioContext } from '../context/negocio'
import { CarritoContext } from '../context/carrito'

/** Datos de contacto del negocio */
export const useNegocio = () => useContext(NegocioContext)

/** Carrito de cotizacion (varios productos en un solo mensaje de WhatsApp) */
export const useCarrito = () => useContext(CarritoContext)

/**
 * Ejecuta una peticion y expone { datos, cargando, error, reintentar }.
 * Cancela la peticion anterior si cambian las dependencias.
 *
 * @param {(opciones: {signal: AbortSignal}) => Promise<any>} pedir
 * @param {Array} dependencias
 */
export function useConsulta(pedir, dependencias) {
  const [intento, setIntento] = useState(0)
  /* Cada respuesta se guarda con la clave de la peticion que la produjo */
  const clave = JSON.stringify([...dependencias, intento])
  const [estado, setEstado] = useState({ clave: null, datos: null, error: null })

  useEffect(() => {
    const control = new AbortController()

    pedir({ signal: control.signal })
      .then((datos) => setEstado({ clave, datos, error: null }))
      .catch((error) => {
        if (error.name !== 'AbortError') setEstado({ clave, datos: null, error })
      })

    return () => control.abort()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [clave])

  /*
   * "Cargando" se deduce, no se guarda: si la ultima respuesta no es de la
   * peticion actual, esta en camino. Mientras tanto se conservan los datos
   * anteriores para que la pagina no parpadee.
   */
  const cargando = estado.clave !== clave

  return {
    datos: estado.datos,
    cargando,
    error: cargando ? null : estado.error,
    reintentar: () => setIntento((n) => n + 1),
  }
}

/** Valor que solo se actualiza tras una pausa al escribir */
export function useRetraso(valor, ms = 300) {
  const [retrasado, setRetrasado] = useState(valor)

  useEffect(() => {
    const reloj = setTimeout(() => setRetrasado(valor), ms)
    return () => clearTimeout(reloj)
  }, [valor, ms])

  return retrasado
}

/** Titulo de la pestana */
export function useTitulo(titulo) {
  useEffect(() => {
    document.title = titulo
      ? `${titulo} | Comercializadora Gonzalez`
      : 'Comercializadora Gonzalez | Eléctricos y Ferretería'
  }, [titulo])
}

/**
 * Marca un elemento como visible la primera vez que entra en pantalla.
 * Base de las animaciones de aparicion al hacer scroll.
 */
export function useAlAparecer({ margen = '0px 0px -8% 0px' } = {}) {
  const ref = useRef(null)
  /* Navegadores sin IntersectionObserver: todo visible desde el inicio */
  const [visible, setVisible] = useState(() => !('IntersectionObserver' in window))

  useEffect(() => {
    const nodo = ref.current
    if (!nodo || visible) return

    const observador = new IntersectionObserver(
      ([entrada]) => {
        if (entrada.isIntersecting) {
          setVisible(true)
          observador.disconnect()
        }
      },
      { rootMargin: margen, threshold: 0.12 }
    )

    observador.observe(nodo)
    return () => observador.disconnect()
  }, [visible, margen])

  return [ref, visible]
}
