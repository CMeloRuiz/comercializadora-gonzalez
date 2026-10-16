import { Link } from 'react-router-dom'
import { Compass } from 'lucide-react'
import { useTitulo } from '../hooks'
import EstadoMensaje from '../components/ui/EstadoMensaje'

function NoEncontrada() {
  useTitulo('Página no encontrada')

  return (
    <div className="contenedor seccion">
      <EstadoMensaje
        icono={Compass}
        titulo="No encontramos esta página"
        acciones={
          <>
            <Link to="/" className="btn btn--primario">Ir al inicio</Link>
            <Link to="/productos" className="btn btn--contorno">Ver productos</Link>
          </>
        }
      >
        Es posible que el enlace esté mal escrito o que la página ya no exista.
      </EstadoMensaje>
    </div>
  )
}

export default NoEncontrada
