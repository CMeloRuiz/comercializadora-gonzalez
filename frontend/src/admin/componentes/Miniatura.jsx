import { ImageOff } from 'lucide-react'
import { imagenAncho } from '../../lib/imagenes'

/** Foto pequena del producto para tablas y listas */
function Miniatura({ producto, tamano = 40 }) {
  const url = imagenAncho(producto.imagenes?.[0]?.url, tamano * 3)

  return (
    <span className="adm-miniatura" style={{ width: tamano, height: tamano }}>
      {url ? <img src={url} alt="" loading="lazy" /> : <ImageOff aria-hidden="true" />}
    </span>
  )
}

export default Miniatura
