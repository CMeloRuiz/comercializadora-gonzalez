import { BadgeCheck, Headset, HandCoins, Truck } from 'lucide-react'
import Reveal from '../../components/ui/Reveal'
import './BarraConfianza.css'

/* Beneficios que ya prometia el sitio anterior, en una version mas directa */
const BENEFICIOS = [
  { icono: Truck, titulo: 'Entrega a domicilio', texto: 'Coordinamos el envío hasta tu casa, negocio u obra.' },
  { icono: BadgeCheck, titulo: 'Marcas de confianza', texto: 'Trabajamos con fabricantes reconocidos del sector.' },
  { icono: HandCoins, titulo: 'Precios competitivos', texto: 'Cotizaciones justas para hogar, empresa y contratistas.' },
  { icono: Headset, titulo: 'Asesoría personalizada', texto: 'Te ayudamos a elegir el producto correcto.' },
]

function BarraConfianza() {
  return (
    <section className="confianza" aria-label="Por qué comprar con nosotros">
      <div className="contenedor">
        <ul className="confianza__lista">
          {BENEFICIOS.map(({ icono: Icono, titulo, texto }, i) => (
            <Reveal como="li" key={titulo} retraso={i * 80} className="confianza__item">
              <span className="confianza__icono">
                <Icono aria-hidden="true" />
              </span>
              <div>
                <h3>{titulo}</h3>
                <p>{texto}</p>
              </div>
            </Reveal>
          ))}
        </ul>
      </div>
    </section>
  )
}

export default BarraConfianza
