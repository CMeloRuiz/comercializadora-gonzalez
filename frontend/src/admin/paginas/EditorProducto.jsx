import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import {
  AlertTriangle, ArrowLeft, ExternalLink, ImageOff, Layers, Lock, RefreshCw, Trash2,
} from 'lucide-react'
import { api } from '../api'
import { useAvisos } from '../componentes/Avisos'
import { Campo, Confirmar, Contador, Interruptor, Vacio } from '../componentes/ui'
import { EditorEspecificaciones, EditorEtiquetas, EditorLista } from '../componentes/Editores'
import SubidorImagenes from '../componentes/SubidorImagenes'
import { CabeceraPagina } from '../AdminLayout'
import { imagenAncho } from '../../lib/imagenes'
import { crearSlug } from '../utilidades'
import '../estilos/editor.css'

const VACIO = {
  nombre: '',
  slug: '',
  categoriaId: '',
  marca: '',
  referencia: '',
  resumen: '',
  descripcion: '',
  caracteristicas: [],
  aplicaciones: [],
  especificaciones: [],
  variantes: [],
  imagenes: [],
  precio: '',
  disponible: true,
  destacado: false,
  nuevo: false,
  publicado: true,
}

/** Producto de la API -> estado del formulario */
function aFormulario(producto) {
  return {
    ...VACIO,
    ...producto,
    categoriaId: producto.categoria?.id ?? '',
    marca: producto.marca ?? '',
    referencia: producto.referencia ?? '',
    precio: producto.precio ?? '',
  }
}

/** Estado del formulario -> cuerpo para la API (sin filas vacias) */
function aCuerpo(form) {
  return {
    nombre: form.nombre,
    slug: form.slug,
    categoriaId: form.categoriaId || null,
    marca: form.marca,
    referencia: form.referencia,
    resumen: form.resumen,
    descripcion: form.descripcion,
    caracteristicas: form.caracteristicas.map((c) => c.trim()).filter(Boolean),
    aplicaciones: form.aplicaciones,
    especificaciones: form.especificaciones.filter((f) => f.etiqueta.trim() && f.valor.trim()),
    variantes: form.variantes,
    imagenes: form.imagenes,
    precio: form.precio === '' ? null : form.precio,
    disponible: form.disponible,
    destacado: form.destacado,
    nuevo: form.nuevo,
    publicado: form.publicado,
  }
}

function EditorProducto() {
  const { id } = useParams()
  const esNuevo = !id
  const navegar = useNavigate()
  const avisar = useAvisos()

  const [form, setForm] = useState(VACIO)
  const [original, setOriginal] = useState(VACIO)
  const [categorias, setCategorias] = useState([])
  const [cargando, setCargando] = useState(!esNuevo)
  const [errorCarga, setErrorCarga] = useState(null)
  const [errores, setErrores] = useState({})
  const [guardando, setGuardando] = useState(false)
  const [confirmarEliminar, setConfirmarEliminar] = useState(false)
  const [eliminando, setEliminando] = useState(false)
  const [slugEditado, setSlugEditado] = useState(false)
  const [intento, setIntento] = useState(0)

  useEffect(() => {
    api.categorias().then(setCategorias).catch(() => {})
  }, [])

  useEffect(() => {
    /* Nuevo: el formulario ya arranca vacio. Cada ruta monta su propio editor */
    if (esNuevo) return
    const control = new AbortController()
    api.producto(id, { signal: control.signal })
      .then((producto) => {
        const datos = aFormulario(producto)
        setForm(datos)
        setOriginal(datos)
        setSlugEditado(true)
        setCargando(false)
      })
      .catch((e) => {
        if (e.name === 'AbortError') return
        setErrorCarga(e)
        setCargando(false)
      })
    return () => control.abort()
  }, [id, esNuevo, intento])

  const hayCambios = useMemo(() => JSON.stringify(aCuerpo(form)) !== JSON.stringify(aCuerpo(original)), [form, original])

  /* Aviso del navegador al cerrar o recargar con cambios sin guardar */
  useEffect(() => {
    if (!hayCambios) return
    const alSalir = (e) => {
      e.preventDefault()
      e.returnValue = ''
    }
    window.addEventListener('beforeunload', alSalir)
    return () => window.removeEventListener('beforeunload', alSalir)
  }, [hayCambios])

  /** Cambia un campo; acepta valor o funcion (como setState) */
  const campo = useCallback((nombre) => (valor) => {
    setForm((f) => ({ ...f, [nombre]: typeof valor === 'function' ? valor(f[nombre]) : valor }))
    setErrores((e) => (e[nombre] ? { ...e, [nombre]: undefined } : e))
  }, [])

  const cambiarNombre = (valor) => {
    setForm((f) => ({ ...f, nombre: valor, slug: slugEditado ? f.slug : crearSlug(valor) }))
    setErrores((e) => ({ ...e, nombre: undefined }))
  }

  const guardar = useCallback(async () => {
    if (guardando) return
    if (form.nombre.trim().length < 3) {
      setErrores({ nombre: 'Escribe un nombre de al menos 3 caracteres' })
      avisar.error('Revisa el formulario', 'El producto necesita un nombre')
      document.querySelector('[data-campo="nombre"]')?.focus()
      return
    }

    setGuardando(true)
    try {
      const guardado = esNuevo ? await api.crearProducto(aCuerpo(form)) : await api.guardarProducto(id, aCuerpo(form))
      const datos = aFormulario(guardado)
      setForm(datos)
      setOriginal(datos)
      setErrores({})
      if (esNuevo) {
        avisar.exito('Producto creado', guardado.publicado ? 'Ya está visible en la tienda' : 'Quedó guardado como borrador')
        navegar(`/admin/productos/${guardado.id}`, { replace: true })
      } else {
        avisar.exito('Cambios guardados', guardado.publicado ? 'La tienda ya muestra la nueva versión' : 'El producto sigue oculto (borrador)')
      }
    } catch (e) {
      setErrores(e.campos ?? {})
      avisar.error('No se pudo guardar', e.message)
    } finally {
      setGuardando(false)
    }
  }, [avisar, esNuevo, form, guardando, id, navegar])

  /* Ctrl/Cmd + S guarda */
  useEffect(() => {
    const alTeclear = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 's') {
        e.preventDefault()
        if (hayCambios || esNuevo) guardar()
      }
    }
    window.addEventListener('keydown', alTeclear)
    return () => window.removeEventListener('keydown', alTeclear)
  }, [guardar, hayCambios, esNuevo])

  const eliminar = async () => {
    setEliminando(true)
    try {
      await api.eliminarProducto(id)
      setOriginal(form)
      avisar.exito('Producto eliminado', form.nombre)
      navegar('/admin/productos', { replace: true })
    } catch (e) {
      avisar.error('No se pudo eliminar', e.message)
      setEliminando(false)
    }
  }

  const volver = (
    <Link
      to="/admin/productos"
      className="adm-volver"
      onClick={(e) => {
        if (hayCambios && !window.confirm('Tienes cambios sin guardar. ¿Salir de todos modos?')) e.preventDefault()
      }}
    >
      <ArrowLeft /> Productos
    </Link>
  )

  if (errorCarga) {
    return (
      <>
        <CabeceraPagina titulo="Editar producto" volver={volver} />
        <div className="adm-tarjeta">
          <Vacio
            icono={AlertTriangle}
            titulo={errorCarga.estado === 404 ? 'Este producto no existe' : 'No se pudo cargar el producto'}
            acciones={
              errorCarga.estado === 404
                ? <Link to="/admin/productos" className="adm-btn adm-btn--secundario">Volver al listado</Link>
                : <button type="button" className="adm-btn adm-btn--secundario" onClick={() => { setErrorCarga(null); setCargando(true); setIntento((n) => n + 1) }}><RefreshCw /> Reintentar</button>
            }
          >
            {errorCarga.estado === 404 ? 'Puede que se haya eliminado.' : errorCarga.message}
          </Vacio>
        </div>
      </>
    )
  }

  if (cargando) return <EditorEsqueleto volver={volver} />

  const categoriaElegida = categorias.find((c) => String(c.id) === String(form.categoriaId))

  return (
    <form
      className="adm-editor"
      onSubmit={(e) => {
        e.preventDefault()
        guardar()
      }}
      noValidate
    >
      <CabeceraPagina
        volver={volver}
        titulo={
          <span className="adm-editor__titulo">
            {esNuevo ? 'Nuevo producto' : original.nombre || 'Producto'}
            {!esNuevo && (
              <span className={`adm-insignia ${original.publicado ? 'adm-insignia--exito' : ''}`}>
                <span className="adm-insignia__punto" /> {original.publicado ? 'Publicado' : 'Borrador'}
              </span>
            )}
          </span>
        }
        descripcion={esNuevo ? 'Completa la ficha. Solo el nombre es obligatorio.' : 'Los cambios se ven en la tienda al guardar.'}
        acciones={
          !esNuevo && (
            <>
              {original.publicado && (
                <a href={`/productos/${original.slug}`} target="_blank" rel="noreferrer" className="adm-btn adm-btn--secundario">
                  <ExternalLink /> Ver en tienda
                </a>
              )}
              <button type="button" className="adm-btn adm-btn--secundario adm-editor__eliminar" onClick={() => setConfirmarEliminar(true)}>
                <Trash2 /> Eliminar
              </button>
            </>
          )
        }
      />

      <div className="adm-editor__rejilla">
        {/* ============================ Columna principal ============================ */}
        <div className="adm-editor__principal">
          <section className="adm-tarjeta">
            <div className="adm-tarjeta__cabecera">
              <div>
                <h2 className="adm-tarjeta__titulo">Información básica</h2>
                <p className="adm-tarjeta__descripcion">Lo primero que ve el cliente en la tarjeta y el detalle.</p>
              </div>
            </div>
            <div className="adm-tarjeta__cuerpo adm-editor__campos">
              <Campo etiqueta="Nombre del producto" error={errores.nombre} extra={<Contador actual={form.nombre.length} maximo={160} />}>
                {(props) => (
                  <input {...props} data-campo="nombre" className="adm-input" maxLength={160} value={form.nombre} onChange={(e) => cambiarNombre(e.target.value)} placeholder="Ej.: Panel LED redondo de incrustar" />
                )}
              </Campo>

              <Campo
                etiqueta="Resumen"
                opcional
                ayuda="Una frase que venda: aparece en la tarjeta, el buscador y al compartir el enlace."
                extra={<Contador actual={form.resumen.length} maximo={300} />}
              >
                {(props) => (
                  <textarea {...props} className="adm-textarea" rows={2} maxLength={300} value={form.resumen} onChange={(e) => campo('resumen')(e.target.value)} placeholder="Ej.: Acabado limpio y moderno en tu techo, con la potencia exacta para cada espacio." />
                )}
              </Campo>

              <Campo etiqueta="Descripción" opcional ayuda="Deja una línea en blanco para separar párrafos.">
                {(props) => (
                  <textarea {...props} className="adm-textarea" rows={8} value={form.descripcion} onChange={(e) => campo('descripcion')(e.target.value)} placeholder="Cuenta para qué sirve, qué lo hace mejor y dónde se usa..." />
                )}
              </Campo>
            </div>
          </section>

          <section className="adm-tarjeta">
            <div className="adm-tarjeta__cabecera">
              <div>
                <h2 className="adm-tarjeta__titulo">Imágenes</h2>
                <p className="adm-tarjeta__descripcion">
                  La primera es la portada. Recomendado: cuadradas de 1000 x 1000 px, fondo blanco o transparente.
                </p>
              </div>
              <span className="adm-insignia adm-tabular">{form.imagenes.length}/12</span>
            </div>
            <div className="adm-tarjeta__cuerpo">
              <SubidorImagenes imagenes={form.imagenes} alCambiar={campo('imagenes')} />
            </div>
          </section>

          <section className="adm-tarjeta">
            <div className="adm-tarjeta__cabecera">
              <div>
                <h2 className="adm-tarjeta__titulo">Presentaciones</h2>
                <p className="adm-tarjeta__descripcion">
                  Potencias, medidas o colores disponibles. El cliente elige una antes de cotizar.
                </p>
              </div>
              {form.variantes.length > 0 && <span className="adm-insignia adm-tabular"><Layers /> {form.variantes.length}</span>}
            </div>
            <div className="adm-tarjeta__cuerpo">
              <Campo ayuda="Escribe y presiona Enter. También puedes pegar una lista (una por línea).">
                {(props) => <EditorEtiquetas id={props.id} valores={form.variantes} alCambiar={campo('variantes')} placeholder="Ej.: 18W · 6500K luz día" />}
              </Campo>
            </div>
          </section>

          <section className="adm-tarjeta">
            <div className="adm-tarjeta__cabecera">
              <div>
                <h2 className="adm-tarjeta__titulo">Características</h2>
                <p className="adm-tarjeta__descripcion">Beneficios clave, uno por línea. Se muestran con una marca de verificación.</p>
              </div>
            </div>
            <div className="adm-tarjeta__cuerpo">
              <EditorLista valores={form.caracteristicas} alCambiar={campo('caracteristicas')} placeholder="Ej.: Encendido instantáneo, sin parpadeo" textoAgregar="Agregar característica" />
            </div>
          </section>

          <section className="adm-tarjeta">
            <div className="adm-tarjeta__cabecera">
              <div>
                <h2 className="adm-tarjeta__titulo">Especificaciones técnicas</h2>
                <p className="adm-tarjeta__descripcion">Datos concretos en formato de tabla.</p>
              </div>
            </div>
            <div className="adm-tarjeta__cuerpo">
              <EditorEspecificaciones filas={form.especificaciones} alCambiar={campo('especificaciones')} />
            </div>
          </section>

          <section className="adm-tarjeta">
            <div className="adm-tarjeta__cabecera">
              <div>
                <h2 className="adm-tarjeta__titulo">Ideal para</h2>
                <p className="adm-tarjeta__descripcion">Lugares o usos recomendados. Ej.: Oficinas, Bodegas, Hogares.</p>
              </div>
            </div>
            <div className="adm-tarjeta__cuerpo">
              <EditorEtiquetas valores={form.aplicaciones} alCambiar={campo('aplicaciones')} maximo={30} placeholder="Ej.: Locales comerciales" />
            </div>
          </section>
        </div>

        {/* ============================= Columna lateral ============================= */}
        <aside className="adm-editor__lateral">
          <section className="adm-tarjeta">
            <div className="adm-tarjeta__cabecera"><h2 className="adm-tarjeta__titulo">Visibilidad</h2></div>
            <div className="adm-tarjeta__cuerpo adm-editor__interruptores">
              <Interruptor titulo="Publicado" descripcion={form.publicado ? 'Visible en la tienda' : 'Borrador: oculto en la tienda'} checked={form.publicado} onChange={campo('publicado')} />
              <Interruptor titulo="Disponible" descripcion={form.disponible ? 'Disponible para entrega' : 'Se muestra como “bajo pedido”'} checked={form.disponible} onChange={campo('disponible')} />
              <Interruptor titulo="Destacado" descripcion="Aparece en “Más cotizados” del inicio" checked={form.destacado} onChange={campo('destacado')} />
              <Interruptor titulo="Nuevo" descripcion="Muestra la etiqueta “Nuevo”" checked={form.nuevo} onChange={campo('nuevo')} />
            </div>
          </section>

          <section className="adm-tarjeta">
            <div className="adm-tarjeta__cabecera"><h2 className="adm-tarjeta__titulo">Organización</h2></div>
            <div className="adm-tarjeta__cuerpo adm-editor__campos">
              <Campo etiqueta="Categoría" error={errores.categoriaId} extra={<Link to="/admin/categorias" className="adm-enlace-sutil">Gestionar</Link>}>
                {(props) => (
                  <select {...props} className="adm-select" value={form.categoriaId} onChange={(e) => campo('categoriaId')(e.target.value)}>
                    <option value="">Sin categoría</option>
                    {categorias.map((c) => <option key={c.id} value={c.id}>{c.nombre}</option>)}
                  </select>
                )}
              </Campo>
              <Campo etiqueta="Marca" opcional>
                {(props) => <input {...props} className="adm-input" maxLength={80} value={form.marca} onChange={(e) => campo('marca')(e.target.value)} placeholder="Ej.: Stanley" />}
              </Campo>
              <Campo etiqueta="Referencia / SKU" opcional>
                {(props) => <input {...props} className="adm-input" maxLength={80} value={form.referencia} onChange={(e) => campo('referencia')(e.target.value)} placeholder="Ej.: 84-002" />}
              </Campo>
            </div>
          </section>

          <section className="adm-tarjeta">
            <div className="adm-tarjeta__cabecera">
              <h2 className="adm-tarjeta__titulo">Precio</h2>
              <span className="adm-insignia"><Lock /> Privado</span>
            </div>
            <div className="adm-tarjeta__cuerpo adm-editor__campos">
              <Campo error={errores.precio} ayuda="Solo para uso interno. Todavía no se muestra en la tienda.">
                {(props) => (
                  <div className="adm-input-grupo">
                    <span className="adm-input-grupo__prefijo">$</span>
                    <input
                      {...props}
                      className="adm-input adm-tabular"
                      inputMode="decimal"
                      value={form.precio}
                      onChange={(e) => campo('precio')(e.target.value.replace(/[^\d.]/g, ''))}
                      placeholder="0"
                    />
                  </div>
                )}
              </Campo>
            </div>
          </section>

          <section className="adm-tarjeta">
            <div className="adm-tarjeta__cabecera"><h2 className="adm-tarjeta__titulo">Enlace</h2></div>
            <div className="adm-tarjeta__cuerpo adm-editor__campos">
              <Campo ayuda={esNuevo ? 'Se genera con el nombre. Cámbialo solo si lo necesitas.' : 'Si lo cambias, los enlaces ya compartidos dejarán de funcionar.'}>
                {(props) => (
                  <div className="adm-slug">
                    <span>/productos/</span>
                    <input
                      {...props}
                      className="adm-input"
                      value={form.slug}
                      onChange={(e) => {
                        setSlugEditado(true)
                        campo('slug')(crearSlug(e.target.value, { conservarGuionFinal: true }))
                      }}
                      placeholder="nombre-del-producto"
                      aria-label="Enlace del producto"
                    />
                  </div>
                )}
              </Campo>
            </div>
          </section>

          <section className="adm-tarjeta adm-editor__vista">
            <div className="adm-tarjeta__cabecera"><h2 className="adm-tarjeta__titulo">Vista previa</h2></div>
            <div className="adm-tarjeta__cuerpo">
              <div className="adm-vista-tarjeta">
                <div className="adm-vista-tarjeta__media">
                  {form.imagenes[0] ? <img src={imagenAncho(form.imagenes[0].url, 400)} alt="" /> : <ImageOff aria-hidden="true" />}
                  <div className="adm-vista-tarjeta__insignias">
                    {form.nuevo && <span className="adm-vista-tarjeta__nuevo">Nuevo</span>}
                    {form.destacado && <span className="adm-vista-tarjeta__destacado">Más cotizado</span>}
                  </div>
                </div>
                <p className="adm-vista-tarjeta__categoria">{categoriaElegida?.nombre ?? 'Producto'}</p>
                <p className="adm-vista-tarjeta__nombre">{form.nombre || 'Nombre del producto'}</p>
                <p className="adm-vista-tarjeta__meta">
                  {form.variantes.length > 1 ? `${form.variantes.length} presentaciones` : form.marca || 'Cotiza sin compromiso'}
                </p>
              </div>
            </div>
          </section>
        </aside>
      </div>

      {/* Barra de guardado: aparece con cambios pendientes */}
      <div className={`adm-guardado${hayCambios || esNuevo ? ' adm-guardado--visible' : ''}`} role="region" aria-label="Guardar cambios">
        <div className="adm-guardado__caja">
          <span className="adm-guardado__estado">
            <span className="adm-guardado__punto" aria-hidden="true" />
            {esNuevo ? 'Producto sin guardar' : 'Cambios sin guardar'}
            <kbd>Ctrl S</kbd>
          </span>
          <div className="adm-guardado__acciones">
            <button
              type="button"
              className="adm-btn adm-btn--fantasma"
              disabled={guardando}
              onClick={() => (esNuevo ? navegar('/admin/productos') : (setForm(original), setErrores({})))}
            >
              {esNuevo ? 'Cancelar' : 'Descartar'}
            </button>
            <button type="submit" className="adm-btn adm-btn--primario" disabled={guardando}>
              {guardando && <span className="adm-spinner" aria-hidden="true" />}
              {guardando ? 'Guardando...' : esNuevo ? 'Crear producto' : 'Guardar cambios'}
            </button>
          </div>
        </div>
      </div>

      <Confirmar
        abierto={confirmarEliminar}
        titulo="¿Eliminar este producto?"
        procesando={eliminando}
        alConfirmar={eliminar}
        alCerrar={() => setConfirmarEliminar(false)}
      >
        Se eliminará <strong>{original.nombre}</strong> y sus imágenes. Esta acción no se puede deshacer.
      </Confirmar>
    </form>
  )
}

function EditorEsqueleto({ volver }) {
  return (
    <>
      <CabeceraPagina volver={volver} titulo={<span className="adm-esqueleto" style={{ width: 280, height: 30 }} />} />
      <div className="adm-editor__rejilla">
        <div className="adm-editor__principal">
          {[260, 200, 140].map((alto) => <div key={alto} className="adm-tarjeta adm-esqueleto" style={{ height: alto }} />)}
        </div>
        <div className="adm-editor__lateral">
          {[200, 220].map((alto) => <div key={alto} className="adm-tarjeta adm-esqueleto" style={{ height: alto }} />)}
        </div>
      </div>
    </>
  )
}

export default EditorProducto
