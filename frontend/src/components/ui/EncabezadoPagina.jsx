import { Link } from 'react-router-dom'
import { ChevronRight } from 'lucide-react'
import fondo960 from '../../assets/images/hero-herramientas-960.webp'
import fondo1920 from '../../assets/images/hero-herramientas-1920.webp'
import './EncabezadoPagina.css'

/**
 * Banda de titulo de las paginas internas, con migas de pan.
 *
 * @param {Array<{texto: string, a?: string}>} migas
 * @param {string} [imagen]  Fondo propio (1920 x 700 px); por defecto, herramientas sobre concreto
 */
function EncabezadoPagina({ antetitulo, titulo, descripcion, migas = [], imagen, children }) {
  return (
    <section className="encabezado-pagina">
      <img
        className="encabezado-pagina__fondo"
        src={imagen ?? fondo960}
        srcSet={imagen ? undefined : `${fondo960} 960w, ${fondo1920} 1920w`}
        sizes="100vw"
        alt=""
        aria-hidden="true"
      />
      <div className="contenedor encabezado-pagina__contenido">
        <nav aria-label="Migas de pan">
          <ol className="migas">
            <li><Link to="/">Inicio</Link></li>
            {migas.map((miga) => (
              <li key={miga.texto}>
                <ChevronRight aria-hidden="true" />
                {miga.a ? <Link to={miga.a}>{miga.texto}</Link> : <span aria-current="page">{miga.texto}</span>}
              </li>
            ))}
          </ol>
        </nav>
        {antetitulo && <p className="encabezado-pagina__antetitulo">{antetitulo}</p>}
        <h1 className="encabezado-pagina__titulo">{titulo}</h1>
        {descripcion && <p className="encabezado-pagina__descripcion">{descripcion}</p>}
        {children}
      </div>
    </section>
  )
}

export default EncabezadoPagina
