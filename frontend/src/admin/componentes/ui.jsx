import { useEffect, useId, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { AlertCircle, AlertTriangle, X } from 'lucide-react'

/**
 * Piezas pequenas reutilizadas en todo el panel.
 */

/* ------------------------------- Campo ------------------------------- */

/**
 * Etiqueta + control + ayuda/error. El control recibe id y aria-describedby.
 */
export function Campo({ etiqueta, opcional, ayuda, error, extra, children, className = '' }) {
  const id = useId()
  const idAyuda = `${id}-ayuda`

  const control = typeof children === 'function'
    ? children({ id, 'aria-invalid': Boolean(error), 'aria-describedby': ayuda || error ? idAyuda : undefined })
    : children

  return (
    <div className={`adm-campo ${className}`}>
      {etiqueta && (
        <label className="adm-campo__etiqueta" htmlFor={id}>
          <span>
            {etiqueta} {opcional && <span className="adm-campo__opcional">(opcional)</span>}
          </span>
          {extra}
        </label>
      )}
      {control}
      {error ? (
        <span className="adm-campo__error" id={idAyuda}>
          <AlertCircle aria-hidden="true" /> {error}
        </span>
      ) : ayuda ? (
        <span className="adm-campo__ayuda" id={idAyuda}>{ayuda}</span>
      ) : null}
    </div>
  )
}

/** Contador de caracteres para la etiqueta de un campo */
export function Contador({ actual, maximo }) {
  return (
    <span className={`adm-contador${actual > maximo * 0.9 ? ' adm-contador--limite' : ''}`}>
      {actual}/{maximo}
    </span>
  )
}

/* ----------------------------- Interruptor ----------------------------- */

export function Interruptor({ titulo, descripcion, checked, onChange, disabled }) {
  return (
    <label className="adm-interruptor">
      <input type="checkbox" role="switch" checked={checked} disabled={disabled} onChange={(e) => onChange(e.target.checked)} />
      <span className="adm-interruptor__pista" aria-hidden="true" />
      {(titulo || descripcion) && (
        <span className="adm-interruptor__texto">
          {titulo && <span className="adm-interruptor__titulo">{titulo}</span>}
          {descripcion && <span className="adm-interruptor__descripcion">{descripcion}</span>}
        </span>
      )}
    </label>
  )
}

/* ---------------------------- Estado vacio ---------------------------- */

export function Vacio({ icono: Icono, titulo, children, acciones }) {
  return (
    <div className="adm-vacio">
      <div className="adm-vacio__ilustracion">
        <span className="adm-vacio__icono"><Icono aria-hidden="true" /></span>
      </div>
      <h3 className="adm-vacio__titulo">{titulo}</h3>
      {children && <p className="adm-vacio__texto">{children}</p>}
      {acciones && <div className="adm-vacio__acciones">{acciones}</div>}
    </div>
  )
}

/* -------------------------------- Menu -------------------------------- */

/**
 * Menu desplegable de acciones. Se cierra al hacer clic fuera o con Escape.
 */
export function Menu({ disparador, children, arriba = false }) {
  const [abierto, setAbierto] = useState(false)
  const caja = useRef(null)

  useEffect(() => {
    if (!abierto) return
    const alPulsar = (e) => { if (!caja.current?.contains(e.target)) setAbierto(false) }
    const alTeclear = (e) => { if (e.key === 'Escape') setAbierto(false) }
    document.addEventListener('pointerdown', alPulsar)
    document.addEventListener('keydown', alTeclear)
    return () => {
      document.removeEventListener('pointerdown', alPulsar)
      document.removeEventListener('keydown', alTeclear)
    }
  }, [abierto])

  return (
    <div className="adm-menu" ref={caja}>
      {disparador({ abierto, alternar: () => setAbierto((v) => !v) })}
      {abierto && (
        <div className={`adm-menu__lista${arriba ? ' adm-menu__lista--arriba' : ''}`} role="menu" onClick={() => setAbierto(false)}>
          {children}
        </div>
      )}
    </div>
  )
}

/* -------------------------------- Modal -------------------------------- */

export function Modal({ abierto, alCerrar, children, ancho = false, etiqueta }) {
  const caja = useRef(null)
  /* En un ref: si el efecto dependiera de alCerrar, cada render del padre robaria el foco */
  const cerrar = useRef(alCerrar)

  useEffect(() => {
    cerrar.current = alCerrar
  }, [alCerrar])

  useEffect(() => {
    if (!abierto) return
    const anterior = document.activeElement
    const alTeclear = (e) => { if (e.key === 'Escape') cerrar.current() }
    document.addEventListener('keydown', alTeclear)
    document.body.style.overflow = 'hidden'
    /* Lleva el foco al primer control del modal */
    requestAnimationFrame(() => caja.current?.querySelector('input, textarea, select, button:not(.adm-modal__cerrar)')?.focus())
    return () => {
      document.removeEventListener('keydown', alTeclear)
      document.body.style.overflow = ''
      anterior?.focus?.()
    }
  }, [abierto])

  if (!abierto) return null

  return createPortal(
    <div className="adm adm-modal" style={{ background: 'none' }}>
      <div className="adm-modal__fondo" onClick={alCerrar} />
      <div ref={caja} className={`adm-modal__caja${ancho ? ' adm-modal__caja--ancha' : ''}`} role="dialog" aria-modal="true" aria-label={etiqueta}>
        <button type="button" className="adm-btn adm-btn--fantasma adm-btn--sm adm-btn--icono adm-modal__cerrar" onClick={alCerrar} aria-label="Cerrar">
          <X />
        </button>
        {children}
      </div>
    </div>,
    document.body
  )
}

/**
 * Confirmacion de acciones destructivas.
 */
export function Confirmar({ abierto, titulo, children, textoConfirmar = 'Eliminar', procesando, alConfirmar, alCerrar }) {
  return (
    <Modal abierto={abierto} alCerrar={procesando ? () => {} : alCerrar} etiqueta={titulo}>
      <div className="adm-modal__cabecera">
        <span className="adm-modal__icono adm-modal__icono--peligro"><AlertTriangle aria-hidden="true" /></span>
        <div>
          <h2 className="adm-modal__titulo">{titulo}</h2>
          <div className="adm-modal__texto">{children}</div>
        </div>
      </div>
      <div className="adm-modal__acciones">
        <button type="button" className="adm-btn adm-btn--secundario" onClick={alCerrar} disabled={procesando}>Cancelar</button>
        <button type="button" className="adm-btn adm-btn--peligro" onClick={alConfirmar} disabled={procesando}>
          {procesando && <span className="adm-spinner" aria-hidden="true" />}
          {procesando ? 'Eliminando...' : textoConfirmar}
        </button>
      </div>
    </Modal>
  )
}
