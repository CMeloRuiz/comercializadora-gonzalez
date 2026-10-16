import { consultar } from '../config/db.js'

/**
 * ===== Ajustes del negocio =====
 *
 * Datos de contacto que el sitio usa en muchos lugares (boton de WhatsApp,
 * pie de pagina, pagina de contacto). Viven en una sola fila JSONB.
 *
 * Estos valores por defecto se usan mientras no haya nada guardado. Lo que se
 * edite en el panel (Ajustes) manda sobre ellos.
 */

export const AJUSTES_POR_DEFECTO = {
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

const CLAVE = 'negocio'

export async function obtener() {
	const { rows } = await consultar('SELECT datos FROM ajustes WHERE clave = $1', [CLAVE])
	/* Se mezcla con los por defecto para que un campo nuevo nunca llegue vacio */
	return { ...AJUSTES_POR_DEFECTO, ...(rows[0]?.datos ?? {}) }
}

export async function guardar(datos) {
	const limpios = {}
	for (const clave of Object.keys(AJUSTES_POR_DEFECTO)) {
		if (datos[clave] !== undefined) limpios[clave] = String(datos[clave] ?? '').trim().slice(0, 500)
	}
	/* El numero de WhatsApp solo con digitos, que es lo que pide wa.me */
	if (limpios.whatsapp !== undefined) limpios.whatsapp = limpios.whatsapp.replace(/\D/g, '')

	const combinados = { ...(await obtener()), ...limpios }

	await consultar(
		`INSERT INTO ajustes (clave, datos) VALUES ($1, $2)
		 ON CONFLICT (clave) DO UPDATE SET datos = EXCLUDED.datos, actualizado_en = NOW()`,
		[CLAVE, JSON.stringify(combinados)]
	)
	return combinados
}

export default { obtener, guardar, AJUSTES_POR_DEFECTO }
