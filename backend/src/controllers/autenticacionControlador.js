import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { config } from '../config/entorno.js'

/**
 * Login del administrador.
 *
 * Un unico usuario definido por variables de entorno. Usuario inexistente y
 * clave incorrecta responden igual, para no revelar que usuarios existen.
 */

/* ---- Freno a los intentos por fuerza bruta: 8 fallos por IP cada 15 minutos ---- */
const VENTANA_MS = 15 * 60 * 1000
const MAX_FALLOS = 8
const fallos = new Map()

function bloqueado(ip) {
	const registro = fallos.get(ip)
	if (!registro) return 0
	if (Date.now() - registro.desde > VENTANA_MS) {
		fallos.delete(ip)
		return 0
	}
	return registro.cuenta >= MAX_FALLOS ? Math.ceil((registro.desde + VENTANA_MS - Date.now()) / 60000) : 0
}

function anotarFallo(ip) {
	const registro = fallos.get(ip)
	if (!registro || Date.now() - registro.desde > VENTANA_MS) fallos.set(ip, { cuenta: 1, desde: Date.now() })
	else registro.cuenta++
}

export async function iniciarSesion(req, res) {
	const { usuario, clave } = req.body ?? {}
	const ip = req.ip

	const minutos = bloqueado(ip)
	if (minutos) {
		return res.status(429).json({ error: `Demasiados intentos fallidos. Intenta de nuevo en ${minutos} min.` })
	}

	if (!usuario || !clave) {
		return res.status(400).json({ error: 'Escribe el usuario y la clave' })
	}

	const usuarioValido = usuario === config.admin.usuario
	/* Se compara siempre, para no delatar el usuario por el tiempo de respuesta */
	const claveValida = await bcrypt.compare(String(clave), config.admin.claveHash)

	if (!usuarioValido || !claveValida) {
		anotarFallo(ip)
		return res.status(401).json({ error: 'Usuario o clave incorrectos' })
	}

	fallos.delete(ip)

	const token = jwt.sign({ usuario, rol: 'admin' }, config.jwtSecreto, { expiresIn: config.jwtDuracion })
	res.json({ token, usuario, expiraEn: config.jwtDuracion })
}

/** El panel comprueba al entrar si el token guardado sigue siendo valido */
export function verificarSesion(req, res) {
	res.json({ valido: true, usuario: req.usuario.usuario })
}

export default { iniciarSesion, verificarSesion }
