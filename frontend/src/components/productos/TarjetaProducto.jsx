import { Link } from 'react-router-dom'
import { ArrowRight, ImageOff, Layers } from 'lucide-react'
import { useNegocio } from '../../hooks'
import { portada } from '../../lib/imagenes'
import { enlaceCotizacion } from '../../lib/whatsapp'
import { IconoWhatsApp } from '../ui/IconosMarca'
import BotonAgregar from '../carrito/BotonAgregar'
import './TarjetaProducto.css'

/**
 * Tarjeta del catalogo.
 *
 * Toda la tarjeta lleva al detalle (enlace "estirado" sobre la superficie) y
 * el boton redondo de WhatsApp cotiza directamente sin pasar por el detalle.
 * Sin precio, a proposito: el negocio cotiza por WhatsApp.
 */
function TarjetaProducto({ producto, prioridad = false }) {
  const negocio = useNegocio()
  const imagen = portada(producto, 600)
  const presentaciones = producto.variantes?.length ?? 0

  return (
    <article className={`tarjeta-producto${producto.disponible ? '' : ' tarjeta-producto--agotado'}`}>
      <div className="tarjeta-producto__media">
        {imagen ? (
          <img
            src={imagen}
            alt={producto.nombre}
            width="600"
            height="600"
            loading={prioridad ? 'eager' : 'lazy'}
            decoding="async"
            className="tarjeta-producto__imagen"
          />
        ) : (
          <span className="tarjeta-producto__sin-imagen">
            <ImageOff aria-hidden="true" />
          </span>
        )}

        <div className="tarjeta-producto__insignias">
          {producto.nuevo && <span className="etiqueta etiqueta--nuevo">Nuevo</span>}
          {producto.destacado && <span className="etiqueta etiqueta--destacado">Más cotizado</span>}
          {!producto.disponible && <span className="etiqueta etiqueta--agotado">Bajo pedido</span>}
        </div>

        <span className="tarjeta-producto__ver" aria-hidden="true">
          Ver detalle <ArrowRight />
        </span>
      </div>

      <div className="tarjeta-producto__cuerpo">
        <p className="tarjeta-producto__categoria">{producto.categoria?.nombre ?? 'Producto'}</p>
        <h3 className="tarjeta-producto__nombre">
          <Link to={`/productos/${producto.slug}`} className="tarjeta-producto__enlace">
            {producto.nombre}
          </Link>
        </h3>

        <div className="tarjeta-producto__pie">
          <span className="tarjeta-producto__meta">
            {presentaciones > 1 ? (
              <>
                <Layers aria-hidden="true" /> {presentaciones} presentaciones
              </>
            ) : (
              producto.marca || 'Cotiza sin compromiso'
            )}
          </span>

          <span className="tarjeta-producto__botones">
            {/* Suma a la cotizacion de varios productos, sin salir del catalogo */}
            <BotonAgregar producto={producto} />

            {/* Y el atajo de siempre: cotizar solo este, directo por WhatsApp */}
            <a
              href={enlaceCotizacion(negocio.whatsapp, producto)}
              target="_blank"
              rel="noreferrer"
              className="tarjeta-producto__cotizar"
              aria-label={`Cotizar ${producto.nombre} por WhatsApp`}
              title="Cotizar por WhatsApp"
            >
              <IconoWhatsApp />
            </a>
          </span>
        </div>
      </div>
    </article>
  )
}

export function TarjetaEsqueleto() {
  return (
    <div className="tarjeta-producto tarjeta-producto--esqueleto" aria-hidden="true">
      <div className="tarjeta-producto__media esqueleto" />
      <div className="tarjeta-producto__cuerpo">
        <span className="esqueleto esqueleto--linea" style={{ width: '40%' }} />
        <span className="esqueleto esqueleto--linea esqueleto--alta" style={{ width: '85%' }} />
        <span className="esqueleto esqueleto--linea" style={{ width: '55%', marginTop: 18 }} />
      </div>
    </div>
  )
}

export default TarjetaProducto
