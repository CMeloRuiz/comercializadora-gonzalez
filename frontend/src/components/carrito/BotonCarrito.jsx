import { ShoppingCart } from 'lucide-react'
import { useCarrito } from '../../hooks'
import './BotonCarrito.css'

/**
 * Icono del carrito con el numero de articulos. Al pulsarlo se abre el panel.
 * Late un momento cada vez que entra algo, para que se note desde cualquier
 * parte de la pagina.
 */
function BotonCarrito({ className = '' }) {
  const carrito = useCarrito()
  const ultima = carrito.ultimaAgregada?.hora

  return (
    <button
      type="button"
      className={`boton-carrito ${className}`}
      onClick={carrito.abrir}
      aria-label={
        carrito.vacio
          ? 'Cotización vacía'
          : `Ver cotización (${carrito.articulos} ${carrito.articulos === 1 ? 'artículo' : 'artículos'})`
      }
    >
      {/*
        * La "key" cambia con cada producto agregado: React vuelve a montar el
        * icono y la animacion se reproduce de nuevo, sin necesidad de estado
        * ni temporizadores.
        */}
      <ShoppingCart key={ultima ?? 'inicio'} className={ultima ? 'boton-carrito__icono--late' : undefined} aria-hidden="true" />
      {!carrito.vacio && (
        <span className="boton-carrito__contador" aria-hidden="true">
          {carrito.articulos > 99 ? '99+' : carrito.articulos}
        </span>
      )}
    </button>
  )
}

export default BotonCarrito
