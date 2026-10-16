import { useEffect } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import { RutaProtegida } from './sesion'
import { ProveedorAvisos } from './componentes/Avisos'
import AdminLayout from './AdminLayout'
import Login from './paginas/Login'
import Resumen from './paginas/Resumen'
import Productos from './paginas/Productos'
import EditorProducto from './paginas/EditorProducto'
import Categorias from './paginas/Categorias'
import Ajustes from './paginas/Ajustes'
import './estilos/base.css'
import './estilos/componentes.css'

/**
 * ===== Panel administrativo =====
 *
 * Se carga aparte del sitio (React.lazy en App.jsx). Todo su CSS vive en
 * admin/estilos con el prefijo "adm-", asi no choca con el sitio publico.
 */
const FUENTE_INTER = 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap'

function AdminApp() {
  /* La fuente del panel solo se descarga cuando se entra al panel */
  useEffect(() => {
    if (document.querySelector(`link[href="${FUENTE_INTER}"]`)) return
    const enlace = document.createElement('link')
    enlace.rel = 'stylesheet'
    enlace.href = FUENTE_INTER
    document.head.appendChild(enlace)
  }, [])

  return (
    <ProveedorAvisos>
      <Routes>
        <Route index element={<Login />} />
        <Route
          element={
            <RutaProtegida>
              <AdminLayout />
            </RutaProtegida>
          }
        >
          <Route path="resumen" element={<Resumen />} />
          <Route path="productos" element={<Productos />} />
          <Route path="productos/nuevo" element={<EditorProducto />} />
          <Route path="productos/:id" element={<EditorProducto />} />
          <Route path="categorias" element={<Categorias />} />
          <Route path="ajustes" element={<Ajustes />} />
        </Route>
        <Route path="*" element={<Navigate to="/admin/resumen" replace />} />
      </Routes>
    </ProveedorAvisos>
  )
}

export default AdminApp
