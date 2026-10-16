import { useState } from 'react'
import { Clock, Mail, MapPin, Phone, Send } from 'lucide-react'
import { useNegocio, useTitulo } from '../hooks'
import { enlaceWhatsApp } from '../lib/whatsapp'
import EncabezadoPagina from '../components/ui/EncabezadoPagina'
import MapaUbicacion from '../components/ui/MapaUbicacion'
import Reveal from '../components/ui/Reveal'
import { IconoFacebook, IconoInstagram, IconoWhatsApp } from '../components/ui/IconosMarca'
import './Contacto.css'

const ASUNTOS = ['Cotización de productos', 'Asesoría técnica', 'Estado de un pedido', 'Otro']

const VACIO = { nombre: '', telefono: '', asunto: ASUNTOS[0], mensaje: '' }

/**
 * Contacto.
 *
 * El formulario no envia correos: arma el mensaje y abre WhatsApp, que es el
 * canal donde el negocio atiende y cierra las ventas. Asi ninguna consulta
 * se pierde en una bandeja de entrada.
 */
function Contacto() {
  const negocio = useNegocio()
  const [formulario, setFormulario] = useState(VACIO)
  const [errores, setErrores] = useState({})
  useTitulo('Contacto')

  const cambiar = (evento) => {
    const { name, value } = evento.target
    setFormulario((f) => ({ ...f, [name]: value }))
    if (errores[name]) setErrores((e) => ({ ...e, [name]: undefined }))
  }

  const enviar = (evento) => {
    evento.preventDefault()
    const nuevos = {}
    if (formulario.nombre.trim().length < 3) nuevos.nombre = 'Escribe tu nombre'
    if (formulario.mensaje.trim().length < 10) nuevos.mensaje = 'Cuéntanos un poco más (mínimo 10 caracteres)'
    setErrores(nuevos)
    if (Object.keys(nuevos).length) return

    const texto = [
      `¡Hola, ${negocio.nombreComercial}! 👋`,
      '',
      `*Asunto:* ${formulario.asunto}`,
      `*Nombre:* ${formulario.nombre.trim()}`,
      formulario.telefono.trim() && `*Teléfono:* ${formulario.telefono.trim()}`,
      '',
      formulario.mensaje.trim(),
    ].filter((linea) => linea !== false && linea !== '').join('\n')

    window.open(enlaceWhatsApp(negocio.whatsapp, texto), '_blank', 'noopener')
    setFormulario(VACIO)
  }

  const canales = [
    { icono: IconoWhatsApp, titulo: 'WhatsApp', valor: 'Escríbenos ahora', enlace: negocio.enlaceWhatsappGeneral, externo: true, clase: 'canal--whatsapp' },
    { icono: Phone, titulo: 'Teléfono', valor: negocio.telefono, enlace: negocio.enlaceTelefono },
    { icono: Mail, titulo: 'Correo', valor: negocio.correo, enlace: `mailto:${negocio.correo}` },
    { icono: MapPin, titulo: 'Dirección', valor: negocio.direccionCompleta, enlace: negocio.enlaceMapa, externo: true },
  ]

  return (
    <>
      <EncabezadoPagina
        antetitulo="Contacto"
        titulo="Hablemos de tu proyecto"
        descripcion="Escríbenos por el canal que prefieras. Te respondemos con precios, disponibilidad y tiempos de entrega."
        migas={[{ texto: 'Contacto' }]}
      />

      <section className="seccion contenedor contacto">
        <div className="contacto__info">
          <ul className="contacto__canales">
            {canales.map(({ icono: Icono, titulo, valor, enlace, externo, clase = '' }, i) => (
              <Reveal como="li" key={titulo} retraso={i * 70}>
                <a
                  href={enlace}
                  className={`canal ${clase}`}
                  {...(externo ? { target: '_blank', rel: 'noreferrer' } : {})}
                >
                  <span className="canal__icono"><Icono aria-hidden="true" /></span>
                  <span className="canal__texto">
                    <span>{titulo}</span>
                    <strong>{valor}</strong>
                  </span>
                </a>
              </Reveal>
            ))}
          </ul>

          <Reveal className="contacto__horario">
            <Clock aria-hidden="true" />
            <div>
              <h2>Horario de atención</h2>
              <p>{negocio.horario}</p>
            </div>
          </Reveal>

          {(negocio.facebook || negocio.instagram) && (
            <div className="contacto__redes">
              <span>Síguenos</span>
              {negocio.facebook && (
                <a href={negocio.facebook} target="_blank" rel="noreferrer" aria-label="Facebook"><IconoFacebook /></a>
              )}
              {negocio.instagram && (
                <a href={negocio.instagram} target="_blank" rel="noreferrer" aria-label="Instagram"><IconoInstagram /></a>
              )}
            </div>
          )}
        </div>

        <Reveal desde="derecha" className="contacto__formulario-caja">
          <h2 className="contacto__titulo">Envíanos un mensaje</h2>
          <p className="contacto__subtitulo">Completa el formulario y se abrirá WhatsApp con tu mensaje listo para enviar.</p>

          <form className="formulario" onSubmit={enviar} noValidate>
            <div className="formulario__fila">
              <label className="campo">
                <span className="campo__etiqueta">Nombre completo</span>
                <input name="nombre" value={formulario.nombre} onChange={cambiar} autoComplete="name" aria-invalid={Boolean(errores.nombre)} placeholder="¿Cómo te llamas?" />
                {errores.nombre && <span className="campo__error">{errores.nombre}</span>}
              </label>
              <label className="campo">
                <span className="campo__etiqueta">Teléfono <em>(opcional)</em></span>
                <input name="telefono" type="tel" value={formulario.telefono} onChange={cambiar} autoComplete="tel" placeholder="300 000 0000" />
              </label>
            </div>

            <label className="campo">
              <span className="campo__etiqueta">Asunto</span>
              <select name="asunto" value={formulario.asunto} onChange={cambiar}>
                {ASUNTOS.map((a) => <option key={a}>{a}</option>)}
              </select>
            </label>

            <label className="campo">
              <span className="campo__etiqueta">Mensaje</span>
              <textarea
                name="mensaje"
                rows={5}
                value={formulario.mensaje}
                onChange={cambiar}
                aria-invalid={Boolean(errores.mensaje)}
                placeholder="Ej.: Necesito 10 paneles LED de 18W luz día para una oficina."
              />
              {errores.mensaje && <span className="campo__error">{errores.mensaje}</span>}
            </label>

            <button type="submit" className="btn btn--whatsapp btn--grande btn--bloque">
              <Send /> Enviar por WhatsApp
            </button>
          </form>
        </Reveal>
      </section>

      <section className="contenedor contacto__mapa">
        <MapaUbicacion />
      </section>
    </>
  )
}

export default Contacto
