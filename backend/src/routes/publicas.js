import { Router } from 'express'
import catalogo from '../controllers/catalogoControlador.js'

/* --- Publicas: las consume el sitio --- */
const router = Router()

router.get('/productos', catalogo.listarProductos)
router.get('/productos/:slug', catalogo.obtenerProducto)
router.get('/categorias', catalogo.listarCategorias)
router.get('/ajustes', catalogo.obtenerAjustes)

export default router
