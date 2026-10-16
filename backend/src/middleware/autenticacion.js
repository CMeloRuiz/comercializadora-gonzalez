import jwt from 'jsonwebtoken'
import { config } from '../config/entorno.js'

/**
 * Protege las rutas privadas.
 *
 * Espera "Authorization: Bearer <token>". Si falta, caduco o fue manipulado,
 * corta con 401 y el panel manda al login.
 */
export function requiereSesion(req, res, next) {
	const [esquema, token] = (req.get('authorization') || '').split(' ')

	if (esquema !== 'Bearer' || !token) {
		return res.status(401).json({ error: 'Falta el token de sesion' })
	}

	try {
		req.usuario = jwt.verify(token, config.jwtSecreto)
		next()
	} catch (error) {
		const caducado = error.name === 'TokenExpiredError'
		res.status(401).json({ error: caducado ? 'La sesion caduco' : 'Token invalido', caducado })
	}
}

export default requiereSesion
