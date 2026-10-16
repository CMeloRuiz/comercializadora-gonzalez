import { lazy, Suspense } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { NegocioProvider } from './context/NegocioContext'
import SitioLayout from './components/layout/SitioLayout'
import Inicio from './pages/Inicio'
import Catalogo from './pages/Catalogo'
import DetalleProducto from './pages/DetalleProducto'
import Nosotros from './pages/Nosotros'
import Contacto from './pages/Contacto'
import NoEncontrada from './pages/NoEncontrada'

/*
 * El panel se carga aparte (code splitting): quien visita la tienda nunca
 * descarga el codigo ni los estilos del administrador.
 */
const AdminApp = lazy(() => import('./admin/AdminApp'))

function CargandoPanel() {
  return <div style={{ minHeight: '100vh', background: '#f7f8fa' }} />
}

function App() {
  return (
    <Routes>
      <Route
        path="/admin/*"
        element={
          <Suspense fallback={<CargandoPanel />}>
            <AdminApp />
          </Suspense>
        }
      />

      <Route
        element={
          <NegocioProvider>
            <SitioLayout />
          </NegocioProvider>
        }
      >
        <Route index element={<Inicio />} />
        <Route path="productos" element={<Catalogo />} />
        <Route path="productos/:slug" element={<DetalleProducto />} />
        <Route path="nosotros" element={<Nosotros />} />
        <Route path="contacto" element={<Contacto />} />
        {/* Rutas del sitio anterior, por si alguien las tiene guardadas */}
        <Route path="products.html" element={<Navigate to="/productos" replace />} />
        <Route path="index.html" element={<Navigate to="/" replace />} />
        <Route path="*" element={<NoEncontrada />} />
      </Route>
    </Routes>
  )
}

export default App
