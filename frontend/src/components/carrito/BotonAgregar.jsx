import { useEffect, useState } from 'react'
import { Check, Plus, ShoppingCart } from 'lucide-react'
import { useCarrito } from '../../hooks'
import './BotonAgregar.css'

/**
 * Agrega un producto al carrito de cotizacion.
 *
 * Dos presentaciones:
 *  - "icono": el boton redondo de las tarjetas, junto al de WhatsApp.
 *  - "completo": el boton con texto de la pagina de detalle.
 *
 * Tras agregar muestra una confirmacion un par de segundos, para que se note
 * que paso algo sin sacar al visitante de donde esta.
 */
function BotonAgregar({ producto, variante = '', estilo = 'icono', className = '' }) {
  const carrito = useCarrito()
  const [confirmado, setConfirmado] = useState(false)

  useEffect(() => {
    if (!confirmado) return
    const reloj = setTimeout(() => setConfirmado(false), 2000)
    return () => clearTimeout(reloj)
  }, [confirmado])

  const yaEsta = carrito.tiene(producto.slug, variante)

  const agregar = (evento) => {
    /* En las tarjetas, el enlace al detalle cubre todo: aqui no debe navegar */
    evento.preventDefault()
    evento.stopPropagation()
    carrito.agregar(producto, variante)
    setConfirmado(true)
  }

  const etiqueta = confirmado
    ? 'Agregado a la cotización'
    : yaEsta
      ? `Sumar otra unidad de ${producto.nombre}`
      : `Agregar ${producto.nombre} a la cotización`

  if (estilo === 'completo') {
    return (
      <button
        type="button"
        className={`btn btn--contorno btn--grande agregar agregar--completo${confirmado ? ' agregar--hecho' : ''} ${className}`}
        onClick={agregar}
        aria-label={etiqueta}
      >
        {confirmado ? <Check /> : <ShoppingCart />}
        {confirmado ? 'Agregado' : yaEsta ? 'Agregar otra' : 'Agregar a la cotización'}
      </button>
    )
  }

  return (
    <button
      type="button"
      className={`agregar agregar--icono${confirmado ? ' agregar--hecho' : ''}${yaEsta ? ' agregar--puesto' : ''} ${className}`}
      onClick={agregar}
      title={etiqueta}
      aria-label={etiqueta}
    >
      {confirmado ? <Check /> : <Plus />}
      {yaEsta && !confirmado && <span className="agregar__punto" aria-hidden="true" />}
    </button>
  )
}

export default BotonAgregar
