import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import Reveal from '../../components/ui/Reveal'
import fotoHerramientas from '../../assets/images/herramientas-azul-960.webp'
import './BannersPromo.css'

/**
 * Tres banners que llevan a categorias clave.
 *
 * Espacio para imagenes:
 *  - Banners con producto (1 y 3): PNG/WEBP con fondo transparente, 800 x 800 px
 *  - Banner con foto (2): JPG/WEBP de 1200 x 800 px
 */
const BANNERS = [
  {
    clase: 'banner--led',
    antetitulo: 'Ahorra energía',
    titulo: 'Iluminación LED para cada espacio',
    enlace: '/productos?categoria=paneles-led',
    producto: '/productos/led-incrustar.webp',
  },
  {
    clase: 'banner--herramientas',
    antetitulo: 'Línea profesional',
    titulo: 'Herramientas Stanley',
    enlace: '/productos?categoria=herramientas-manuales',
    foto: fotoHerramientas,
  },
  {
    clase: 'banner--emergencia',
    antetitulo: 'Seguridad',
    titulo: 'Nunca te quedes a oscuras',
    enlace: '/productos?categoria=reflectores-y-emergencia',
    producto: '/productos/lampara-emergencia-r2.webp',
  },
]

function BannersPromo() {
  return (
    <section className="banners" aria-label="Promociones">
      <div className="contenedor banners__rejilla">
        {BANNERS.map((banner, i) => (
          <Reveal key={banner.titulo} retraso={i * 90}>
            <Link to={banner.enlace} className={`banner ${banner.clase}`}>
              {banner.foto && <img src={banner.foto} alt="" className="banner__foto" loading="lazy" />}
              <span className="banner__texto">
                <span className="banner__antetitulo">{banner.antetitulo}</span>
                <span className="banner__titulo">{banner.titulo}</span>
                <span className="banner__boton">
                  Ver productos <ArrowRight aria-hidden="true" />
                </span>
              </span>
              {banner.producto && <img src={banner.producto} alt="" className="banner__producto" loading="lazy" />}
            </Link>
          </Reveal>
        ))}
      </div>
    </section>
  )
}

export default BannersPromo
