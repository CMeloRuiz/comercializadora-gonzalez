import { createContext, useCallback, useContext, useMemo, useRef, useState } from 'react'
import { AlertCircle, CheckCircle2, Info, X } from 'lucide-react'

/**
 * Avisos flotantes (toasts) para confirmar acciones: guardado, error, etc.
 *
 * Uso:  const avisar = useAvisos()
 *       avisar.exito('Producto guardado', 'Los cambios ya se ven en el sitio')
 */

const ContextoAvisos = createContext(null)

const ICONOS = { exito: CheckCircle2, error: AlertCircle, info: Info }
const DURACION = { exito: 3500, info: 4000, error: 6500 }

export function ProveedorAvisos({ children }) {
  const [avisos, setAvisos] = useState([])
  const siguienteId = useRef(0)

  const cerrar = useCallback((id) => {
    setAvisos((lista) => lista.map((a) => (a.id === id ? { ...a, saliendo: true } : a)))
    setTimeout(() => setAvisos((lista) => lista.filter((a) => a.id !== id)), 200)
  }, [])

  const mostrar = useCallback((tipo, titulo, detalle) => {
    const id = ++siguienteId.current
    setAvisos((lista) => [...lista.slice(-3), { id, tipo, titulo, detalle }])
    setTimeout(() => cerrar(id), DURACION[tipo])
  }, [cerrar])

  const api = useMemo(() => ({
    exito: (titulo, detalle) => mostrar('exito', titulo, detalle),
    error: (titulo, detalle) => mostrar('error', titulo, detalle),
    info: (titulo, detalle) => mostrar('info', titulo, detalle),
  }), [mostrar])

  return (
    <ContextoAvisos.Provider value={api}>
      {children}
      <div className="adm adm-avisos" aria-live="polite" style={{ background: 'none' }}>
        {avisos.map((aviso) => {
          const Icono = ICONOS[aviso.tipo]
          return (
            <div
              key={aviso.id}
              role={aviso.tipo === 'error' ? 'alert' : 'status'}
              className={`adm-aviso adm-aviso--${aviso.tipo}${aviso.saliendo ? ' adm-aviso--saliendo' : ''}`}
            >
              <Icono className="adm-aviso__icono" aria-hidden="true" />
              <div className="adm-aviso__texto">
                <span className="adm-aviso__titulo">{aviso.titulo}</span>
                {aviso.detalle && <span className="adm-aviso__detalle">{aviso.detalle}</span>}
              </div>
              <button type="button" className="adm-aviso__cerrar" onClick={() => cerrar(aviso.id)} aria-label="Cerrar aviso">
                <X />
              </button>
            </div>
          )
        })}
      </div>
    </ContextoAvisos.Provider>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAvisos() {
  return useContext(ContextoAvisos)
}
