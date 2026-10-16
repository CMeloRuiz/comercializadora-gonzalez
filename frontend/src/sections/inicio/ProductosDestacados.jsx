import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, PackageSearch } from 'lucide-react'
import { catalogo } from '../../lib/api'
import { useConsulta } from '../../hooks'
import GrillaProductos from '../../components/productos/GrillaProductos'
import EstadoMensaje from '../../components/ui/EstadoMensaje'
import Reveal from '../../components/ui/Reveal'
import './ProductosDestacados.css'

const PESTANAS = [
  { id: 'destacados', texto: 'Más cotizados', filtro: { destacado: true } },
  { id: 'nuevos', texto: 'Novedades', filtro: { nuevo: true } },
  { id: 'todos', texto: 'Todo el catálogo', filtro: { orden: 'recientes' } },
]

function ProductosDestacados() {
  const [pestana, setPestana] = useState(PESTANAS[0])
  const { datos, cargando, error, reintentar } = useConsulta(
    (opciones) => catalogo.productos({ ...pestana.filtro, limite: 8 }, opciones),
    [pestana.id]
  )

  return (
    <section className="seccion destacados">
      <div className="contenedor">
        <Reveal className="seccion__cabecera">
          <div>
            <p className="seccion__antetitulo">Catálogo</p>
            <h2 className="seccion__titulo">Productos que nuestros clientes prefieren</h2>
          </div>

          <div className="destacados__pestanas" role="tablist" aria-label="Filtrar productos">
            {PESTANAS.map((p) => (
              <button
                key={p.id}
                type="button"
                role="tab"
                aria-selected={p.id === pestana.id}
                className={`destacados__pestana${p.id === pestana.id ? ' destacados__pestana--activa' : ''}`}
                onClick={() => setPestana(p)}
              >
                {p.texto}
              </button>
            ))}
          </div>
        </Reveal>

        {error ? (
          <EstadoMensaje
            icono={PackageSearch}
            tono="error"
            titulo="No pudimos cargar los productos"
            acciones={<button type="button" className="btn btn--contorno" onClick={reintentar}>Reintentar</button>}
          >
            {error.message}
          </EstadoMensaje>
        ) : !cargando && datos?.productos.length === 0 ? (
          <EstadoMensaje icono={PackageSearch} titulo="Muy pronto">
            Estamos preparando esta selección. Mientras tanto, explora el catálogo completo.
          </EstadoMensaje>
        ) : (
          <GrillaProductos productos={datos?.productos ?? []} cargando={cargando} />
        )}

        <div className="destacados__pie">
          <Link to="/productos" className="btn btn--oscuro btn--grande">
            Ver catálogo completo <ArrowRight />
          </Link>
        </div>
      </div>
    </section>
  )
}

export default ProductosDestacados
