import Reveal from '../ui/Reveal'
import TarjetaProducto, { TarjetaEsqueleto } from './TarjetaProducto'
import './GrillaProductos.css'

/**
 * Grilla responsive de tarjetas.
 *
 * Mientras carga muestra esqueletos con la forma final, para que la pagina
 * no "salte" cuando llegan los productos.
 */
function GrillaProductos({ productos, cargando, esqueletos = 8, columnas = 4 }) {
  return (
    <div className={`grilla-productos grilla-productos--${columnas}`}>
      {cargando
        ? Array.from({ length: esqueletos }, (_, i) => <TarjetaEsqueleto key={i} />)
        : productos.map((producto, i) => (
          <Reveal key={producto.id} retraso={Math.min(i, 7) * 60}>
            <TarjetaProducto producto={producto} prioridad={i < 4} />
          </Reveal>
        ))}
    </div>
  )
}

export default GrillaProductos
