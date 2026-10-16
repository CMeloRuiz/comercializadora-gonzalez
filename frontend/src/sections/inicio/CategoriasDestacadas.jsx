import { Link } from 'react-router-dom'
import { ArrowUpRight } from 'lucide-react'
import { catalogo } from '../../lib/api'
import { imagenAncho } from '../../lib/imagenes'
import { useConsulta } from '../../hooks'
import Reveal from '../../components/ui/Reveal'
import './CategoriasDestacadas.css'

/**
 * "Compra por categoria". Cada tarjeta usa la imagen propia de la categoria
 * (subida desde el panel) o, si no tiene, la de su producto principal.
 */
function CategoriasDestacadas() {
  const { datos: categorias, cargando } = useConsulta((opciones) => catalogo.categorias(opciones), [])
  const visibles = (categorias ?? []).filter((c) => c.totalProductos > 0)

  if (!cargando && visibles.length === 0) return null

  return (
    <section className="categorias">
      <div className="categorias__banda" aria-hidden="true" />

      <div className="contenedor">
        <Reveal className="seccion__cabecera seccion__cabecera--centrada categorias__cabecera">
          <p className="seccion__antetitulo">Categorías</p>
          <h2 className="seccion__titulo">Compra por categoría</h2>
          <p className="seccion__descripcion">Encuentra más rápido lo que tu proyecto necesita.</p>
        </Reveal>

        <div className="categorias__rejilla">
          {cargando
            ? Array.from({ length: 5 }, (_, i) => <div key={i} className="categoria-tarjeta categoria-tarjeta--cargando" />)
            : visibles.map((categoria, i) => {
              const imagen = imagenAncho(categoria.imagen?.url ?? categoria.imagenRespaldo, 480)
              return (
                <Reveal key={categoria.id} retraso={i * 70} desde="escala">
                  <Link to={`/productos?categoria=${categoria.slug}`} className="categoria-tarjeta">
                    <span className="categoria-tarjeta__media">
                      {/* Imagen de categoria: 800 x 800 px, fondo claro o transparente */}
                      {imagen && <img src={imagen} alt="" loading="lazy" width="400" height="400" />}
                    </span>
                    <span className="categoria-tarjeta__info">
                      <span className="categoria-tarjeta__nombre">{categoria.nombre}</span>
                      <span className="categoria-tarjeta__conteo">
                        {categoria.totalProductos} {categoria.totalProductos === 1 ? 'producto' : 'productos'}
                      </span>
                    </span>
                    <span className="categoria-tarjeta__flecha" aria-hidden="true">
                      <ArrowUpRight />
                    </span>
                  </Link>
                </Reveal>
              )
            })}
        </div>
      </div>
    </section>
  )
}

export default CategoriasDestacadas
