import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { ImageOff, Minus, Plus, ShoppingCart, Trash2, X } from 'lucide-react'
import { useCarrito, useNegocio } from '../../hooks'
import { imagenAncho } from '../../lib/imagenes'
import { enlaceCarrito } from '../../lib/whatsapp'
import { IconoWhatsApp } from '../ui/IconosMarca'
import './PanelCarrito.css'

/**
 * Panel lateral con los productos que se van a cotizar juntos.
 *
 * El boton final arma un unico mensaje de WhatsApp con toda la lista. No
 * reemplaza al "Cotizar" de cada producto: es el atajo para quien necesita
 * varias referencias.
 */
function PanelCarrito() {
  const carrito = useCarrito()
  const negocio = useNegocio()

  /* Con el panel abierto no se desplaza la pagina de atras, y Escape lo cierra */
  useEffect(() => {
    if (!carrito.abierto) return

    const alTeclear = (evento) => {
      if (evento.key === 'Escape') carrito.cerrar()
    }

    document.body.style.overflow = 'hidden'
    document.addEventListener('keydown', alTeclear)

    return () => {
      document.body.style.overflow = ''
      document.removeEventListener('keydown', alTeclear)
    }
  }, [carrito])

  const enlace = carrito.vacio ? null : enlaceCarrito(negocio.whatsapp, carrito.lineas)

  return (
    /* inert: cerrado, nada de lo que hay dentro recibe foco ni clics */
    <div
      className={`panel-carrito${carrito.abierto ? ' panel-carrito--abierto' : ''}`}
      aria-hidden={!carrito.abierto}
      inert={!carrito.abierto || undefined}
    >
      <button type="button" className="panel-carrito__fondo" tabIndex={-1} aria-label="Cerrar cotización" onClick={carrito.cerrar} />

      <aside className="panel-carrito__caja" role="dialog" aria-modal="true" aria-label="Productos para cotizar">
        <header className="panel-carrito__cabecera">
          <div>
            <h2>Tu cotización</h2>
            <p>
              {carrito.vacio
                ? 'Aún no has agregado productos'
                : `${carrito.articulos} ${carrito.articulos === 1 ? 'artículo' : 'artículos'} · ${carrito.lineas.length} ${carrito.lineas.length === 1 ? 'producto' : 'productos'}`}
            </p>
          </div>
          <button type="button" className="panel-carrito__cerrar" onClick={carrito.cerrar} aria-label="Cerrar">
            <X />
          </button>
        </header>

        {carrito.vacio ? (
          <div className="panel-carrito__vacio">
            <span className="panel-carrito__vacio-icono">
              <ShoppingCart aria-hidden="true" />
            </span>
            <h3>Arma tu lista</h3>
            <p>Agrega los productos que te interesan y los enviamos juntos en un solo mensaje de WhatsApp.</p>
            <Link to="/productos" className="btn btn--primario" onClick={carrito.cerrar}>
              Explorar catálogo
            </Link>
          </div>
        ) : (
          <>
            <ul className="panel-carrito__lista">
              {carrito.lineas.map((linea) => (
                <li key={linea.clave} className="linea-carrito">
                  <Link to={`/productos/${linea.slug}`} className="linea-carrito__imagen" onClick={carrito.cerrar}>
                    {linea.imagen ? (
                      <img src={imagenAncho(linea.imagen, 160)} alt="" loading="lazy" />
                    ) : (
                      <ImageOff aria-hidden="true" />
                    )}
                  </Link>

                  <div className="linea-carrito__info">
                    <Link to={`/productos/${linea.slug}`} className="linea-carrito__nombre" onClick={carrito.cerrar}>
                      {linea.nombre}
                    </Link>
                    {linea.variante && <span className="linea-carrito__variante">{linea.variante}</span>}

                    <div className="linea-carrito__acciones">
                      <div className="contador-carrito">
                        <button
                          type="button"
                          onClick={() => carrito.cambiarCantidad(linea.clave, linea.cantidad - 1)}
                          disabled={linea.cantidad <= 1}
                          aria-label={`Quitar una unidad de ${linea.nombre}`}
                        >
                          <Minus />
                        </button>
                        <span aria-live="polite">{linea.cantidad}</span>
                        <button
                          type="button"
                          onClick={() => carrito.cambiarCantidad(linea.clave, linea.cantidad + 1)}
                          aria-label={`Agregar una unidad de ${linea.nombre}`}
                        >
                          <Plus />
                        </button>
                      </div>

                      <button
                        type="button"
                        className="linea-carrito__quitar"
                        onClick={() => carrito.quitar(linea.clave)}
                        aria-label={`Quitar ${linea.nombre} de la cotización`}
                      >
                        <Trash2 />
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>

            <footer className="panel-carrito__pie">
              <a href={enlace} target="_blank" rel="noreferrer" className="btn btn--whatsapp btn--grande btn--bloque">
                <IconoWhatsApp /> Cotizar por WhatsApp
              </a>
              <p className="panel-carrito__nota">
                Se abre WhatsApp con la lista completa. Te confirmamos precios y disponibilidad.
              </p>
              <button type="button" className="panel-carrito__vaciar" onClick={carrito.vaciar}>
                Vaciar cotización
              </button>
            </footer>
          </>
        )}
      </aside>
    </div>
  )
}

export default PanelCarrito
