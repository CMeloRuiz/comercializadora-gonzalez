import { Link } from 'react-router-dom'
import { ArrowRight, Eye, Handshake, Lightbulb, ShieldCheck, Target, Users, Wrench } from 'lucide-react'
import { useNegocio, useTitulo } from '../hooks'
import EncabezadoPagina from '../components/ui/EncabezadoPagina'
import Reveal from '../components/ui/Reveal'
import { IconoWhatsApp } from '../components/ui/IconosMarca'
import fotoPrincipal from '../assets/images/atornillador-960.webp'
import fotoSecundaria from '../assets/images/set-llaves-960.webp'
import fondoObra from '../assets/images/construccion-1920.webp'
import './Nosotros.css'

const VALORES = [
  { icono: ShieldCheck, titulo: 'Confianza', texto: 'Productos originales y cotizaciones claras, sin letra pequeña.' },
  { icono: Users, titulo: 'Cercanía', texto: 'Te atiende una persona que entiende tu proyecto, no un sistema automático.' },
  { icono: Lightbulb, titulo: 'Asesoría', texto: 'Te orientamos para que compres lo que realmente necesitas.' },
  { icono: Handshake, titulo: 'Cumplimiento', texto: 'Lo que acordamos, lo entregamos. Tu obra no se detiene por nosotros.' },
]

function Nosotros() {
  const negocio = useNegocio()
  useTitulo('Nosotros')

  return (
    <>
      <EncabezadoPagina
        antetitulo="Quiénes somos"
        titulo="Tu aliado en eléctricos y ferretería"
        descripcion="Acompañamos a hogares, negocios, técnicos y contratistas con productos confiables y asesoría honesta."
        migas={[{ texto: 'Nosotros' }]}
      />

      {/* ------------------------------ Historia ------------------------------ */}
      <section className="seccion contenedor nosotros__intro">
        <Reveal desde="izquierda" className="nosotros__fotos">
          {/* Fotos de la tienda o el equipo: 960 x 1200 px (4:5) y 960 x 640 px */}
          <img src={fotoPrincipal} alt="Profesional ensamblando con un atornillador eléctrico" className="nosotros__foto nosotros__foto--principal" loading="lazy" />
          <img src={fotoSecundaria} alt="Juego de llaves en su estuche" className="nosotros__foto nosotros__foto--secundaria" loading="lazy" />
          <div className="nosotros__sello">
            <Wrench aria-hidden="true" />
            <span>Eléctricos<br />y Ferretería</span>
          </div>
        </Reveal>

        <Reveal desde="derecha">
          <p className="seccion__antetitulo">Nuestra empresa</p>
          <h2 className="seccion__titulo">Más que una ferretería: un equipo que resuelve</h2>
          <div className="nosotros__texto">
            <p>
              En <strong>{negocio.nombreComercial}</strong> sabemos que detrás de cada compra hay un proyecto: una remodelación,
              una instalación eléctrica, el mantenimiento de un local o una obra que no puede detenerse.
            </p>
            <p>
              Por eso reunimos en un solo lugar iluminación LED, material eléctrico y herramientas de marcas reconocidas, y
              las acompañamos de lo que más valoran nuestros clientes: una asesoría cercana que te ayuda a elegir bien desde
              la primera vez.
            </p>
            <p>
              Cotizar con nosotros es simple. Nos escribes por WhatsApp, te confirmamos precio y disponibilidad, y coordinamos
              la entrega hasta donde lo necesites.
            </p>
          </div>
          <Link to="/productos" className="btn btn--primario">
            Conoce nuestro catálogo <ArrowRight />
          </Link>
        </Reveal>
      </section>

      {/* ---------------------------- Mision y vision ---------------------------- */}
      <section className="nosotros__proposito" style={{ '--fondo-obra': `url(${fondoObra})` }}>
        <div className="contenedor nosotros__proposito-rejilla">
          <Reveal className="proposito">
            <span className="proposito__icono"><Target aria-hidden="true" /></span>
            <h2>Misión</h2>
            <p>
              Suministrar productos eléctricos y de ferretería de calidad, con atención personalizada y respuesta ágil, para que
              nuestros clientes ejecuten sus proyectos con tranquilidad.
            </p>
          </Reveal>
          <Reveal className="proposito" retraso={120}>
            <span className="proposito__icono"><Eye aria-hidden="true" /></span>
            <h2>Visión</h2>
            <p>
              Ser la comercializadora de referencia para hogares, empresas y contratistas de la región, reconocida por su
              confiabilidad, su servicio y la facilidad para comprar.
            </p>
          </Reveal>
        </div>
      </section>

      {/* -------------------------------- Valores -------------------------------- */}
      <section className="seccion contenedor">
        <Reveal className="seccion__cabecera seccion__cabecera--centrada">
          <p className="seccion__antetitulo">Lo que nos mueve</p>
          <h2 className="seccion__titulo">Nuestros valores</h2>
        </Reveal>

        <ul className="nosotros__valores">
          {VALORES.map(({ icono: Icono, titulo, texto }, i) => (
            <Reveal como="li" key={titulo} retraso={i * 90} className="valor">
              <span className="valor__icono"><Icono aria-hidden="true" /></span>
              <h3>{titulo}</h3>
              <p>{texto}</p>
            </Reveal>
          ))}
        </ul>

        <Reveal className="nosotros__cierre">
          <h2>¿Tienes un proyecto en mente?</h2>
          <p>Cuéntanos qué necesitas y te preparamos una cotización a la medida.</p>
          <a href={negocio.enlaceWhatsappGeneral} target="_blank" rel="noreferrer" className="btn btn--whatsapp btn--grande">
            <IconoWhatsApp /> Escríbenos por WhatsApp
          </a>
        </Reveal>
      </section>
    </>
  )
}

export default Nosotros
