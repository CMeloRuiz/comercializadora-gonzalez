import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import {
  ArrowLeft, Check, CheckCircle2, ChevronRight, Clock, Headset, ImageOff, Link2, PackageSearch, Phone, Share2, Truck,
} from 'lucide-react'
import { catalogo } from '../lib/api'
import { imagenAncho } from '../lib/imagenes'
import { enlaceCotizacion } from '../lib/whatsapp'
import { useConsulta, useNegocio, useTitulo } from '../hooks'
import { IconoWhatsApp } from '../components/ui/IconosMarca'
import BotonAgregar from '../components/carrito/BotonAgregar'
import EstadoMensaje from '../components/ui/EstadoMensaje'
import GrillaProductos from '../components/productos/GrillaProductos'
import Reveal from '../components/ui/Reveal'
import './DetalleProducto.css'

function DetalleProducto() {
  const { slug } = useParams()
  const { datos, cargando, error, reintentar } = useConsulta((opciones) => catalogo.producto(slug, opciones), [slug])

  useTitulo(datos?.producto.nombre ?? (error ? 'Producto no encontrado' : 'Producto'))

  if (error) {
    return (
      <div className="contenedor detalle__estado">
        <EstadoMensaje
          icono={PackageSearch}
          tono={error.estado === 404 ? 'neutro' : 'error'}
          titulo={error.estado === 404 ? 'Este producto ya no está disponible' : 'No pudimos cargar el producto'}
          acciones={
            <>
              <Link to="/productos" className="btn btn--primario">Ver catálogo</Link>
              {error.estado !== 404 && <button type="button" className="btn btn--contorno" onClick={reintentar}>Reintentar</button>}
            </>
          }
        >
          {error.estado === 404 ? 'Puede que lo hayamos retirado o cambiado de nombre. Explora productos similares en el catálogo.' : error.message}
        </EstadoMensaje>
      </div>
    )
  }

  if (cargando || !datos) return <DetalleEsqueleto />

  /* key: al pasar a un producto relacionado se reinicia la galeria y la variante elegida */
  return <Detalle key={datos.producto.id} producto={datos.producto} relacionados={datos.relacionados} />
}

function Detalle({ producto, relacionados }) {
  const negocio = useNegocio()
  const [imagenActiva, setImagenActiva] = useState(0)
  const [variante, setVariante] = useState(producto.variantes.length === 1 ? producto.variantes[0] : '')
  const [copiado, setCopiado] = useState(false)

  /* Descripcion para buscadores y al compartir el enlace */
  useEffect(() => {
    const meta = document.querySelector('meta[name="description"]')
    const anterior = meta?.getAttribute('content')
    if (meta && producto.resumen) meta.setAttribute('content', producto.resumen)
    return () => { if (meta && anterior) meta.setAttribute('content', anterior) }
  }, [producto.resumen])

  /* La barra fija de movil necesita que el pie de pagina deje espacio debajo */
  useEffect(() => {
    document.body.classList.add('con-barra-movil')
    return () => document.body.classList.remove('con-barra-movil')
  }, [])

  const enlace = enlaceCotizacion(negocio.whatsapp, producto, variante)
  const parrafos = producto.descripcion.split(/\n\s*\n/).filter(Boolean)

  const compartir = async () => {
    const url = window.location.href
    if (navigator.share) {
      try {
        await navigator.share({ title: producto.nombre, text: producto.resumen, url })
      } catch { /* el usuario cancelo */ }
      return
    }
    await navigator.clipboard?.writeText(url)
    setCopiado(true)
    setTimeout(() => setCopiado(false), 2200)
  }

  return (
    <>
      <div className="detalle__migas-banda">
        <nav className="contenedor" aria-label="Migas de pan">
          <ol className="detalle__migas">
            <li><Link to="/">Inicio</Link></li>
            <li><ChevronRight aria-hidden="true" /><Link to="/productos">Productos</Link></li>
            {producto.categoria && (
              <li>
                <ChevronRight aria-hidden="true" />
                <Link to={`/productos?categoria=${producto.categoria.slug}`}>{producto.categoria.nombre}</Link>
              </li>
            )}
            <li><ChevronRight aria-hidden="true" /><span aria-current="page">{producto.nombre}</span></li>
          </ol>
        </nav>
      </div>

      <section className="contenedor detalle">
        {/* ------------------------------ Galeria ------------------------------ */}
        <div className="detalle__galeria">
          <Galeria producto={producto} activa={imagenActiva} alCambiar={setImagenActiva} />
        </div>

        {/* ------------------------------- Compra ------------------------------- */}
        <div className="detalle__info">
          <div className="detalle__insignias">
            {producto.categoria && (
              <Link to={`/productos?categoria=${producto.categoria.slug}`} className="etiqueta">{producto.categoria.nombre}</Link>
            )}
            {producto.nuevo && <span className="etiqueta etiqueta--nuevo">Nuevo</span>}
            {producto.destacado && <span className="etiqueta etiqueta--destacado">Más cotizado</span>}
          </div>

          <h1 className="detalle__titulo">{producto.nombre}</h1>

          {(producto.marca || producto.referencia) && (
            <dl className="detalle__meta">
              {producto.marca && (<div><dt>Marca</dt><dd>{producto.marca}</dd></div>)}
              {producto.referencia && (<div><dt>Referencia</dt><dd>{producto.referencia}</dd></div>)}
            </dl>
          )}

          {producto.resumen && <p className="detalle__resumen">{producto.resumen}</p>}

          <p className={`detalle__disponibilidad${producto.disponible ? '' : ' detalle__disponibilidad--pedido'}`}>
            <span className="detalle__punto" aria-hidden="true" />
            {producto.disponible ? 'Disponible para entrega' : 'Disponible bajo pedido'}
          </p>

          {producto.variantes.length > 0 && (
            <fieldset className="detalle__variantes">
              <legend>
                Presentación{' '}
                <span>{variante ? `: ${variante}` : `(${producto.variantes.length} opciones)`}</span>
              </legend>
              <div className="detalle__opciones">
                {producto.variantes.map((opcion) => (
                  <button
                    key={opcion}
                    type="button"
                    className={`opcion${variante === opcion ? ' opcion--activa' : ''}`}
                    aria-pressed={variante === opcion}
                    onClick={() => setVariante(variante === opcion ? '' : opcion)}
                  >
                    {variante === opcion && <Check aria-hidden="true" />}
                    {opcion}
                  </button>
                ))}
              </div>
            </fieldset>
          )}

          <div className="detalle__cta">
            <a href={enlace} target="_blank" rel="noreferrer" className="btn btn--whatsapp btn--grande detalle__cotizar">
              <IconoWhatsApp /> Cotizar por WhatsApp
            </a>
            <a href={negocio.enlaceTelefono} className="btn btn--contorno btn--grande detalle__llamar" aria-label={`Llamar al ${negocio.telefono}`}>
              <Phone />
            </a>
            <button type="button" className="btn btn--contorno btn--grande detalle__compartir" onClick={compartir} aria-label="Compartir producto">
              {copiado ? <Link2 /> : <Share2 />}
            </button>
          </div>

          {/* Alternativa a cotizar ya: juntarlo con otros productos y enviarlos de una vez */}
          <BotonAgregar producto={producto} variante={variante} estilo="completo" className="detalle__agregar" />
          <p className="detalle__nota" aria-live="polite">
            {copiado
              ? '¡Enlace copiado!'
              : producto.variantes.length > 1 && !variante
                ? 'Elige una presentación para que tu cotización sea más precisa.'
                : 'Te respondemos con precio, disponibilidad y tiempo de entrega.'}
          </p>

          <ul className="detalle__garantias">
            <li><Clock aria-hidden="true" /> Respuesta rápida</li>
            <li><Headset aria-hidden="true" /> Asesoría experta</li>
            <li><Truck aria-hidden="true" /> Entrega a domicilio</li>
          </ul>
        </div>
      </section>

      {/* ---------------------------- Informacion ---------------------------- */}
      <section className="contenedor detalle__contenido">
        <Reveal className="detalle__descripcion">
          <h2 className="detalle__subtitulo">Descripción</h2>
          {parrafos.length ? parrafos.map((p, i) => <p key={i}>{p}</p>) : <p>{producto.resumen}</p>}

          {producto.aplicaciones.length > 0 && (
            <>
              <h3 className="detalle__subtitulo detalle__subtitulo--menor">Ideal para</h3>
              <ul className="detalle__aplicaciones">
                {producto.aplicaciones.map((uso) => <li key={uso}>{uso}</li>)}
              </ul>
            </>
          )}
        </Reveal>

        <div className="detalle__laterales">
          {producto.caracteristicas.length > 0 && (
            <Reveal className="detalle__caja">
              <h2 className="detalle__subtitulo">Características</h2>
              <ul className="detalle__caracteristicas">
                {producto.caracteristicas.map((c) => (
                  <li key={c}><CheckCircle2 aria-hidden="true" /> {c}</li>
                ))}
              </ul>
            </Reveal>
          )}

          {producto.especificaciones.length > 0 && (
            <Reveal className="detalle__caja" retraso={100}>
              <h2 className="detalle__subtitulo">Especificaciones</h2>
              <table className="detalle__tabla">
                <tbody>
                  {producto.especificaciones.map((fila) => (
                    <tr key={fila.etiqueta}>
                      <th scope="row">{fila.etiqueta}</th>
                      <td>{fila.valor}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </Reveal>
          )}
        </div>
      </section>

      {relacionados.length > 0 && (
        <section className="seccion contenedor">
          <div className="seccion__cabecera">
            <div>
              <p className="seccion__antetitulo">También te puede interesar</p>
              <h2 className="seccion__titulo">Productos relacionados</h2>
            </div>
            <Link to="/productos" className="enlace-flecha">
              <ArrowLeft style={{ transform: 'scaleX(-1)' }} /> Ver catálogo
            </Link>
          </div>
          <GrillaProductos productos={relacionados} />
        </section>
      )}

      {/* Barra fija en movil: el boton de cotizar siempre visible */}
      <div className="detalle__barra-movil">
        <div>
          <strong>{producto.nombre}</strong>
          <span>{variante || 'Cotiza sin compromiso'}</span>
        </div>
        <BotonAgregar producto={producto} variante={variante} />
        <a href={enlace} target="_blank" rel="noreferrer" className="btn btn--whatsapp">
          <IconoWhatsApp /> Cotizar
        </a>
      </div>
    </>
  )
}

/**
 * Imagen principal con zoom que sigue al cursor, y miniaturas debajo.
 */
function Galeria({ producto, activa, alCambiar }) {
  const [zoom, setZoom] = useState(null)
  const imagenes = producto.imagenes

  if (imagenes.length === 0) {
    return (
      <div className="galeria__principal galeria__principal--vacia">
        <ImageOff aria-hidden="true" />
        <span>Imagen no disponible</span>
      </div>
    )
  }

  const moverZoom = (evento) => {
    const caja = evento.currentTarget.getBoundingClientRect()
    setZoom({
      x: ((evento.clientX - caja.left) / caja.width) * 100,
      y: ((evento.clientY - caja.top) / caja.height) * 100,
    })
  }

  return (
    <>
      <div
        className={`galeria__principal${zoom ? ' galeria__principal--zoom' : ''}`}
        onMouseMove={moverZoom}
        onMouseLeave={() => setZoom(null)}
      >
        <img
          key={imagenes[activa].url}
          src={imagenAncho(imagenes[activa].url, 1200)}
          alt={producto.nombre}
          width="800"
          height="800"
          fetchPriority="high"
          style={zoom ? { transformOrigin: `${zoom.x}% ${zoom.y}%` } : undefined}
        />
      </div>

      {imagenes.length > 1 && (
        <div className="galeria__miniaturas" role="tablist" aria-label="Imágenes del producto">
          {imagenes.map((imagen, i) => (
            <button
              key={imagen.url}
              type="button"
              role="tab"
              aria-selected={i === activa}
              aria-label={`Imagen ${i + 1}`}
              className={`galeria__miniatura${i === activa ? ' galeria__miniatura--activa' : ''}`}
              onClick={() => alCambiar(i)}
            >
              <img src={imagenAncho(imagen.url, 200)} alt="" loading="lazy" />
            </button>
          ))}
        </div>
      )}
    </>
  )
}

function DetalleEsqueleto() {
  return (
    <section className="contenedor detalle detalle--cargando" aria-busy="true" aria-label="Cargando producto">
      <div className="galeria__principal esqueleto" />
      <div className="detalle__info">
        <span className="esqueleto esqueleto--linea" style={{ width: 120 }} />
        <span className="esqueleto" style={{ height: 44, width: '90%', marginTop: 18 }} />
        <span className="esqueleto esqueleto--linea" style={{ width: '70%', marginTop: 22 }} />
        <span className="esqueleto esqueleto--linea" style={{ width: '60%' }} />
        <span className="esqueleto" style={{ height: 56, width: '100%', marginTop: 36, borderRadius: 999 }} />
      </div>
    </section>
  )
}

export default DetalleProducto
