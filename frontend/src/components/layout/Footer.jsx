import { Link } from 'react-router-dom'
import { ArrowUpRight, Clock, Mail, MapPin, Phone } from 'lucide-react'
import { catalogo } from '../../lib/api'
import { useConsulta, useNegocio } from '../../hooks'
import { IconoFacebook, IconoInstagram, IconoWhatsApp } from '../ui/IconosMarca'
import logoBlanco from '../../assets/images/logo-blanco.webp'
import './Footer.css'

function Footer() {
  const negocio = useNegocio()
  const { datos: categorias } = useConsulta((opciones) => catalogo.categorias(opciones), [])
  const anio = new Date().getFullYear()

  return (
    <footer className="footer">
      {/* ---- Franja de llamado a la accion ---- */}
      <div className="contenedor">
        <div className="footer__cta">
          <div>
            <h2 className="footer__cta-titulo">¿No encuentras lo que buscas?</h2>
            <p className="footer__cta-texto">
              Tenemos más referencias de las que ves en línea. Cuéntanos qué necesitas y te lo conseguimos.
            </p>
          </div>
          <a href={negocio.enlaceWhatsappGeneral} target="_blank" rel="noreferrer" className="btn btn--whatsapp btn--grande">
            <IconoWhatsApp /> Hablar con un asesor
          </a>
        </div>
      </div>

      <div className="contenedor footer__rejilla">
        <div className="footer__marca">
          <img src={logoBlanco} alt="Comercializadora Gonzalez S.A.S." width="208" height="80" loading="lazy" />
          <p>
            Eléctricos y ferretería con asesoría real. Iluminación LED, material eléctrico y herramientas para tu hogar,
            negocio u obra.
          </p>
          <div className="footer__redes">
            <a href={negocio.enlaceWhatsappGeneral} target="_blank" rel="noreferrer" aria-label="WhatsApp">
              <IconoWhatsApp />
            </a>
            {negocio.facebook && (
              <a href={negocio.facebook} target="_blank" rel="noreferrer" aria-label="Facebook">
                <IconoFacebook />
              </a>
            )}
            {negocio.instagram && (
              <a href={negocio.instagram} target="_blank" rel="noreferrer" aria-label="Instagram">
                <IconoInstagram />
              </a>
            )}
          </div>
        </div>

        <div className="footer__columna">
          <h3>Tienda</h3>
          <ul>
            <li><Link to="/productos">Todos los productos</Link></li>
            {categorias?.map((categoria) => (
              <li key={categoria.id}>
                <Link to={`/productos?categoria=${categoria.slug}`}>{categoria.nombre}</Link>
              </li>
            ))}
          </ul>
        </div>

        <div className="footer__columna">
          <h3>Empresa</h3>
          <ul>
            <li><Link to="/nosotros">Nosotros</Link></li>
            <li><Link to="/contacto">Contacto</Link></li>
            <li><Link to="/#como-comprar">Cómo comprar</Link></li>
          </ul>
        </div>

        <div className="footer__columna footer__columna--contacto">
          <h3>Contacto</h3>
          <ul>
            <li>
              <MapPin aria-hidden="true" />
              <a href={negocio.enlaceMapa} target="_blank" rel="noreferrer">{negocio.direccionCompleta}</a>
            </li>
            <li>
              <Phone aria-hidden="true" />
              <a href={negocio.enlaceTelefono}>{negocio.telefono}</a>
            </li>
            <li>
              <Mail aria-hidden="true" />
              <a href={`mailto:${negocio.correo}`}>{negocio.correo}</a>
            </li>
            <li>
              <Clock aria-hidden="true" />
              <span className="footer__horario">{negocio.horario}</span>
            </li>
          </ul>
        </div>
      </div>

      <div className="footer__legal">
        <div className="contenedor footer__legal-contenido">
          <p>© {anio} {negocio.nombreComercial} Todos los derechos reservados.</p>
          <p>
            Desarrollado por{' '}
            <a href="https://coldevia.onrender.com/" target="_blank" rel="noreferrer">
              ColdevIA <ArrowUpRight aria-hidden="true" />
            </a>
          </p>
        </div>
      </div>
    </footer>
  )
}

export default Footer
