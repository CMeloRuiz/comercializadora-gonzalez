import { Router } from 'express'
import admin from '../controllers/adminControlador.js'
import { requiereSesion } from '../middleware/autenticacion.js'

/* --- Privadas: solo el panel, con sesion iniciada --- */
const router = Router()

router.use(requiereSesion)

router.get('/resumen', admin.resumen)

router.get('/productos', admin.listarProductos)
router.post('/productos', admin.crearProducto)
router.get('/productos/:id', admin.obtenerProducto)
router.put('/productos/:id', admin.actualizarProducto)
router.patch('/productos/:id', admin.actualizarProductoParcial)
router.delete('/productos/:id', admin.eliminarProducto)

router.get('/categorias', admin.listarCategorias)
router.post('/categorias', admin.crearCategoria)
router.put('/categorias/orden', admin.reordenarCategorias)
router.put('/categorias/:id', admin.actualizarCategoria)
router.delete('/categorias/:id', admin.eliminarCategoria)

router.put('/ajustes', admin.guardarAjustes)

router.post('/imagenes', admin.subida, admin.subirImagen)

export default router
