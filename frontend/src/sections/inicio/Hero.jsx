import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, ShieldCheck } from 'lucide-react'
import { catalogo } from '../../lib/api'
import { portada } from '../../lib/imagenes'
import { useConsulta, useNegocio } from '../../hooks'
import { IconoWhatsApp } from '../../components/ui/IconosMarca'
import imagenHero960 from '../../assets/images/taladro-pared-960.webp'
import imagenHero1920 from '../../assets/images/taladro-pared-1920.webp'
import './Hero.css'

/* La palabra que rota ya estaba en el sitio anterior: se conserva como sello de la marca */
const PALABRAS = ['hogar', 'negocio', 'taller', 'obra', 'oficina']

/*
 * Se guardan la palabra visible y la anterior: asi las dos conviven un instante
 * y el cambio es un fundido cruzado en el mismo sitio, no un salto.
 */
function PalabraRotativa() {
  const [{ actual, previa }, setPalabra] = useState({ actual: 0, previa: null })

  useEffect(() => {
    const reloj = setInterval(
      () => setPalabra(({ actual: i }) => ({ actual: (i + 1) % PALABRAS.length, previa: i })),
      2600
    )
    return () => clearInterval(reloj)
  }, [])

  return (
    <span className="hero__rotativa" aria-live="polite">
      {previa !== null && (
        <span key={`sale-${previa}`} className="hero__palabra hero__palabra--sale" aria-hidden="true">
          {PALABRAS[previa]}
        </span>
      )}
      <span key={`entra-${actual}`} className="hero__palabra hero__palabra--entra">
        {PALABRAS[actual]}
      </span>
    </span>
  )
}

function Hero() {
  const negocio = useNegocio()
  const { datos } = useConsulta((opciones) => catalogo.productos({ destacado: true, limite: 3 }, opciones), [])
  const { datos: categorias } = useConsulta((opciones) => catalogo.categorias(opciones), [])

  const destacados = datos?.productos ?? []
  const totalProductos = categorias?.reduce((suma, c) => suma + c.totalProductos, 0)

  return (
    <section className="hero">
      <div className="hero__decoracion" aria-hidden="true">
        <span className="hero__circulo" />
      </div>

      <div className="contenedor hero__rejilla">
        <div className="hero__texto">
          <h1 className="hero__titulo">
            Soluciones duraderas para tu <PalabraRotativa />
          </h1>

          <p className="hero__descripcion">
            Iluminación LED, material eléctrico y herramientas de marcas reconocidas. Encuentra lo que necesitas y
            recibe tu cotización en minutos por WhatsApp.
          </p>

          <div className="hero__acciones">
            <Link to="/productos" className="btn btn--primario btn--grande">
              Explorar catálogo <ArrowRight />
            </Link>
            <a href={negocio.enlaceWhatsappGeneral} target="_blank" rel="noreferrer" className="btn btn--contorno btn--grande">
              <IconoWhatsApp className="hero__icono-wa" /> Cotizar ahora
            </a>
          </div>

          <div className="hero__prueba">
            <div className="hero__miniaturas" aria-hidden="true">
              {destacados.map((producto) => (
                <span key={producto.id} className="hero__miniatura">
                  <img src={portada(producto, 120)} alt="" />
                </span>
              ))}
            </div>
            <p>
              <strong>{totalProductos ? `${totalProductos} productos` : 'Catálogo completo'}</strong>
              <span>con asesoría personalizada</span>
            </p>
          </div>
        </div>

        <div className="hero__visual">
          {/* Espacio para foto del hero: 1200 x 1500 px (4:5), JPG o WEBP */}
          <div className="hero__foto">
            <img
              src={imagenHero960}
              srcSet={`${imagenHero960} 960w, ${imagenHero1920} 1920w`}
              sizes="(max-width: 960px) 90vw, 560px"
              alt="Profesional perforando una pared de ladrillo con taladro"
              width="960"
              height="640"
              fetchPriority="high"
            />
          </div>

          <div className="hero__flotante hero__flotante--garantia">
            <ShieldCheck aria-hidden="true" /> Calidad garantizada
          </div>
        </div>
      </div>
    </section>
  )
}

export default Hero
