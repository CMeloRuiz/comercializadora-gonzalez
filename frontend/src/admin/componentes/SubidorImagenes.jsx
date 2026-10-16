import { useRef, useState } from 'react'
import { ArrowLeft, ArrowRight, ImagePlus, Star, Trash2, UploadCloud } from 'lucide-react'
import { api } from '../api'
import { imagenAncho } from '../../lib/imagenes'
import { useAvisos } from './Avisos'

const TIPOS = ['image/jpeg', 'image/png', 'image/webp', 'image/avif']
const MAX_MB = 8

/**
 * Gestor de imagenes de un producto.
 *
 * Arrastrar y soltar o elegir varios archivos a la vez. Cada archivo se sube
 * en cuanto se suelta (el backend lo optimiza a WebP) y aparece en la grilla.
 * La primera imagen es la portada; se puede reordenar o quitar.
 *
 * Los cambios se guardan junto con el producto, no al subir.
 */
function SubidorImagenes({ imagenes, alCambiar, maximo = 12, carpeta = 'productos', unica = false }) {
  const avisar = useAvisos()
  const entrada = useRef(null)
  const [arrastrando, setArrastrando] = useState(false)
  const [subiendo, setSubiendo] = useState([])

  const espacio = maximo - imagenes.length - subiendo.length

  const procesar = async (archivos) => {
    const lista = [...archivos]
    const validos = []

    for (const archivo of lista) {
      if (!TIPOS.includes(archivo.type)) {
        avisar.error('Formato no admitido', `${archivo.name}: usa JPG, PNG, WEBP o AVIF`)
      } else if (archivo.size > MAX_MB * 1024 * 1024) {
        avisar.error('Imagen demasiado pesada', `${archivo.name} supera ${MAX_MB} MB`)
      } else {
        validos.push(archivo)
      }
    }

    const permitidos = unica ? validos.slice(0, 1) : validos.slice(0, Math.max(0, espacio))
    if (!unica && validos.length > permitidos.length) {
      avisar.info('Límite de imágenes', `Puedes tener hasta ${maximo} imágenes por producto`)
    }
    if (!permitidos.length) return

    const pendientes = permitidos.map((archivo) => ({ clave: `${archivo.name}-${Math.random()}`, vista: URL.createObjectURL(archivo), archivo }))
    setSubiendo((s) => [...s, ...pendientes])

    for (const pendiente of pendientes) {
      try {
        const subida = await api.subirImagen(pendiente.archivo, carpeta)
        /* Con funcion: si mientras sube se quita o reordena otra imagen, no se pisa ese cambio */
        alCambiar((previas) => (unica ? [subida] : [...previas, subida]))
      } catch (error) {
        avisar.error('No se pudo subir la imagen', error.message)
      } finally {
        URL.revokeObjectURL(pendiente.vista)
        setSubiendo((s) => s.filter((p) => p.clave !== pendiente.clave))
      }
    }
  }

  const mover = (desde, hasta) => {
    const copia = [...imagenes]
    const [imagen] = copia.splice(desde, 1)
    copia.splice(hasta, 0, imagen)
    alCambiar(copia)
  }

  const alSoltar = (evento) => {
    evento.preventDefault()
    setArrastrando(false)
    if (evento.dataTransfer.files?.length) procesar(evento.dataTransfer.files)
  }

  const zona = (
    <button
      type="button"
      className={`adm-subidor__zona${arrastrando ? ' adm-subidor__zona--activa' : ''}${imagenes.length || subiendo.length ? ' adm-subidor__zona--compacta' : ''}`}
      onClick={() => entrada.current?.click()}
      onDragOver={(e) => { e.preventDefault(); setArrastrando(true) }}
      onDragLeave={() => setArrastrando(false)}
      onDrop={alSoltar}
    >
      <span className="adm-subidor__icono">{imagenes.length ? <ImagePlus aria-hidden="true" /> : <UploadCloud aria-hidden="true" />}</span>
      <span className="adm-subidor__texto">
        <strong>{arrastrando ? 'Suelta para subir' : imagenes.length ? 'Agregar' : 'Arrastra imágenes aquí o haz clic'}</strong>
        {!imagenes.length && <span>JPG, PNG o WEBP · hasta {MAX_MB} MB · se optimizan automáticamente</span>}
      </span>
    </button>
  )

  return (
    <div className="adm-subidor">
      <input
        ref={entrada}
        type="file"
        accept={TIPOS.join(',')}
        multiple={!unica}
        hidden
        onChange={(e) => {
          procesar(e.target.files)
          e.target.value = ''
        }}
      />

      {imagenes.length === 0 && subiendo.length === 0 ? (
        zona
      ) : (
        <div className="adm-subidor__grilla">
          {imagenes.map((imagen, i) => (
            <figure key={imagen.url} className={`adm-imagen${i === 0 && !unica ? ' adm-imagen--portada' : ''}`}>
              <img src={imagenAncho(imagen.url, 400)} alt={`Imagen ${i + 1}`} />
              {i === 0 && !unica && <span className="adm-imagen__portada"><Star aria-hidden="true" /> Portada</span>}
              <div className="adm-imagen__acciones">
                {!unica && i > 0 && (
                  <>
                    <button type="button" onClick={() => mover(i, 0)} title="Usar como portada" aria-label="Usar como portada"><Star /></button>
                    <button type="button" onClick={() => mover(i, i - 1)} title="Mover a la izquierda" aria-label="Mover a la izquierda"><ArrowLeft /></button>
                  </>
                )}
                {!unica && i < imagenes.length - 1 && (
                  <button type="button" onClick={() => mover(i, i + 1)} title="Mover a la derecha" aria-label="Mover a la derecha"><ArrowRight /></button>
                )}
                <button type="button" className="adm-imagen__quitar" onClick={() => alCambiar(imagenes.filter((_, j) => j !== i))} title="Quitar imagen" aria-label="Quitar imagen">
                  <Trash2 />
                </button>
              </div>
            </figure>
          ))}

          {subiendo.map((pendiente) => (
            <figure key={pendiente.clave} className="adm-imagen adm-imagen--subiendo">
              <img src={pendiente.vista} alt="" />
              <span className="adm-imagen__progreso">
                <span className="adm-spinner" aria-hidden="true" /> Optimizando...
              </span>
            </figure>
          ))}

          {(unica ? imagenes.length === 0 && subiendo.length === 0 : espacio > 0) && zona}
          {unica && imagenes.length > 0 && (
            <button type="button" className="adm-btn adm-btn--secundario adm-btn--sm adm-subidor__reemplazar" onClick={() => entrada.current?.click()}>
              <ImagePlus /> Reemplazar
            </button>
          )}
        </div>
      )}
    </div>
  )
}

export default SubidorImagenes
