import './EstadoMensaje.css'

/**
 * Mensaje de estado para vacios y errores: icono, titulo, texto y acciones.
 */
function EstadoMensaje({ icono: Icono, titulo, children, acciones, tono = 'neutro' }) {
  return (
    <div className={`estado-mensaje estado-mensaje--${tono}`} role={tono === 'error' ? 'alert' : undefined}>
      {Icono && (
        <span className="estado-mensaje__icono">
          <Icono aria-hidden="true" />
        </span>
      )}
      <h3 className="estado-mensaje__titulo">{titulo}</h3>
      {children && <p className="estado-mensaje__texto">{children}</p>}
      {acciones && <div className="estado-mensaje__acciones">{acciones}</div>}
    </div>
  )
}

export default EstadoMensaje
