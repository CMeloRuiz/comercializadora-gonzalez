import { useAlAparecer } from '../../hooks'
import './Reveal.css'

/**
 * Hace aparecer su contenido con un fundido y un leve desplazamiento al entrar
 * en pantalla.
 *
 * Props:
 *  - retraso   ms, para escalonar tarjetas de una grilla
 *  - desde     'abajo' | 'izquierda' | 'derecha' | 'escala'
 *  - como      etiqueta a renderizar (por defecto div)
 */
function Reveal({ children, retraso = 0, desde = 'abajo', como: Etiqueta = 'div', className = '', style, ...resto }) {
  const [ref, visible] = useAlAparecer()

  return (
    <Etiqueta
      ref={ref}
      className={`reveal reveal--${desde}${visible ? ' reveal--visible' : ''} ${className}`.trim()}
      style={retraso ? { ...style, transitionDelay: `${retraso}ms` } : style}
      {...resto}
    >
      {children}
    </Etiqueta>
  )
}

export default Reveal
