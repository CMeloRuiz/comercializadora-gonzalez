import { useState } from 'react'
import { ArrowDown, ArrowUp, GripVertical, Plus, Trash2, X } from 'lucide-react'

/**
 * Editores de listas del formulario de producto.
 */

/* ---------------------------------------------------------------------------
 * Etiquetas: variantes y usos. Enter o coma agregan; pegar varias lineas
 * agrega una etiqueta por linea.
 * ------------------------------------------------------------------------- */
export function EditorEtiquetas({ valores, alCambiar, placeholder, maximo = 60, id }) {
  const [texto, setTexto] = useState('')

  const agregar = (entrada) => {
    const nuevas = entrada
      .split(/\n|,(?![^(]*\))/)
      .map((t) => t.trim())
      .filter((t) => t && !valores.includes(t))
    if (nuevas.length) alCambiar([...valores, ...nuevas].slice(0, maximo))
    setTexto('')
  }

  const alTeclear = (evento) => {
    if ((evento.key === 'Enter' || evento.key === ',') && texto.trim()) {
      evento.preventDefault()
      agregar(texto)
    }
    if (evento.key === 'Backspace' && !texto && valores.length) {
      alCambiar(valores.slice(0, -1))
    }
  }

  return (
    <div className="adm-etiquetas" onClick={(e) => e.currentTarget.querySelector('input')?.focus()}>
      {valores.map((valor) => (
        <span key={valor} className="adm-etiqueta">
          {valor}
          <button type="button" onClick={() => alCambiar(valores.filter((v) => v !== valor))} aria-label={`Quitar ${valor}`}>
            <X />
          </button>
        </span>
      ))}
      <input
        id={id}
        className="adm-etiquetas__input"
        value={texto}
        onChange={(e) => setTexto(e.target.value)}
        onKeyDown={alTeclear}
        onBlur={() => texto.trim() && agregar(texto)}
        onPaste={(e) => {
          const pegado = e.clipboardData.getData('text')
          if (pegado.includes('\n')) {
            e.preventDefault()
            agregar(pegado)
          }
        }}
        placeholder={valores.length ? 'Agregar otra...' : placeholder}
        disabled={valores.length >= maximo}
      />
    </div>
  )
}

/* ---------------------------------------------------------------------------
 * Lista ordenable de textos: caracteristicas.
 * ------------------------------------------------------------------------- */
export function EditorLista({ valores, alCambiar, placeholder, textoAgregar = 'Agregar', maximo = 30 }) {
  const cambiar = (indice, valor) => alCambiar(valores.map((v, i) => (i === indice ? valor : v)))

  const mover = (desde, hasta) => {
    const copia = [...valores]
    const [item] = copia.splice(desde, 1)
    copia.splice(hasta, 0, item)
    alCambiar(copia)
  }

  return (
    <div className="adm-lista">
      {valores.map((valor, i) => (
        <div key={i} className="adm-lista__fila">
          <GripVertical className="adm-lista__agarre" aria-hidden="true" />
          <input
            className="adm-input"
            value={valor}
            onChange={(e) => cambiar(i, e.target.value)}
            placeholder={placeholder}
            aria-label={`Elemento ${i + 1}`}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault()
                if (valores.length < maximo) {
                  alCambiar([...valores.slice(0, i + 1), '', ...valores.slice(i + 1)])
                  requestAnimationFrame(() => e.target.closest('.adm-lista').querySelectorAll('input')[i + 1]?.focus())
                }
              }
            }}
          />
          <div className="adm-lista__acciones">
            <button type="button" className="adm-btn adm-btn--fantasma adm-btn--sm adm-btn--icono" disabled={i === 0} onClick={() => mover(i, i - 1)} aria-label="Subir">
              <ArrowUp />
            </button>
            <button type="button" className="adm-btn adm-btn--fantasma adm-btn--sm adm-btn--icono" disabled={i === valores.length - 1} onClick={() => mover(i, i + 1)} aria-label="Bajar">
              <ArrowDown />
            </button>
            <button type="button" className="adm-btn adm-btn--peligro-suave adm-btn--sm adm-btn--icono" onClick={() => alCambiar(valores.filter((_, j) => j !== i))} aria-label="Quitar">
              <Trash2 />
            </button>
          </div>
        </div>
      ))}
      {valores.length < maximo && (
        <button type="button" className="adm-lista__agregar" onClick={() => alCambiar([...valores, ''])}>
          <Plus /> {textoAgregar}
        </button>
      )}
    </div>
  )
}

/* ---------------------------------------------------------------------------
 * Tabla de especificaciones: pares etiqueta / valor.
 * ------------------------------------------------------------------------- */
const SUGERENCIAS = ['Marca', 'Potencia', 'Voltaje', 'Temperatura de color', 'Medidas', 'Material', 'Garantía', 'Uso']

export function EditorEspecificaciones({ filas, alCambiar }) {
  const cambiar = (indice, campo, valor) => alCambiar(filas.map((f, i) => (i === indice ? { ...f, [campo]: valor } : f)))
  const usadas = new Set(filas.map((f) => f.etiqueta))
  const sugeridas = SUGERENCIAS.filter((s) => !usadas.has(s)).slice(0, 4)

  return (
    <div className="adm-especificaciones">
      {filas.length > 0 && (
        <div className="adm-especificaciones__cabecera" aria-hidden="true">
          <span>Característica</span>
          <span>Valor</span>
        </div>
      )}
      {filas.map((fila, i) => (
        <div key={i} className="adm-especificaciones__fila">
          <input className="adm-input" value={fila.etiqueta} onChange={(e) => cambiar(i, 'etiqueta', e.target.value)} placeholder="Ej.: Potencia" aria-label={`Característica ${i + 1}`} />
          <input className="adm-input" value={fila.valor} onChange={(e) => cambiar(i, 'valor', e.target.value)} placeholder="Ej.: 18W" aria-label={`Valor ${i + 1}`} />
          <button type="button" className="adm-btn adm-btn--peligro-suave adm-btn--sm adm-btn--icono" onClick={() => alCambiar(filas.filter((_, j) => j !== i))} aria-label="Quitar fila">
            <Trash2 />
          </button>
        </div>
      ))}
      <div className="adm-especificaciones__pie">
        <button type="button" className="adm-lista__agregar" onClick={() => alCambiar([...filas, { etiqueta: '', valor: '' }])}>
          <Plus /> Agregar fila
        </button>
        {sugeridas.map((s) => (
          <button key={s} type="button" className="adm-sugerencia" onClick={() => alCambiar([...filas, { etiqueta: s, valor: '' }])}>
            + {s}
          </button>
        ))}
      </div>
    </div>
  )
}
