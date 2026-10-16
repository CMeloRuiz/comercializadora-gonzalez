import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  AlertTriangle, ArrowRight, CheckCircle2, CircleDollarSign, EyeOff, FolderTree, ImageOff, Layers, Package, Plus, RefreshCw, Star,
} from 'lucide-react'
import { api, sesion } from '../api'
import { CabeceraPagina } from '../AdminLayout'
import { Vacio } from '../componentes/ui'
import { tiempoRelativo } from '../utilidades'
import Miniatura from '../componentes/Miniatura'
import '../estilos/resumen.css'

function saludo() {
  const hora = new Date().getHours()
  if (hora < 12) return 'Buenos días'
  if (hora < 19) return 'Buenas tardes'
  return 'Buenas noches'
}

function Resumen() {
  const [datos, setDatos] = useState(null)
  const [error, setError] = useState(null)
  const [intento, setIntento] = useState(0)

  useEffect(() => {
    const control = new AbortController()
    api.resumen({ signal: control.signal })
      .then((respuesta) => {
        setDatos(respuesta)
        setError(null)
      })
      .catch((e) => e.name !== 'AbortError' && setError(e))
    return () => control.abort()
  }, [intento])

  const reintentar = () => {
    setError(null)
    setIntento((n) => n + 1)
  }

  if (error) {
    return (
      <>
        <CabeceraPagina titulo="Resumen" />
        <div className="adm-tarjeta">
          <Vacio
            icono={AlertTriangle}
            titulo="No se pudo cargar el resumen"
            acciones={<button type="button" className="adm-btn adm-btn--secundario" onClick={reintentar}><RefreshCw /> Reintentar</button>}
          >
            {error.message}
          </Vacio>
        </div>
      </>
    )
  }

  const t = datos?.totales
  const metricas = [
    { etiqueta: 'Productos', valor: t?.total, detalle: t && `${t.referencias} referencias en total`, icono: Package, tono: 'marca' },
    { etiqueta: 'Publicados', valor: t?.publicados, detalle: t && `${t.total ? Math.round((t.publicados / t.total) * 100) : 0}% del catálogo visible`, icono: CheckCircle2, tono: 'exito' },
    { etiqueta: 'Destacados', valor: t?.destacados, detalle: 'Aparecen en el inicio', icono: Star, tono: 'violeta' },
    { etiqueta: 'Borradores', valor: t?.borradores, detalle: 'Ocultos en la tienda', icono: EyeOff, tono: 'neutro' },
  ]

  const pendientes = t
    ? [
      t.sinImagen > 0 && { icono: ImageOff, texto: `${t.sinImagen} ${t.sinImagen === 1 ? 'producto no tiene' : 'productos no tienen'} imagen`, a: '/admin/productos?estado=sin-imagen', tono: 'aviso' },
      t.borradores > 0 && { icono: EyeOff, texto: `${t.borradores} ${t.borradores === 1 ? 'borrador pendiente' : 'borradores pendientes'} de publicar`, a: '/admin/productos?estado=borradores', tono: 'neutro' },
      t.agotados > 0 && { icono: Layers, texto: `${t.agotados} ${t.agotados === 1 ? 'producto marcado' : 'productos marcados'} como bajo pedido`, a: '/admin/productos?estado=agotados', tono: 'neutro' },
      t.sinPrecio > 0 && { icono: CircleDollarSign, texto: `${t.sinPrecio} sin precio interno (no se muestra al público)`, a: '/admin/productos', tono: 'info' },
    ].filter(Boolean)
    : []

  const maximoCategoria = Math.max(1, ...(datos?.porCategoria.map((c) => c.total) ?? [1]))

  return (
    <>
      <CabeceraPagina
        titulo={`${saludo()}, ${sesion.usuario()}`}
        descripcion="Así va el catálogo de la tienda."
        acciones={
          <>
            <Link to="/admin/categorias" className="adm-btn adm-btn--secundario"><FolderTree /> Categorías</Link>
            <Link to="/admin/productos/nuevo" className="adm-btn adm-btn--primario"><Plus /> Nuevo producto</Link>
          </>
        }
      />

      {datos?.almacenamiento === 'local' && (
        <div className="adm-alerta adm-resumen__alerta">
          <AlertTriangle aria-hidden="true" />
          <span>
            <strong>Imágenes en modo desarrollo.</strong> Las fotos que subas se guardan en el servidor local. Antes de publicar
            el sitio configura Supabase Storage en el backend, o se perderán en cada despliegue.
          </span>
        </div>
      )}

      <div className="adm-metricas">
        {metricas.map(({ etiqueta, valor, detalle, icono: Icono, tono }) => (
          <div key={etiqueta} className="adm-tarjeta adm-metrica">
            <div className="adm-metrica__cabecera">
              <span>{etiqueta}</span>
              <span className={`adm-metrica__icono adm-metrica__icono--${tono}`}><Icono aria-hidden="true" /></span>
            </div>
            {valor === undefined ? (
              <span className="adm-esqueleto" style={{ height: 34, width: 64, marginTop: 8 }} />
            ) : (
              <strong className="adm-metrica__valor adm-tabular">{valor}</strong>
            )}
            <span className="adm-metrica__detalle">{detalle ?? ' '}</span>
          </div>
        ))}
      </div>

      <div className="adm-resumen__rejilla">
        <section className="adm-tarjeta adm-resumen__recientes">
          <div className="adm-tarjeta__cabecera">
            <div>
              <h2 className="adm-tarjeta__titulo">Actividad reciente</h2>
              <p className="adm-tarjeta__descripcion">Los últimos productos creados o editados</p>
            </div>
            <Link to="/admin/productos" className="adm-btn adm-btn--fantasma adm-btn--sm">Ver todos <ArrowRight /></Link>
          </div>

          {!datos ? (
            <ul className="adm-recientes">
              {Array.from({ length: 5 }, (_, i) => (
                <li key={i} className="adm-reciente">
                  <span className="adm-esqueleto" style={{ width: 40, height: 40 }} />
                  <span className="adm-esqueleto" style={{ height: 14, flex: 1 }} />
                </li>
              ))}
            </ul>
          ) : datos.recientes.length === 0 ? (
            <Vacio
              icono={Package}
              titulo="Aún no hay productos"
              acciones={<Link to="/admin/productos/nuevo" className="adm-btn adm-btn--primario"><Plus /> Crear el primero</Link>}
            >
              Crea tu primer producto y aparecerá en la tienda.
            </Vacio>
          ) : (
            <ul className="adm-recientes">
              {datos.recientes.map((producto) => (
                <li key={producto.id}>
                  <Link to={`/admin/productos/${producto.id}`} className="adm-reciente">
                    <Miniatura producto={producto} />
                    <span className="adm-reciente__texto">
                      <strong>{producto.nombre}</strong>
                      <span>{producto.categoria?.nombre ?? 'Sin categoría'}</span>
                    </span>
                    <span className={`adm-insignia ${producto.publicado ? 'adm-insignia--exito' : ''}`}>
                      <span className="adm-insignia__punto" />
                      {producto.publicado ? 'Publicado' : 'Borrador'}
                    </span>
                    <span className="adm-reciente__fecha">{tiempoRelativo(producto.actualizadoEn)}</span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>

        <div className="adm-resumen__lateral">
          <section className="adm-tarjeta">
            <div className="adm-tarjeta__cabecera">
              <h2 className="adm-tarjeta__titulo">Por categoría</h2>
            </div>
            <div className="adm-tarjeta__cuerpo">
              {!datos ? (
                <span className="adm-esqueleto" style={{ height: 120 }} />
              ) : datos.porCategoria.length === 0 ? (
                <p className="adm-resumen__nada">Todavía no hay categorías.</p>
              ) : (
                <ul className="adm-barras">
                  {datos.porCategoria.map((categoria) => (
                    <li key={categoria.id}>
                      <div className="adm-barras__texto">
                        <span>{categoria.nombre}</span>
                        <strong className="adm-tabular">{categoria.total}</strong>
                      </div>
                      <div className="adm-barras__pista">
                        <span style={{ width: `${(categoria.total / maximoCategoria) * 100}%` }} />
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </section>

          <section className="adm-tarjeta">
            <div className="adm-tarjeta__cabecera">
              <h2 className="adm-tarjeta__titulo">Pendientes</h2>
            </div>
            <div className="adm-tarjeta__cuerpo adm-pendientes">
              {!datos ? (
                <span className="adm-esqueleto" style={{ height: 80 }} />
              ) : pendientes.length === 0 ? (
                <p className="adm-pendientes__listo"><CheckCircle2 aria-hidden="true" /> Todo en orden. ¡Buen trabajo!</p>
              ) : (
                pendientes.map(({ icono: Icono, texto, a, tono }) => (
                  <Link key={texto} to={a} className={`adm-pendiente adm-pendiente--${tono}`}>
                    <Icono aria-hidden="true" />
                    <span>{texto}</span>
                    <ArrowRight aria-hidden="true" className="adm-pendiente__flecha" />
                  </Link>
                ))
              )}
            </div>
          </section>
        </div>
      </div>
    </>
  )
}

export default Resumen
