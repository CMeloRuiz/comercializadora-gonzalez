import { useEffect, useMemo, useState } from 'react'
import { AlertTriangle, AtSign, Clock, ExternalLink, MapPin, MessageCircle, Phone, RefreshCw, Share2 } from 'lucide-react'
import { api } from '../api'
import { useAvisos } from '../componentes/Avisos'
import { Campo, Vacio } from '../componentes/ui'
import { CabeceraPagina } from '../AdminLayout'
import { enlaceWhatsApp } from '../../lib/whatsapp'
import '../estilos/editor.css'
import '../estilos/ajustes.css'

const CAMPOS = ['nombreComercial', 'whatsapp', 'telefono', 'correo', 'direccion', 'ciudad', 'horario', 'facebook', 'instagram', 'mensajeWhatsapp']

/** Numeros de prueba que venian del sitio anterior */
const NUMERO_DE_PRUEBA = '571234567890'

function Ajustes() {
  const avisar = useAvisos()
  const [form, setForm] = useState(null)
  const [original, setOriginal] = useState(null)
  const [error, setError] = useState(null)
  const [errores, setErrores] = useState({})
  const [guardando, setGuardando] = useState(false)
  const [intento, setIntento] = useState(0)

  useEffect(() => {
    api.ajustes()
      .then((datos) => {
        const limpios = Object.fromEntries(CAMPOS.map((c) => [c, datos[c] ?? '']))
        setForm(limpios)
        setOriginal(limpios)
      })
      .catch(setError)
  }, [intento])

  const hayCambios = useMemo(() => form && JSON.stringify(form) !== JSON.stringify(original), [form, original])

  const cambiar = (clave) => (evento) => {
    setForm((f) => ({ ...f, [clave]: evento.target.value }))
    setErrores((e) => ({ ...e, [clave]: undefined }))
  }

  const guardar = async (evento) => {
    evento?.preventDefault()
    const nuevos = {}
    const digitos = form.whatsapp.replace(/\D/g, '')
    if (digitos.length < 10) nuevos.whatsapp = 'Incluye el indicativo del país. Ej.: 57 300 123 4567'
    if (form.correo && !/^\S+@\S+\.\S+$/.test(form.correo)) nuevos.correo = 'Escribe un correo válido'
    for (const red of ['facebook', 'instagram']) {
      if (form[red] && !/^https?:\/\//.test(form[red])) nuevos[red] = 'Pega el enlace completo, empezando por https://'
    }
    setErrores(nuevos)
    if (Object.keys(nuevos).length) {
      avisar.error('Revisa los campos marcados')
      return
    }

    setGuardando(true)
    try {
      const guardados = await api.guardarAjustes(form)
      const limpios = Object.fromEntries(CAMPOS.map((c) => [c, guardados[c] ?? '']))
      setForm(limpios)
      setOriginal(limpios)
      avisar.exito('Ajustes guardados', 'El sitio ya usa los nuevos datos de contacto')
    } catch (e) {
      avisar.error('No se pudo guardar', e.message)
    } finally {
      setGuardando(false)
    }
  }

  if (error) {
    return (
      <>
        <CabeceraPagina titulo="Ajustes" />
        <div className="adm-tarjeta">
          <Vacio icono={AlertTriangle} titulo="No se pudieron cargar los ajustes" acciones={<button type="button" className="adm-btn adm-btn--secundario" onClick={() => { setError(null); setIntento((n) => n + 1) }}><RefreshCw /> Reintentar</button>}>
            {error.message}
          </Vacio>
        </div>
      </>
    )
  }

  if (!form) {
    return (
      <>
        <CabeceraPagina titulo="Ajustes" />
        <div className="adm-ajustes">
          {[240, 200, 160].map((alto) => <div key={alto} className="adm-tarjeta adm-esqueleto" style={{ height: alto }} />)}
        </div>
      </>
    )
  }

  const numeroDePrueba = form.whatsapp.replace(/\D/g, '') === NUMERO_DE_PRUEBA

  return (
    <form onSubmit={guardar} className="adm-editor" noValidate>
      <CabeceraPagina titulo="Ajustes" descripcion="Datos de contacto que se muestran en todo el sitio y en los botones de WhatsApp." />

      {numeroDePrueba && (
        <div className="adm-alerta adm-ajustes__alerta">
          <AlertTriangle aria-hidden="true" />
          <span>
            <strong>El número de WhatsApp es de prueba.</strong> Reemplázalo por el número real del negocio para empezar a
            recibir cotizaciones.
          </span>
        </div>
      )}

      <div className="adm-ajustes">
        <Seccion icono={MessageCircle} titulo="WhatsApp" descripcion="A este número llegan todas las cotizaciones del sitio.">
          <div className="adm-ajustes__fila">
            <Campo etiqueta="Número de WhatsApp" error={errores.whatsapp} ayuda="Con indicativo de país, sin + ni espacios obligatorios. Ej.: 57 300 123 4567">
              {(props) => <input {...props} className="adm-input adm-tabular" inputMode="tel" value={form.whatsapp} onChange={cambiar('whatsapp')} placeholder="57 300 123 4567" />}
            </Campo>
            <div className="adm-ajustes__probar">
              <a href={enlaceWhatsApp(form.whatsapp, form.mensajeWhatsapp)} target="_blank" rel="noreferrer" className="adm-btn adm-btn--secundario">
                <ExternalLink /> Probar enlace
              </a>
            </div>
          </div>
          <Campo etiqueta="Mensaje inicial" ayuda="Se usa en los botones generales (no en los de producto, que llevan el nombre del producto).">
            {(props) => <textarea {...props} className="adm-textarea" rows={2} maxLength={500} value={form.mensajeWhatsapp} onChange={cambiar('mensajeWhatsapp')} />}
          </Campo>
          <div className="adm-burbuja" aria-hidden="true">
            <span className="adm-burbuja__texto">{form.mensajeWhatsapp || 'Hola...'}</span>
            <span className="adm-burbuja__hora">Vista previa</span>
          </div>
        </Seccion>

        <Seccion icono={Phone} titulo="Contacto" descripcion="Aparece en la barra superior, el pie de página y la página de contacto.">
          <Campo etiqueta="Nombre comercial">
            {(props) => <input {...props} className="adm-input" value={form.nombreComercial} onChange={cambiar('nombreComercial')} />}
          </Campo>
          <div className="adm-ajustes__dos">
            <Campo etiqueta="Teléfono">
              {(props) => <input {...props} className="adm-input" inputMode="tel" value={form.telefono} onChange={cambiar('telefono')} placeholder="+57 300 123 4567" />}
            </Campo>
            <Campo etiqueta="Correo" error={errores.correo}>
              {(props) => (
                <div className="adm-input-grupo">
                  <AtSign aria-hidden="true" />
                  <input {...props} className="adm-input" type="email" value={form.correo} onChange={cambiar('correo')} placeholder="ventas@empresa.com" />
                </div>
              )}
            </Campo>
          </div>
        </Seccion>

        <Seccion icono={MapPin} titulo="Ubicación y horario" descripcion="Se usan para el mapa y el botón “Cómo llegar”.">
          <div className="adm-ajustes__dos">
            <Campo etiqueta="Dirección">
              {(props) => <input {...props} className="adm-input" value={form.direccion} onChange={cambiar('direccion')} placeholder="Calle 00 No 00-00" />}
            </Campo>
            <Campo etiqueta="Ciudad" ayuda={form.ciudad ? undefined : 'Recomendado: sin ciudad, el mapa puede ubicar mal la tienda.'}>
              {(props) => <input {...props} className="adm-input" value={form.ciudad} onChange={cambiar('ciudad')} placeholder="Ej.: Bogotá" />}
            </Campo>
          </div>
          <Campo etiqueta="Horario de atención" ayuda="Una línea por día o rango de días.">
            {(props) => (
              <div className="adm-input-grupo adm-input-grupo--arriba">
                <Clock aria-hidden="true" />
                <textarea {...props} className="adm-textarea adm-ajustes__horario" rows={3} value={form.horario} onChange={cambiar('horario')} />
              </div>
            )}
          </Campo>
        </Seccion>

        <Seccion icono={Share2} titulo="Redes sociales" descripcion="Opcional. Si las dejas vacías, los íconos no se muestran.">
          <div className="adm-ajustes__dos">
            <Campo etiqueta="Facebook" opcional error={errores.facebook}>
              {(props) => <input {...props} className="adm-input" type="url" value={form.facebook} onChange={cambiar('facebook')} placeholder="https://facebook.com/..." />}
            </Campo>
            <Campo etiqueta="Instagram" opcional error={errores.instagram}>
              {(props) => <input {...props} className="adm-input" type="url" value={form.instagram} onChange={cambiar('instagram')} placeholder="https://instagram.com/..." />}
            </Campo>
          </div>
        </Seccion>
      </div>

      <div className={`adm-guardado${hayCambios ? ' adm-guardado--visible' : ''}`} role="region" aria-label="Guardar cambios">
        <div className="adm-guardado__caja">
          <span className="adm-guardado__estado"><span className="adm-guardado__punto" aria-hidden="true" /> Cambios sin guardar</span>
          <div className="adm-guardado__acciones">
            <button type="button" className="adm-btn adm-btn--fantasma" disabled={guardando} onClick={() => { setForm(original); setErrores({}) }}>Descartar</button>
            <button type="submit" className="adm-btn adm-btn--primario" disabled={guardando}>
              {guardando && <span className="adm-spinner" aria-hidden="true" />}
              {guardando ? 'Guardando...' : 'Guardar ajustes'}
            </button>
          </div>
        </div>
      </div>
    </form>
  )
}

function Seccion({ icono: Icono, titulo, descripcion, children }) {
  return (
    <section className="adm-tarjeta adm-ajustes__seccion">
      <div className="adm-ajustes__intro">
        <span className="adm-ajustes__icono"><Icono aria-hidden="true" /></span>
        <h2>{titulo}</h2>
        <p>{descripcion}</p>
      </div>
      <div className="adm-ajustes__campos">{children}</div>
    </section>
  )
}

export default Ajustes
