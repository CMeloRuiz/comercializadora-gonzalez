import { useEffect, useState } from 'react'
import { Link, NavLink, useLocation } from 'react-router-dom'
import { Clock, Mail, Menu, Phone, X } from 'lucide-react'
import { useNegocio } from '../../hooks'
import { IconoWhatsApp } from '../ui/IconosMarca'
import BuscadorGlobal from './BuscadorGlobal'
import BotonCarrito from '../carrito/BotonCarrito'
import logo from '../../assets/images/logo-color.webp'
import './Header.css'

const ENLACES = [
  { a: '/', texto: 'Inicio', fin: true },
  { a: '/productos', texto: 'Productos' },
  { a: '/nosotros', texto: 'Nosotros' },
  { a: '/contacto', texto: 'Contacto' },
]

function Header() {
  const negocio = useNegocio()
  const { pathname, search } = useLocation()
  const [abierto, setAbierto] = useState(false)
  const [conSombra, setConSombra] = useState(false)

  /* Cierra el menu movil al navegar (ajuste de estado en el render, sin efecto) */
  const ruta = pathname + search
  const [rutaAnterior, setRutaAnterior] = useState(ruta)
  if (ruta !== rutaAnterior) {
    setRutaAnterior(ruta)
    setAbierto(false)
  }

  useEffect(() => {
    const alDesplazar = () => setConSombra(window.scrollY > 12)
    alDesplazar()
    window.addEventListener('scroll', alDesplazar, { passive: true })
    return () => window.removeEventListener('scroll', alDesplazar)
  }, [])

  /* Bloquea el scroll del fondo con el menu movil abierto */
  useEffect(() => {
    document.body.style.overflow = abierto ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [abierto])

  const primeraLineaHorario = negocio.horario.split('\n')[0]

  return (
    <>
      <div className="barra-superior">
        <div className="contenedor barra-superior__contenido">
          <div className="barra-superior__grupo">
            <a href={negocio.enlaceTelefono} className="barra-superior__item">
              <Phone aria-hidden="true" /> {negocio.telefono}
            </a>
            <a href={`mailto:${negocio.correo}`} className="barra-superior__item barra-superior__item--correo">
              <Mail aria-hidden="true" /> {negocio.correo}
            </a>
          </div>
          <p className="barra-superior__item barra-superior__item--horario">
            <Clock aria-hidden="true" /> {primeraLineaHorario}
          </p>
        </div>
      </div>

      <header className={`header${conSombra ? ' header--sombra' : ''}`}>
        <div className="contenedor header__contenido">
          <Link to="/" className="header__logo" aria-label="Comercializadora Gonzalez, ir al inicio">
            <img src={logo} alt="Comercializadora Gonzalez S.A.S." width="186" height="72" />
          </Link>

          <nav className="header__nav" aria-label="Principal">
            {ENLACES.map((enlace) => (
              <NavLink
                key={enlace.a}
                to={enlace.a}
                end={enlace.fin}
                className={({ isActive }) => `header__enlace${isActive ? ' header__enlace--activo' : ''}`}
              >
                {enlace.texto}
              </NavLink>
            ))}
          </nav>

          <div className="header__acciones">
            <BuscadorGlobal className="header__buscador" />
            <BotonCarrito className="header__carrito" />
            <a href={negocio.enlaceWhatsappGeneral} target="_blank" rel="noreferrer" className="btn btn--whatsapp btn--pequeno header__cta">
              <IconoWhatsApp /> <span className="header__cta-texto">Cotizar</span>
            </a>
            <button
              type="button"
              className="header__menu-btn"
              aria-label={abierto ? 'Cerrar menú' : 'Abrir menú'}
              aria-expanded={abierto}
              onClick={() => setAbierto((v) => !v)}
            >
              {abierto ? <X /> : <Menu />}
            </button>
          </div>
        </div>
      </header>

      {/* ---- Menu movil ---- */}
      <div className={`menu-movil${abierto ? ' menu-movil--abierto' : ''}`} aria-hidden={!abierto}>
        <button type="button" className="menu-movil__fondo" tabIndex={-1} aria-label="Cerrar menú" onClick={() => setAbierto(false)} />
        <div className="menu-movil__panel">
          <BuscadorGlobal className="menu-movil__buscador" />
          <nav className="menu-movil__nav" aria-label="Menú móvil">
            {ENLACES.map((enlace, i) => (
              <NavLink
                key={enlace.a}
                to={enlace.a}
                end={enlace.fin}
                tabIndex={abierto ? 0 : -1}
                style={{ transitionDelay: abierto ? `${80 + i * 50}ms` : '0ms' }}
                className={({ isActive }) => `menu-movil__enlace${isActive ? ' menu-movil__enlace--activo' : ''}`}
              >
                {enlace.texto}
              </NavLink>
            ))}
          </nav>
          <div className="menu-movil__pie">
            <a href={negocio.enlaceWhatsappGeneral} target="_blank" rel="noreferrer" className="btn btn--whatsapp btn--bloque" tabIndex={abierto ? 0 : -1}>
              <IconoWhatsApp /> Escríbenos por WhatsApp
            </a>
            <a href={negocio.enlaceTelefono} className="btn btn--contorno btn--bloque" tabIndex={abierto ? 0 : -1}>
              <Phone /> {negocio.telefono}
            </a>
          </div>
        </div>
      </div>
    </>
  )
}

export default Header
