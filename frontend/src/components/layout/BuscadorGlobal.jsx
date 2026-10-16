import { useEffect, useId, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ArrowRight, Loader2, Search } from 'lucide-react'
import { catalogo } from '../../lib/api'
import { portada } from '../../lib/imagenes'
import { useRetraso } from '../../hooks'
import './BuscadorGlobal.css'

/**
 * Buscador con sugerencias en vivo.
 *
 * Mientras se escribe muestra hasta 5 productos con su foto; Enter lleva al
 * catalogo con todos los resultados. Se navega con flechas y Escape cierra.
 */
function BuscadorGlobal({ className = '' }) {
  const navegar = useNavigate()
  const idLista = useId()
  const contenedor = useRef(null)
  const [texto, setTexto] = useState('')
  const [abierto, setAbierto] = useState(false)
  const [activo, setActivo] = useState(-1)
  const [respuesta, setRespuesta] = useState({ termino: '', productos: [], total: 0 })
  const termino = useRetraso(texto.trim(), 250)

  useEffect(() => {
    if (termino.length < 2) return
    const control = new AbortController()
    catalogo
      .productos({ q: termino, limite: 5 }, { signal: control.signal })
      .then(({ productos, total }) => {
        setRespuesta({ termino, productos, total })
        setActivo(-1)
      })
      .catch((error) => {
        if (error.name !== 'AbortError') setRespuesta({ termino, productos: [], total: 0 })
      })
    return () => control.abort()
  }, [termino])

  /* Solo valen los resultados del termino actual; si aun no llegan, se esta buscando */
  const vigente = termino.length >= 2 && respuesta.termino === termino
  const resultado = {
    productos: vigente ? respuesta.productos : [],
    total: vigente ? respuesta.total : 0,
    cargando: termino.length >= 2 && !vigente,
  }

  /* Cierra al hacer clic fuera */
  useEffect(() => {
    const alPulsar = (evento) => {
      if (!contenedor.current?.contains(evento.target)) setAbierto(false)
    }
    document.addEventListener('pointerdown', alPulsar)
    return () => document.removeEventListener('pointerdown', alPulsar)
  }, [])

  const cerrar = () => {
    setAbierto(false)
    setTexto('')
  }

  const enviar = (evento) => {
    evento.preventDefault()
    const producto = resultado.productos[activo]
    if (producto) navegar(`/productos/${producto.slug}`)
    else if (texto.trim()) navegar(`/productos?q=${encodeURIComponent(texto.trim())}`)
    cerrar()
  }

  const alTeclear = (evento) => {
    if (evento.key === 'Escape') setAbierto(false)
    if (!resultado.productos.length) return
    if (evento.key === 'ArrowDown') {
      evento.preventDefault()
      setActivo((i) => (i + 1) % resultado.productos.length)
    }
    if (evento.key === 'ArrowUp') {
      evento.preventDefault()
      setActivo((i) => (i <= 0 ? resultado.productos.length - 1 : i - 1))
    }
  }

  const mostrarPanel = abierto && termino.length >= 2

  return (
    <div className={`buscador ${className}`} ref={contenedor}>
      <form role="search" onSubmit={enviar} className="buscador__form">
        <Search className="buscador__icono" aria-hidden="true" />
        <input
          type="search"
          className="buscador__input"
          placeholder="Buscar productos..."
          aria-label="Buscar productos"
          value={texto}
          onChange={(e) => {
            setTexto(e.target.value)
            setAbierto(true)
          }}
          onFocus={() => setAbierto(true)}
          onKeyDown={alTeclear}
          role="combobox"
          aria-expanded={mostrarPanel}
          aria-controls={idLista}
          aria-autocomplete="list"
          autoComplete="off"
        />
        {resultado.cargando && <Loader2 className="buscador__cargando" aria-hidden="true" />}
      </form>

      {mostrarPanel && (
        <div className="buscador__panel" id={idLista} role="listbox">
          {resultado.productos.length === 0 && !resultado.cargando && (
            <p className="buscador__vacio">
              No encontramos “{termino}”. Escríbenos y te ayudamos a conseguirlo.
            </p>
          )}

          {resultado.productos.map((producto, i) => (
            <Link
              key={producto.id}
              to={`/productos/${producto.slug}`}
              className={`buscador__item${i === activo ? ' buscador__item--activo' : ''}`}
              role="option"
              aria-selected={i === activo}
              onClick={cerrar}
            >
              <span className="buscador__miniatura">
                {portada(producto, 120) && <img src={portada(producto, 120)} alt="" loading="lazy" />}
              </span>
              <span className="buscador__info">
                <span className="buscador__nombre">{producto.nombre}</span>
                <span className="buscador__categoria">{producto.categoria?.nombre ?? 'Producto'}</span>
              </span>
            </Link>
          ))}

          {resultado.total > resultado.productos.length && (
            <button type="button" className="buscador__todos" onClick={enviar}>
              Ver los {resultado.total} resultados <ArrowRight aria-hidden="true" />
            </button>
          )}
        </div>
      )}
    </div>
  )
}

export default BuscadorGlobal
