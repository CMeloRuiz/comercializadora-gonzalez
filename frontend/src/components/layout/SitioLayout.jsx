import { useEffect } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import Header from './Header'
import Footer from './Footer'
import BotonWhatsAppFlotante from './BotonWhatsAppFlotante'
import CarritoProvider from '../../context/CarritoContext'
import PanelCarrito from '../carrito/PanelCarrito'

/** Estructura comun de todas las paginas publicas */
function SitioLayout() {
  const { pathname, hash } = useLocation()

  /*
   * Al cambiar de pagina la vista vuelve arriba (los filtros del catalogo no
   * cambian pathname). Con ancla (/#como-comprar) se espera a que la seccion
   * exista y se desplaza hasta ella.
   */
  useEffect(() => {
    if (!hash) {
      window.scrollTo({ top: 0, behavior: 'instant' })
      return
    }
    const reloj = setTimeout(() => {
      document.getElementById(hash.slice(1))?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }, 120)
    return () => clearTimeout(reloj)
  }, [pathname, hash])

  return (
    <CarritoProvider>
      <a href="#contenido" className="solo-lectores">Saltar al contenido</a>
      <Header />
      <main id="contenido">
        <Outlet />
      </main>
      <Footer />
      <BotonWhatsAppFlotante />
      {/* Panel lateral de la cotizacion: se abre desde el icono del header */}
      <PanelCarrito />
    </CarritoProvider>
  )
}

export default SitioLayout
