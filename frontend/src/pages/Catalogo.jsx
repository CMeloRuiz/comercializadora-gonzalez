import { useEffect, useRef, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { ChevronLeft, ChevronRight, Headset, PackageSearch, Search, SlidersHorizontal, X } from 'lucide-react'
import { catalogo } from '../lib/api'
import { useConsulta, useNegocio, useRetraso, useTitulo } from '../hooks'
import EncabezadoPagina from '../components/ui/EncabezadoPagina'
import EstadoMensaje from '../components/ui/EstadoMensaje'
import GrillaProductos from '../components/productos/GrillaProductos'
import { IconoWhatsApp } from '../components/ui/IconosMarca'
import './Catalogo.css'

const POR_PAGINA = 12

const ORDENES = [
  { valor: 'relevancia', texto: 'Recomendados' },
  { valor: 'nombre', texto: 'Nombre (A-Z)' },
  { valor: 'recientes', texto: 'Más recientes' },
]

/**
 * Tienda virtual: filtros por categoria, buscador, orden y paginacion.
 *
 * Todo el estado vive en la URL (?categoria=&q=&orden=&pagina=), asi que un
 * resultado se puede compartir por WhatsApp o guardar en favoritos, y el
 * boton "atras" del navegador funciona como se espera.
 */
function Catalogo() {
  const negocio = useNegocio()
  const [parametros, setParametros] = useSearchParams()
  const categoria = parametros.get('categoria') ?? ''
  const q = parametros.get('q') ?? ''
  const orden = parametros.get('orden') ?? 'relevancia'
  const pagina = Math.max(1, Number(parametros.get('pagina')) || 1)

  const [texto, setTexto] = useState(q)
  const textoRetrasado = useRetraso(texto, 350)
  const inicioResultados = useRef(null)

  const { datos: categorias } = useConsulta((opciones) => catalogo.categorias(opciones), [])
  const { datos, cargando, error, reintentar } = useConsulta(
    (opciones) => catalogo.productos({ categoria, q, orden, pagina, limite: POR_PAGINA }, opciones),
    [categoria, q, orden, pagina]
  )

  const categoriaActual = categorias?.find((c) => c.slug === categoria)
  useTitulo(categoriaActual?.nombre ?? 'Productos')

  /* Actualiza la URL cambiando solo lo indicado; cualquier filtro nuevo vuelve a la pagina 1 */
  const actualizar = (cambios, { conservarPagina = false } = {}) => {
    const siguientes = new URLSearchParams(parametros)
    for (const [clave, valor] of Object.entries(cambios)) {
      if (valor && !(clave === 'orden' && valor === 'relevancia')) siguientes.set(clave, valor)
      else siguientes.delete(clave)
    }
    if (!conservarPagina) siguientes.delete('pagina')
    setParametros(siguientes, { replace: 'q' in cambios })
  }

  /*
   * El buscador escribe en la URL tras una pausa. Se recuerda lo ultimo que
   * escribio para distinguirlo de un cambio que llega de fuera (el buscador
   * del header): solo ese debe reemplazar lo que hay en el campo, o se
   * perderian las letras tecleadas mientras llegaba la respuesta.
   */
  const ultimaEscrita = useRef(q)

  useEffect(() => {
    const termino = textoRetrasado.trim()
    if (termino === q) return
    ultimaEscrita.current = termino
    actualizar({ q: termino })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [textoRetrasado])

  useEffect(() => {
    if (q === ultimaEscrita.current) return
    ultimaEscrita.current = q
    setTexto(q)
  }, [q])

  const irAPagina = (numero) => {
    actualizar({ pagina: numero > 1 ? String(numero) : '' }, { conservarPagina: true })
    inicioResultados.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  const limpiar = () => {
    ultimaEscrita.current = ''
    setTexto('')
    setParametros(new URLSearchParams())
  }

  const hayFiltros = Boolean(categoria || q)
  const total = datos?.total ?? 0
  const totalCatalogo = categorias?.reduce((s, c) => s + c.totalProductos, 0)

  return (
    <>
      <EncabezadoPagina
        antetitulo="Tienda virtual"
        titulo={categoriaActual?.nombre ?? 'Nuestro catálogo'}
        descripcion={
          categoriaActual?.descripcion ||
          'Iluminación, material eléctrico y herramientas. Elige tus productos y cotízalos al instante por WhatsApp.'
        }
        migas={categoriaActual ? [{ texto: 'Productos', a: '/productos' }, { texto: categoriaActual.nombre }] : [{ texto: 'Productos' }]}
      />

      <section className="catalogo contenedor">
        {/* ------------------------------ Filtros ------------------------------ */}
        <aside className="catalogo__lateral" aria-label="Filtros">
          <div className="catalogo__busqueda">
            <Search aria-hidden="true" />
            <input
              type="search"
              placeholder="Buscar por nombre, marca o referencia"
              aria-label="Buscar en el catálogo"
              value={texto}
              onChange={(e) => setTexto(e.target.value)}
            />
            {texto && (
              <button type="button" onClick={() => setTexto('')} aria-label="Borrar búsqueda">
                <X />
              </button>
            )}
          </div>

          <div className="catalogo__bloque">
            <h2 className="catalogo__bloque-titulo">
              <SlidersHorizontal aria-hidden="true" /> Categorías
            </h2>
            <ul className="catalogo__categorias">
              <li>
                <button
                  type="button"
                  className={`chip-categoria${!categoria ? ' chip-categoria--activa' : ''}`}
                  onClick={() => actualizar({ categoria: '' })}
                  aria-pressed={!categoria}
                >
                  <span>Todos los productos</span>
                  {totalCatalogo !== undefined && <span className="chip-categoria__conteo">{totalCatalogo}</span>}
                </button>
              </li>
              {categorias?.filter((c) => c.totalProductos > 0 || c.slug === categoria).map((c) => (
                <li key={c.id}>
                  <button
                    type="button"
                    className={`chip-categoria${categoria === c.slug ? ' chip-categoria--activa' : ''}`}
                    onClick={() => actualizar({ categoria: c.slug })}
                    aria-pressed={categoria === c.slug}
                  >
                    <span>{c.nombre}</span>
                    <span className="chip-categoria__conteo">{c.totalProductos}</span>
                  </button>
                </li>
              ))}
            </ul>
          </div>

          <div className="catalogo__ayuda">
            <Headset aria-hidden="true" />
            <h2>¿Necesitas ayuda para elegir?</h2>
            <p>Un asesor te recomienda el producto ideal para tu proyecto.</p>
            <a href={negocio.enlaceWhatsappGeneral} target="_blank" rel="noreferrer" className="btn btn--whatsapp btn--pequeno btn--bloque">
              <IconoWhatsApp /> Pedir asesoría
            </a>
          </div>
        </aside>

        {/* ----------------------------- Resultados ----------------------------- */}
        <div className="catalogo__resultados" ref={inicioResultados}>
          <div className="catalogo__barra">
            <p className="catalogo__conteo" aria-live="polite">
              {cargando ? 'Buscando productos...' : (
                <>
                  <strong>{total}</strong> {total === 1 ? 'producto' : 'productos'}
                  {q && <> para “{q}”</>}
                </>
              )}
            </p>

            <label className="catalogo__orden">
              <span>Ordenar por</span>
              <select value={orden} onChange={(e) => actualizar({ orden: e.target.value })}>
                {ORDENES.map((o) => (
                  <option key={o.valor} value={o.valor}>{o.texto}</option>
                ))}
              </select>
            </label>
          </div>

          {hayFiltros && (
            <div className="catalogo__activos">
              {categoriaActual && (
                <button type="button" className="filtro-activo" onClick={() => actualizar({ categoria: '' })}>
                  {categoriaActual.nombre} <X aria-label="Quitar filtro" />
                </button>
              )}
              {q && (
                <button type="button" className="filtro-activo" onClick={() => { ultimaEscrita.current = ''; setTexto(''); actualizar({ q: '' }) }}>
                  “{q}” <X aria-label="Quitar búsqueda" />
                </button>
              )}
              <button type="button" className="catalogo__limpiar" onClick={limpiar}>
                Limpiar todo
              </button>
            </div>
          )}

          {error ? (
            <EstadoMensaje
              icono={PackageSearch}
              tono="error"
              titulo="No pudimos cargar el catálogo"
              acciones={<button type="button" className="btn btn--contorno" onClick={reintentar}>Reintentar</button>}
            >
              {error.message}
            </EstadoMensaje>
          ) : !cargando && total === 0 ? (
            <EstadoMensaje
              icono={PackageSearch}
              titulo="No encontramos productos"
              acciones={
                <>
                  {hayFiltros && <button type="button" className="btn btn--contorno" onClick={limpiar}>Ver todo el catálogo</button>}
                  <a href={negocio.enlaceWhatsappGeneral} target="_blank" rel="noreferrer" className="btn btn--whatsapp">
                    <IconoWhatsApp /> Preguntar por WhatsApp
                  </a>
                </>
              }
            >
              Es posible que lo tengamos aunque no esté publicado. Escríbenos y lo buscamos por ti.
            </EstadoMensaje>
          ) : (
            <GrillaProductos productos={datos?.productos ?? []} cargando={cargando} esqueletos={6} columnas={3} />
          )}

          {datos && datos.paginas > 1 && (
            <Paginacion pagina={datos.pagina} paginas={datos.paginas} alCambiar={irAPagina} />
          )}
        </div>
      </section>
    </>
  )
}

function Paginacion({ pagina, paginas, alCambiar }) {
  const numeros = Array.from({ length: paginas }, (_, i) => i + 1).filter(
    (n) => n === 1 || n === paginas || Math.abs(n - pagina) <= 1
  )

  return (
    <nav className="paginacion" aria-label="Paginación">
      <button type="button" className="paginacion__boton" disabled={pagina === 1} onClick={() => alCambiar(pagina - 1)} aria-label="Página anterior">
        <ChevronLeft />
      </button>
      {numeros.map((n, i) => (
        <span key={n} className="paginacion__grupo">
          {i > 0 && n - numeros[i - 1] > 1 && <span className="paginacion__salto">…</span>}
          <button
            type="button"
            className={`paginacion__boton${n === pagina ? ' paginacion__boton--activo' : ''}`}
            aria-current={n === pagina ? 'page' : undefined}
            onClick={() => alCambiar(n)}
          >
            {n}
          </button>
        </span>
      ))}
      <button type="button" className="paginacion__boton" disabled={pagina === paginas} onClick={() => alCambiar(pagina + 1)} aria-label="Página siguiente">
        <ChevronRight />
      </button>
    </nav>
  )
}

export default Catalogo
