import { createContext } from 'react'

/**
 * Datos del negocio (WhatsApp, telefono, direccion...) editables desde el panel.
 *
 * Mientras llegan de la API, o si la API no responde, se usan estos valores
 * por defecto: el sitio nunca se queda sin boton de contacto. Lo que se edite
 * en el panel (Ajustes) manda sobre ellos.
 */
export const NEGOCIO_POR_DEFECTO = {
  nombreComercial: 'Comercializadora Gonzalez S.A.S.',
  whatsapp: '573238396545',
  telefono: '+57 323 839 6545',
  correo: 'comergonsas@gmail.com',
  direccion: 'Calle 16 No 9-64 Ofc. 802',
  ciudad: '',
  horario: 'Lunes a viernes: 8:00 a.m. - 6:00 p.m.\nSábados: 8:00 a.m. - 1:00 p.m.',
  facebook: '',
  instagram: '',
  mensajeWhatsapp: 'Hola, Comercializadora Gonzalez. Quisiera recibir asesoría y una cotización.',
}

export const NegocioContext = createContext(NEGOCIO_POR_DEFECTO)
