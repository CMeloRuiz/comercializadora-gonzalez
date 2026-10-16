import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import {
  AlertTriangle, ExternalLink, MoreHorizontal, Package, Pencil, Plus, RefreshCw, Search, SearchX, Star, Trash2, X,
} from 'lucide-react'
import { api } from '../api'
import { useAvisos } from '../componentes/Avisos'
import { Confirmar, Interruptor, Menu, Vacio } from '../componentes/ui'
import { formatoPesos, tiempoRelativo } from '../utilidades'
import Miniatura from '../componentes/Miniatura'
import { CabeceraPagina } from '../AdminLayout'
import { useRetraso } from '../../hooks'
import '../estilos/productos.css'

const ESTADOS = [
  { valor: '', texto: 'Todos' },
  { valor: 'publicados', texto: 'Publicados' },
  { valor: 'borradores', texto: 'Borradores' },
  { valor: 'destacados', texto: 'Destacados' },
  { valor: 'agotados', texto: 'Bajo pedido' },
  { valor: 'sin-imagen', texto: 'Sin imagen' },
]

function Productos() {
  const avisar = useAvisos()
  const navegar = useNavigate()
  const [parametros, setParametros] = useSearchParams()
  const estado = parametros.get('estado') ?? ''
  const categoria = parametros.get('categoria') ?? ''

  const [texto, setTexto] = useState(parametros.get('q') ?? '')
  const q = useRetraso(texto.trim(), 300)

  const [productos, setProductos] = useState(null)
  const [categorias, setCategorias] = useState([])
  const [error, setError] = useState(null)
  const [intento, setIntento] = useState(0)
  const [aEliminar, setAEliminar] = useState(null)
  const [eliminando, setEliminando] = useState(false)

  useEffect(() => {
    api.categorias().then(setCategorias).catch(() => {})
  }, [])

  useEffect(() => {
    const control = new AbortController()
    api.productos({ q, categoria, estado }, { signal: control.signal })
      .then((lista) => {
        setProductos(lista)
        setError(null)
      })
      .catch((e) => e.name !== 'AbortError' && setError(e))
    return () => control.abort()
  }, [q, categoria, estado, intento])

  /* La busqueda tambien queda en la URL, para volver al mismo listado desde el editor */
  useEffect(() => {
    setParametros((previos) => {
      const siguientes = new URLSearchParams(previos)
      if (q) siguientes.set('q', q)
      else siguientes.delete('q')
      return siguientes
    }, { replace: true })
  }, [q, setParametros])

  const filtrar = (clave, valor) => {
    setParametros((previos) => {
      const siguientes = new URLSearchParams(previos)
      if (valor) siguientes.set(clave, valor)
      else siguientes.delete(clave)
      return siguientes
    }, { replace: true })
  }

  const hayFiltros = Boolean(q || categoria || estado)
  const limpiarFiltros = () => {
    setTexto('')
    setParametros(new URLSearchParams(), { replace: true })
  }

  /* Cambio rapido (publicar / destacar): se aplica al instante y se revierte si falla */
  const cambiar = async (producto, cambios, mensaje) => {
    setProductos((lista) => lista.map((p) => (p.id === producto.id ? { ...p, ...cambios } : p)))
    try {
      await api.cambiarProducto(producto.id, cambios)
      avisar.exito(mensaje, producto.nombre)
    } catch (e) {
      setProductos((lista) => lista.map((p) => (p.id === producto.id ? producto : p)))
      avisar.error('No se pudo guardar el cambio', e.message)
    }
  }

  const eliminar = async () => {
    setEliminando(true)
    try {
      await api.eliminarProducto(aEliminar.id)
      setProductos((lista) => lista.filter((p) => p.id !== aEliminar.id))
      avisar.exito('Producto eliminado', aEliminar.nombre)
      setAEliminar(null)
    } catch (e) {
      avisar.error('No se pudo eliminar', e.message)
    } finally {
      setEliminando(false)
    }
  }

  const descripcion = useMemo(() => {
    if (!productos) return 'Cargando catálogo...'
    const publicados = productos.filter((p) => p.publicado).length
    return hayFiltros
      ? `${productos.length} ${productos.length === 1 ? 'resultado' : 'resultados'}`
      : `${productos.length} productos · ${publicados} publicados`
  }, [productos, hayFiltros])

  return (
    <>
      <CabeceraPagina
        titulo="Productos"
        descripcion={descripcion}
        acciones={<Link to="/admin/productos/nuevo" className="adm-btn adm-btn--primario"><Plus /> Nuevo producto</Link>}
      />

      <div className="adm-tarjeta adm-productos">
        {/* ------------------------------ Filtros ------------------------------ */}
        <div className="adm-filtros">
          <div className="adm-segmentos" role="tablist" aria-label="Estado">
            {ESTADOS.map((e) => (
              <button
                key={e.valor}
                type="button"
                role="tab"
                aria-selected={estado === e.valor}
                className={`adm-segmento${estado === e.valor ? ' adm-segmento--activo' : ''}`}
                onClick={() => filtrar('estado', e.valor)}
              >
                {e.texto}
              </button>
            ))}
          </div>

          <div className="adm-filtros__controles">
            <div className="adm-input-grupo adm-filtros__busqueda">
              <Search aria-hidden="true" />
              <input
                className="adm-input"
                type="search"
                placeholder="Buscar por nombre, marca o referencia"
                aria-label="Buscar productos"
                value={texto}
                onChange={(e) => setTexto(e.target.value)}
              />
            </div>
            <select className="adm-select adm-filtros__categoria" value={categoria} onChange={(e) => filtrar('categoria', e.target.value)} aria-label="Filtrar por categoría">
              <option value="">Todas las categorías</option>
              {categorias.map((c) => <option key={c.id} value={c.id}>{c.nombre}</option>)}
              <option value="sin-categoria">Sin categoría</option>
            </select>
            {hayFiltros && (
              <button type="button" className="adm-btn adm-btn--fantasma" onClick={limpiarFiltros}>
                <X /> Limpiar
              </button>
            )}
          </div>
        </div>

        {/* ------------------------------- Tabla ------------------------------- */}
        {error ? (
          <Vacio
            icono={AlertTriangle}
            titulo="No se pudieron cargar los productos"
            acciones={<button type="button" className="adm-btn adm-btn--secundario" onClick={() => { setError(null); setProductos(null); setIntento((n) => n + 1) }}><RefreshCw /> Reintentar</button>}
          >
            {error.message}
          </Vacio>
        ) : productos && productos.length === 0 ? (
          hayFiltros ? (
            <Vacio
              icono={SearchX}
              titulo="Sin resultados"
              acciones={<button type="button" className="adm-btn adm-btn--secundario" onClick={limpiarFiltros}>Limpiar filtros</button>}
            >
              Ningún producto coincide con los filtros. Prueba con otra búsqueda.
            </Vacio>
          ) : (
            <Vacio
              icono={Package}
              titulo="Tu catálogo está vacío"
              acciones={<Link to="/admin/productos/nuevo" className="adm-btn adm-btn--primario"><Plus /> Crear producto</Link>}
            >
              Agrega tu primer producto con fotos, descripción y presentaciones. Aparecerá en la tienda al publicarlo.
            </Vacio>
          )
        ) : (
          <div className="adm-tabla-contenedor">
            <table className="adm-tabla adm-tabla-productos">
              <thead>
                <tr>
                  <th>Producto</th>
                  <th>Categoría</th>
                  <th>Publicado</th>
                  <th className="adm-col-centro">Destacado</th>
                  <th>Precio interno</th>
                  <th>Actualizado</th>
                  <th><span className="solo-lectores">Acciones</span></th>
                </tr>
              </thead>
              <tbody>
                {!productos
                  ? Array.from({ length: 6 }, (_, i) => (
                    <tr key={i} className="adm-fila-carga">
                      <td><div className="adm-producto-celda"><span className="adm-esqueleto" style={{ width: 44, height: 44 }} /><span className="adm-esqueleto" style={{ width: 180, height: 14 }} /></div></td>
                      <td><span className="adm-esqueleto" style={{ width: 90, height: 14 }} /></td>
                      <td><span className="adm-esqueleto" style={{ width: 36, height: 20, borderRadius: 999 }} /></td>
                      <td><span className="adm-esqueleto" style={{ width: 20, height: 20, margin: 'auto' }} /></td>
                      <td><span className="adm-esqueleto" style={{ width: 60, height: 14 }} /></td>
                      <td><span className="adm-esqueleto" style={{ width: 70, height: 14 }} /></td>
                      <td />
                    </tr>
                  ))
                  : productos.map((producto) => (
                    <tr key={producto.id} onClick={(e) => { if (!e.target.closest('button, a, label, input')) navegar(`/admin/productos/${producto.id}`) }}>
                      <td data-etiqueta="Producto">
                        <div className="adm-producto-celda">
                          <Miniatura producto={producto} tamano={44} />
                          <div className="adm-producto-celda__texto">
                            <Link to={`/admin/productos/${producto.id}`} className="adm-producto-celda__nombre">{producto.nombre}</Link>
                            <span>
                              {[producto.marca, producto.referencia && `Ref. ${producto.referencia}`, producto.variantes.length > 1 && `${producto.variantes.length} presentaciones`]
                                .filter(Boolean).join(' · ') || 'Sin detalles'}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td data-etiqueta="Categoría">
                        {producto.categoria ? <span className="adm-insignia">{producto.categoria.nombre}</span> : <span className="adm-texto-tenue">Sin categoría</span>}
                      </td>
                      <td data-etiqueta="Publicado">
                        <div className="adm-celda-estado">
                          <Interruptor
                            checked={producto.publicado}
                            onChange={(valor) => cambiar(producto, { publicado: valor }, valor ? 'Producto publicado' : 'Producto ocultado')}
                          />
                          {!producto.disponible && <span className="adm-insignia adm-insignia--aviso">Bajo pedido</span>}
                        </div>
                      </td>
                      <td data-etiqueta="Destacado" className="adm-col-centro">
                        <button
                          type="button"
                          className={`adm-estrella${producto.destacado ? ' adm-estrella--activa' : ''}`}
                          aria-pressed={producto.destacado}
                          aria-label={producto.destacado ? 'Quitar de destacados' : 'Marcar como destacado'}
                          title={producto.destacado ? 'Quitar de destacados' : 'Destacar en el inicio'}
                          onClick={() => cambiar(producto, { destacado: !producto.destacado }, producto.destacado ? 'Quitado de destacados' : 'Añadido a destacados')}
                        >
                          <Star />
                        </button>
                      </td>
                      <td data-etiqueta="Precio" className="adm-tabular">
                        {producto.precio !== null ? formatoPesos.format(producto.precio) : <span className="adm-texto-tenue">—</span>}
                      </td>
                      <td data-etiqueta="Actualizado" className="adm-texto-tenue adm-nowrap">{tiempoRelativo(producto.actualizadoEn)}</td>
                      <td className="adm-col-acciones">
                        <Menu
                          disparador={({ alternar, abierto }) => (
                            <button type="button" className="adm-btn adm-btn--fantasma adm-btn--sm adm-btn--icono" onClick={alternar} aria-expanded={abierto} aria-label={`Acciones de ${producto.nombre}`}>
                              <MoreHorizontal />
                            </button>
                          )}
                        >
                          <Link to={`/admin/productos/${producto.id}`} className="adm-menu__item" role="menuitem"><Pencil /> Editar</Link>
                          {producto.publicado && (
                            <a href={`/productos/${producto.slug}`} target="_blank" rel="noreferrer" className="adm-menu__item" role="menuitem">
                              <ExternalLink /> Ver en la tienda
                            </a>
                          )}
                          <div className="adm-menu__separador" />
                          <button type="button" className="adm-menu__item adm-menu__item--peligro" role="menuitem" onClick={() => setAEliminar(producto)}>
                            <Trash2 /> Eliminar
                          </button>
                        </Menu>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Confirmar
        abierto={Boolean(aEliminar)}
        titulo="¿Eliminar este producto?"
        procesando={eliminando}
        alConfirmar={eliminar}
        alCerrar={() => setAEliminar(null)}
      >
        Se eliminará <strong>{aEliminar?.nombre}</strong> junto con sus imágenes. Esta acción no se puede deshacer.
        Si solo quieres ocultarlo de la tienda, desactiva “Publicado”.
      </Confirmar>
    </>
  )
}

export default Productos
