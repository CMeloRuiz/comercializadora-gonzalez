import { useState } from 'react'
import { MapPin } from 'lucide-react'
import { useAlAparecer, useNegocio } from '../../hooks'
import './MapaUbicacion.css'

/**
 * Mapa de Google embebido (sin clave de API).
 *
 * El iframe pesa bastante, asi que solo se carga cuando el mapa entra en
 * pantalla; mientras tanto se ve un marcador de posicion.
 */
function MapaUbicacion({ className = '' }) {
  const negocio = useNegocio()
  const [ref, visible] = useAlAparecer({ margen: '200px' })
  const [cargado, setCargado] = useState(false)
  const consulta = encodeURIComponent(`${negocio.direccionCompleta}, Colombia`)

  return (
    <div ref={ref} className={`mapa ${className}`}>
      {!cargado && (
        <div className="mapa__marcador">
          <MapPin aria-hidden="true" />
          <span>Cargando mapa...</span>
        </div>
      )}
      {visible && (
        <iframe
          title={`Ubicación de ${negocio.nombreComercial}`}
          src={`https://www.google.com/maps?q=${consulta}&output=embed`}
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          onLoad={() => setCargado(true)}
        />
      )}
    </div>
  )
}

export default MapaUbicacion
