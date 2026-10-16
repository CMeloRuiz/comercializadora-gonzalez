import { Link } from 'react-router-dom'
import { ArrowRight, CreditCard, PackageCheck, Search } from 'lucide-react'
import { useNegocio } from '../../hooks'
import { IconoWhatsApp } from '../../components/ui/IconosMarca'
import Reveal from '../../components/ui/Reveal'
import foto from '../../assets/images/martillo-960.webp'
import './ComoComprar.css'

const PASOS = [
  { icono: Search, titulo: 'Explora y elige', texto: 'Navega el catálogo y encuentra la referencia que necesitas.' },
  { icono: IconoWhatsApp, titulo: 'Cotiza por WhatsApp', texto: 'Toca “Cotizar” y el mensaje con el producto se escribe solo.' },
  { icono: CreditCard, titulo: 'Confirma y paga', texto: 'Te enviamos la cotización y pagas con el medio que prefieras.' },
  { icono: PackageCheck, titulo: 'Recibe tu pedido', texto: 'Lo llevamos hasta tu hogar, negocio u obra.' },
]

function ComoComprar() {
  const negocio = useNegocio()

  return (
    <section className="seccion seccion--alterna como-comprar" id="como-comprar">
      <div className="contenedor como-comprar__rejilla">
        <Reveal desde="izquierda" className="como-comprar__intro">
          <p className="seccion__antetitulo">Cómo comprar</p>
          <h2 className="seccion__titulo">Comprar es tan fácil como enviar un mensaje</h2>
          <p className="seccion__descripcion">
            Sin registros ni carritos complicados. Un asesor real te atiende, confirma disponibilidad y te ayuda a elegir.
          </p>

          <div className="como-comprar__acciones">
            <Link to="/productos" className="btn btn--primario">
              Ir al catálogo <ArrowRight />
            </Link>
            <a href={negocio.enlaceWhatsappGeneral} target="_blank" rel="noreferrer" className="btn btn--contorno">
              Hablar con un asesor
            </a>
          </div>

          <div className="como-comprar__foto">
            <img src={foto} alt="Martillo y guantes de trabajo sobre un banco de carpintería" loading="lazy" width="960" height="640" />
          </div>
        </Reveal>

        <ol className="como-comprar__pasos">
          {PASOS.map(({ icono: Icono, titulo, texto }, i) => (
            <Reveal como="li" key={titulo} retraso={i * 110} desde="derecha" className="paso">
              <span className="paso__numero">{String(i + 1).padStart(2, '0')}</span>
              <span className="paso__icono">
                <Icono aria-hidden="true" />
              </span>
              <div>
                <h3 className="paso__titulo">{titulo}</h3>
                <p className="paso__texto">{texto}</p>
              </div>
            </Reveal>
          ))}
        </ol>
      </div>
    </section>
  )
}

export default ComoComprar
