import { Router } from 'express'
import { iniciarSesion, verificarSesion } from '../controllers/autenticacionControlador.js'
import { requiereSesion } from '../middleware/autenticacion.js'

const router = Router()

router.post('/login', iniciarSesion)
router.get('/verificar', requiereSesion, verificarSesion)

export default router
