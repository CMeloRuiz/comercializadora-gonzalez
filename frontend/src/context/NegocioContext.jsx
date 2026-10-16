import { useEffect, useMemo, useState } from 'react'
import { catalogo } from '../lib/api'
import { enlaceWhatsApp } from '../lib/whatsapp'
import { NEGOCIO_POR_DEFECTO, NegocioContext } from './negocio'


export function NegocioProvider({ children }) {
  const [datos, setDatos] = useState(NEGOCIO_POR_DEFECTO)

  useEffect(() => {
    const control = new AbortController()
    catalogo
      .ajustes({ signal: control.signal })
      .then((ajustes) => setDatos({ ...NEGOCIO_POR_DEFECTO, ...ajustes }))
      .catch(() => {})
    return () => control.abort()
  }, [])

  const valor = useMemo(() => {
    const direccionCompleta = [datos.direccion, datos.ciudad].filter(Boolean).join(', ')
    return {
      ...datos,
      direccionCompleta,
      enlaceWhatsappGeneral: enlaceWhatsApp(datos.whatsapp, datos.mensajeWhatsapp),
      enlaceTelefono: `tel:${String(datos.telefono).replace(/[^\d+]/g, '')}`,
      enlaceMapa: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${direccionCompleta}, Colombia`)}`,
    }
  }, [datos])

  return <NegocioContext.Provider value={valor}>{children}</NegocioContext.Provider>
}
