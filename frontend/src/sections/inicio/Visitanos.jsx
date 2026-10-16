import { Clock, MapPin, Navigation, Phone } from 'lucide-react'
import { useNegocio } from '../../hooks'
import { IconoWhatsApp } from '../../components/ui/IconosMarca'
import MapaUbicacion from '../../components/ui/MapaUbicacion'
import Reveal from '../../components/ui/Reveal'
import './Visitanos.css'

function Visitanos() {
  const negocio = useNegocio()

  return (
    <section className="seccion visitanos">
      <div className="contenedor visitanos__rejilla">
        <Reveal desde="izquierda" className="visitanos__tarjeta">
          <p className="seccion__antetitulo">Visítanos</p>
          <h2 className="seccion__titulo">Te esperamos en nuestra tienda</h2>

          <ul className="visitanos__datos">
            <li>
              <span className="visitanos__icono"><MapPin aria-hidden="true" /></span>
              <div>
                <strong>Dirección</strong>
                <span>{negocio.direccionCompleta}</span>
              </div>
            </li>
            <li>
              <span className="visitanos__icono"><Clock aria-hidden="true" /></span>
              <div>
                <strong>Horario de atención</strong>
                <span className="visitanos__multilinea">{negocio.horario}</span>
              </div>
            </li>
            <li>
              <span className="visitanos__icono"><Phone aria-hidden="true" /></span>
              <div>
                <strong>Teléfono</strong>
                <a href={negocio.enlaceTelefono}>{negocio.telefono}</a>
              </div>
            </li>
          </ul>

          <div className="visitanos__acciones">
            <a href={negocio.enlaceMapa} target="_blank" rel="noreferrer" className="btn btn--oscuro">
              <Navigation /> Cómo llegar
            </a>
            <a href={negocio.enlaceWhatsappGeneral} target="_blank" rel="noreferrer" className="btn btn--whatsapp">
              <IconoWhatsApp /> WhatsApp
            </a>
          </div>
        </Reveal>

        <Reveal desde="derecha" className="visitanos__mapa">
          <MapaUbicacion />
        </Reveal>
      </div>
    </section>
  )
}

export default Visitanos
