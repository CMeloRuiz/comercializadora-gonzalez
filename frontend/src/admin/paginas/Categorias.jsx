import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { AlertTriangle, ArrowDown, ArrowUp, ExternalLink, FolderPlus, FolderTree, ImageOff, MoreHorizontal, Pencil, Plus, RefreshCw, Trash2 } from 'lucide-react'
import { api } from '../api'
import { useAvisos } from '../componentes/Avisos'
import { Campo, Confirmar, Contador, Menu, Modal, Vacio } from '../componentes/ui'
import SubidorImagenes from '../componentes/SubidorImagenes'
import { CabeceraPagina } from '../AdminLayout'
import { imagenAncho } from '../../lib/imagenes'
import '../estilos/editor.css'
import '../estilos/categorias.css'

function Categorias() {
  const avisar = useAvisos()
  const [categorias, setCategorias] = useState(null)
  const [error, setError] = useState(null)
  const [editando, setEditando] = useState(null) // null | {} (nueva) | categoria
  const [aEliminar, setAEliminar] = useState(null)
  const [eliminando, setEliminando] = useState(false)

  const [intento, setIntento] = useState(0)

  useEffect(() => {
    api.categorias().then(setCategorias).catch(setError)
  }, [intento])

  const recargar = () => {
    setError(null)
    setIntento((n) => n + 1)
  }

  const mover = async (indice, direccion) => {
    const copia = [...categorias]
    const [item] = copia.splice(indice, 1)
    copia.splice(indice + direccion, 0, item)
    const anterior = categorias
    setCategorias(copia)
    try {
      await api.ordenarCategorias(copia.map((c) => c.id))
      avisar.exito('Orden actualizado', 'Así se verán en la tienda')
    } catch (e) {
      setCategorias(anterior)
      avisar.error('No se pudo cambiar el orden', e.message)
    }
  }

  const eliminar = async () => {
    setEliminando(true)
    try {
      await api.eliminarCategoria(aEliminar.id)
      setCategorias((lista) => lista.filter((c) => c.id !== aEliminar.id))
      avisar.exito('Categoría eliminada', aEliminar.nombre)
      setAEliminar(null)
    } catch (e) {
      avisar.error('No se pudo eliminar', e.message)
    } finally {
      setEliminando(false)
    }
  }

  const alGuardar = (guardada, esNueva) => {
    setCategorias((lista) => (esNueva ? [...lista, guardada] : lista.map((c) => (c.id === guardada.id ? guardada : c))))
    setEditando(null)
  }

  return (
    <>
      <CabeceraPagina
        titulo="Categorías"
        descripcion="Organizan el catálogo y aparecen en el inicio y en los filtros de la tienda."
        acciones={<button type="button" className="adm-btn adm-btn--primario" onClick={() => setEditando({})}><Plus /> Nueva categoría</button>}
      />

      {error ? (
        <div className="adm-tarjeta">
          <Vacio icono={AlertTriangle} titulo="No se pudieron cargar las categorías" acciones={<button type="button" className="adm-btn adm-btn--secundario" onClick={recargar}><RefreshCw /> Reintentar</button>}>
            {error.message}
          </Vacio>
        </div>
      ) : !categorias ? (
        <div className="adm-categorias">
          {Array.from({ length: 4 }, (_, i) => <div key={i} className="adm-tarjeta adm-esqueleto" style={{ height: 96 }} />)}
        </div>
      ) : categorias.length === 0 ? (
        <div className="adm-tarjeta">
          <Vacio
            icono={FolderTree}
            titulo="Aún no hay categorías"
            acciones={<button type="button" className="adm-btn adm-btn--primario" onClick={() => setEditando({})}><FolderPlus /> Crear categoría</button>}
          >
            Crea categorías como “Iluminación” o “Herramientas” para que tus clientes encuentren todo más rápido.
          </Vacio>
        </div>
      ) : (
        <ul className="adm-categorias">
          {categorias.map((categoria, i) => {
            const imagen = imagenAncho(categoria.imagen?.url ?? categoria.imagenRespaldo, 200)
            return (
              <li key={categoria.id} className="adm-tarjeta adm-categoria">
                <div className="adm-categoria__orden">
                  <button type="button" className="adm-btn adm-btn--fantasma adm-btn--sm adm-btn--icono" disabled={i === 0} onClick={() => mover(i, -1)} aria-label={`Subir ${categoria.nombre}`}><ArrowUp /></button>
                  <span className="adm-tabular">{i + 1}</span>
                  <button type="button" className="adm-btn adm-btn--fantasma adm-btn--sm adm-btn--icono" disabled={i === categorias.length - 1} onClick={() => mover(i, 1)} aria-label={`Bajar ${categoria.nombre}`}><ArrowDown /></button>
                </div>

                <span className="adm-categoria__imagen">
                  {imagen ? <img src={imagen} alt="" /> : <ImageOff aria-hidden="true" />}
                </span>

                <div className="adm-categoria__texto">
                  <h2>{categoria.nombre}</h2>
                  <p>{categoria.descripcion || <span className="adm-texto-tenue">Sin descripción</span>}</p>
                </div>

                <Link to={`/admin/productos?categoria=${categoria.id}`} className="adm-insignia adm-categoria__conteo adm-tabular">
                  {categoria.totalProductos} {categoria.totalProductos === 1 ? 'producto' : 'productos'}
                </Link>

                <Menu
                  disparador={({ alternar, abierto }) => (
                    <button type="button" className="adm-btn adm-btn--fantasma adm-btn--sm adm-btn--icono" onClick={alternar} aria-expanded={abierto} aria-label={`Acciones de ${categoria.nombre}`}>
                      <MoreHorizontal />
                    </button>
                  )}
                >
                  <button type="button" className="adm-menu__item" role="menuitem" onClick={() => setEditando(categoria)}><Pencil /> Editar</button>
                  <a href={`/productos?categoria=${categoria.slug}`} target="_blank" rel="noreferrer" className="adm-menu__item" role="menuitem"><ExternalLink /> Ver en la tienda</a>
                  <div className="adm-menu__separador" />
                  <button type="button" className="adm-menu__item adm-menu__item--peligro" role="menuitem" onClick={() => setAEliminar(categoria)}><Trash2 /> Eliminar</button>
                </Menu>
              </li>
            )
          })}
        </ul>
      )}

      {editando && <FormularioCategoria categoria={editando} alCerrar={() => setEditando(null)} alGuardar={alGuardar} />}

      <Confirmar abierto={Boolean(aEliminar)} titulo="¿Eliminar esta categoría?" procesando={eliminando} alConfirmar={eliminar} alCerrar={() => setAEliminar(null)}>
        Se eliminará <strong>{aEliminar?.nombre}</strong>.{' '}
        {aEliminar?.totalProductos
          ? `Sus ${aEliminar.totalProductos} productos no se borran: quedarán “sin categoría” hasta que los reasignes.`
          : 'No tiene productos asignados.'}
      </Confirmar>
    </>
  )
}

function FormularioCategoria({ categoria, alCerrar, alGuardar }) {
  const avisar = useAvisos()
  const esNueva = !categoria.id
  const [nombre, setNombre] = useState(categoria.nombre ?? '')
  const [descripcion, setDescripcion] = useState(categoria.descripcion ?? '')
  const [imagenes, setImagenes] = useState(categoria.imagen ? [categoria.imagen] : [])
  const [error, setError] = useState('')
  const [guardando, setGuardando] = useState(false)

  const guardar = async (evento) => {
    evento.preventDefault()
    if (nombre.trim().length < 2) {
      setError('Escribe un nombre de al menos 2 caracteres')
      return
    }
    setGuardando(true)
    try {
      const datos = { nombre: nombre.trim(), descripcion: descripcion.trim(), imagen: imagenes[0] ?? null }
      const guardada = esNueva ? await api.crearCategoria(datos) : await api.guardarCategoria(categoria.id, datos)
      avisar.exito(esNueva ? 'Categoría creada' : 'Categoría actualizada', guardada.nombre)
      alGuardar(guardada, esNueva)
    } catch (e) {
      setError(e.campos?.nombre ?? '')
      avisar.error('No se pudo guardar', e.message)
      setGuardando(false)
    }
  }

  return (
    <Modal abierto alCerrar={guardando ? () => {} : alCerrar} ancho etiqueta={esNueva ? 'Nueva categoría' : 'Editar categoría'}>
      <form onSubmit={guardar} noValidate>
        <div className="adm-modal__cabecera">
          <span className="adm-modal__icono"><FolderTree aria-hidden="true" /></span>
          <div>
            <h2 className="adm-modal__titulo">{esNueva ? 'Nueva categoría' : 'Editar categoría'}</h2>
            <p className="adm-modal__texto">{esNueva ? 'Agrupa productos similares.' : `${categoria.totalProductos ?? 0} productos en esta categoría.`}</p>
          </div>
        </div>
        <div className="adm-modal__cuerpo adm-editor__campos">
          <Campo etiqueta="Nombre" error={error} extra={<Contador actual={nombre.length} maximo={120} />}>
            {(props) => (
              <input {...props} className="adm-input" maxLength={120} value={nombre} onChange={(e) => { setNombre(e.target.value); setError('') }} placeholder="Ej.: Iluminación LED" />
            )}
          </Campo>
          <Campo etiqueta="Descripción" opcional ayuda="Se muestra en el encabezado de la categoría en la tienda." extra={<Contador actual={descripcion.length} maximo={400} />}>
            {(props) => (
              <textarea {...props} className="adm-textarea" rows={3} maxLength={400} value={descripcion} onChange={(e) => setDescripcion(e.target.value)} placeholder="Ej.: Bombillos y paneles que reducen el consumo de energía." />
            )}
          </Campo>
          <Campo etiqueta="Imagen" opcional ayuda="Cuadrada, 800 x 800 px, idealmente con fondo transparente. Si no subes una, se usa la de un producto.">
            {() => <SubidorImagenes imagenes={imagenes} alCambiar={setImagenes} carpeta="categorias" unica maximo={1} />}
          </Campo>
        </div>
        <div className="adm-modal__acciones">
          <button type="button" className="adm-btn adm-btn--secundario" onClick={alCerrar} disabled={guardando}>Cancelar</button>
          <button type="submit" className="adm-btn adm-btn--primario" disabled={guardando}>
            {guardando && <span className="adm-spinner" aria-hidden="true" />}
            {guardando ? 'Guardando...' : esNueva ? 'Crear categoría' : 'Guardar'}
          </button>
        </div>
      </form>
    </Modal>
  )
}

export default Categorias
