import { useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { useNegocio } from '../../hooks'
import { IconoWhatsApp } from '../ui/IconosMarca'
import './BotonWhatsAppFlotante.css'

/**
 * Acceso a WhatsApp siempre a mano. Aparece tras un poco de scroll para no
 * competir con el hero, y en el detalle de producto se oculta porque ahi ya
 * esta el boton de cotizar con el producto en el mensaje.
 */
function BotonWhatsAppFlotante() {
  const negocio = useNegocio()
  const { pathname } = useLocation()
  const [bajoElHero, setBajoElHero] = useState(false)
  const [sobreElPie, setSobreElPie] = useState(false)

  useEffect(() => {
    const alDesplazar = () => setBajoElHero(window.scrollY > 320)
    alDesplazar()
    window.addEventListener('scroll', alDesplazar, { passive: true })
    return () => window.removeEventListener('scroll', alDesplazar)
  }, [])

  /*
   * Al llegar al pie de pagina el boton se retira: ahi tapaba el credito del
   * desarrollador y los enlaces de la ultima fila. No se pierde nada, porque
   * el propio pie abre con un boton grande de WhatsApp.
   */
  useEffect(() => {
    const pie = document.querySelector('footer')
    if (!pie || !('IntersectionObserver' in window)) return

    const observador = new IntersectionObserver(
      ([entrada]) => setSobreElPie(entrada.isIntersecting),
      { threshold: 0 }
    )
    observador.observe(pie)
    return () => observador.disconnect()
  }, [pathname])

  const visible = bajoElHero && !sobreElPie

  if (/^\/productos\/[^/]+$/.test(pathname)) return null

  return (
    <a
      href={negocio.enlaceWhatsappGeneral}
      target="_blank"
      rel="noreferrer"
      className={`wa-flotante${visible ? ' wa-flotante--visible' : ''}`}
      aria-label="Escríbenos por WhatsApp"
      tabIndex={visible ? 0 : -1}
    >
      <IconoWhatsApp />
      <span className="wa-flotante__texto">¿Te asesoramos?</span>
    </a>
  )
}

export default BotonWhatsAppFlotante
