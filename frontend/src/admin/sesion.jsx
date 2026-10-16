import { useEffect, useRef, useState } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { api, cerrarSesion, EVENTO_SESION, sesion } from './api'

/* Minutos sin actividad tras los que se cierra la sesion */
export const MINUTOS_INACTIVIDAD = 30

const SENALES = ['mousedown', 'keydown', 'wheel', 'touchstart', 'pointermove']

/**
 * Cierra la sesion tras un rato sin actividad. El temporizador se rearma con
 * cada senal del usuario, como mucho una vez por segundo.
 */
function useInactividad(alCaducar, activo) {
  const avisar = useRef(alCaducar)

  useEffect(() => {
    avisar.current = alCaducar
  }, [alCaducar])

  useEffect(() => {
    if (!activo) return
    const limite = MINUTOS_INACTIVIDAD * 60 * 1000
    let reloj
    let ultima = 0

    const rearmar = () => {
      clearTimeout(reloj)
      reloj = setTimeout(() => avisar.current(), limite)
    }
    const alHaberActividad = () => {
      const ahora = Date.now()
      if (ahora - ultima < 1000) return
      ultima = ahora
      rearmar()
    }

    rearmar()
    SENALES.forEach((s) => window.addEventListener(s, alHaberActividad, { passive: true }))
    return () => {
      clearTimeout(reloj)
      SENALES.forEach((s) => window.removeEventListener(s, alHaberActividad))
    }
  }, [activo])
}

/**
 * Envuelve las paginas privadas del panel. Concentra las formas de perder la
 * sesion para que ninguna pagina tenga que ocuparse:
 *  1. Al entrar se pregunta al servidor si el token guardado sigue valido.
 *  2. Cualquier respuesta 401 dispara el evento de sesion caducada.
 *  3. Sin actividad durante un rato se cierra sola.
 */
export function RutaProtegida({ children }) {
  const ubicacion = useLocation()
  const [estado, setEstado] = useState(() => (sesion.leer() ? 'comprobando' : 'fuera'))
  const [motivo, setMotivo] = useState(null)

  useEffect(() => {
    if (estado !== 'comprobando') return
    let vigente = true
    api.verificarSesion()
      .then(() => vigente && setEstado('dentro'))
      .catch((error) => {
        if (!vigente) return
        /* Sin conexion no se echa al usuario: se le deja entrar y cada pantalla mostrara el error */
        if (error.estado === 0) return setEstado('dentro')
        sesion.borrar()
        setEstado('fuera')
      })
    return () => { vigente = false }
  }, [estado])

  useEffect(() => {
    const alCaducar = () => {
      setMotivo((previo) => previo ?? 'caducada')
      setEstado('fuera')
    }
    window.addEventListener(EVENTO_SESION, alCaducar)
    return () => window.removeEventListener(EVENTO_SESION, alCaducar)
  }, [])

  useInactividad(() => {
    setMotivo('inactividad')
    cerrarSesion()
  }, estado === 'dentro')

  if (estado === 'comprobando') {
    return (
      <div className="adm adm-pantalla-carga">
        <span className="adm-spinner adm-spinner--grande" aria-hidden="true" />
        <p>Comprobando la sesión...</p>
      </div>
    )
  }

  if (estado === 'fuera') {
    return <Navigate to="/admin" replace state={{ motivo, desde: ubicacion.pathname }} />
  }

  return children
}
