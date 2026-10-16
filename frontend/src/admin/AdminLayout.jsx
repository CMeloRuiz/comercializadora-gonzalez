import { useEffect, useState } from 'react'
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom'
import {
  ChevronsUpDown, ExternalLink, FolderTree, LayoutDashboard, LogOut, Menu as IconoMenu, Package, Plus, Settings, X,
} from 'lucide-react'
import { cerrarSesion, sesion } from './api'
import { Menu } from './componentes/ui'
import './estilos/layout.css'

/* Vive en public/, se referencia por ruta */
const emblema = '/favicon-48.png'

const NAVEGACION = [
  { a: '/admin/resumen', texto: 'Resumen', icono: LayoutDashboard },
  { a: '/admin/productos', texto: 'Productos', icono: Package },
  { a: '/admin/categorias', texto: 'Categorías', icono: FolderTree },
  { a: '/admin/ajustes', texto: 'Ajustes', icono: Settings },
]

/**
 * Estructura del panel: barra lateral fija con la navegacion y el usuario,
 * y el contenido de cada pagina a la derecha. En movil la barra se oculta
 * tras un boton de menu.
 */
function AdminLayout() {
  const { pathname } = useLocation()
  const [menuMovil, setMenuMovil] = useState(false)
  const usuario = sesion.usuario()

  /* Cierra el menu movil al navegar (ajuste de estado en el render, sin efecto) */
  const [rutaAnterior, setRutaAnterior] = useState(pathname)
  if (pathname !== rutaAnterior) {
    setRutaAnterior(pathname)
    setMenuMovil(false)
  }

  useEffect(() => {
    document.title = 'Panel | Comercializadora Gonzalez'
  }, [])

  return (
    <div className="adm adm-layout">
      <aside className={`adm-sidebar${menuMovil ? ' adm-sidebar--abierta' : ''}`}>
        <div className="adm-sidebar__marca">
          <img src={emblema} alt="" width="32" height="32" />
          <div>
            <strong>Comercializadora</strong>
            <span>Gonzalez · Panel</span>
          </div>
          <button type="button" className="adm-btn adm-btn--fantasma adm-btn--icono adm-sidebar__cerrar" onClick={() => setMenuMovil(false)} aria-label="Cerrar menú">
            <X />
          </button>
        </div>

        <Link to="/admin/productos/nuevo" className="adm-btn adm-btn--primario adm-sidebar__nuevo">
          <Plus /> Nuevo producto
        </Link>

        <nav className="adm-sidebar__nav" aria-label="Panel">
          <span className="adm-sidebar__grupo">General</span>
          {NAVEGACION.map(({ a, texto, icono: Icono }) => (
            <NavLink key={a} to={a} className={({ isActive }) => `adm-sidebar__enlace${isActive ? ' adm-sidebar__enlace--activo' : ''}`}>
              <Icono aria-hidden="true" />
              {texto}
            </NavLink>
          ))}

          <span className="adm-sidebar__grupo">Sitio web</span>
          <a href="/" target="_blank" rel="noreferrer" className="adm-sidebar__enlace">
            <ExternalLink aria-hidden="true" />
            Ver tienda
          </a>
        </nav>

        <div className="adm-sidebar__pie">
          <Menu
            arriba
            disparador={({ alternar, abierto }) => (
              <button type="button" className="adm-usuario" onClick={alternar} aria-expanded={abierto}>
                <span className="adm-usuario__avatar" aria-hidden="true">{usuario.slice(0, 1).toUpperCase()}</span>
                <span className="adm-usuario__texto">
                  <strong>{usuario}</strong>
                  <span>Administrador</span>
                </span>
                <ChevronsUpDown aria-hidden="true" />
              </button>
            )}
          >
            <a href="/" target="_blank" rel="noreferrer" className="adm-menu__item" role="menuitem">
              <ExternalLink /> Abrir la tienda
            </a>
            <div className="adm-menu__separador" />
            <button type="button" className="adm-menu__item adm-menu__item--peligro" role="menuitem" onClick={cerrarSesion}>
              <LogOut /> Cerrar sesión
            </button>
          </Menu>
        </div>
      </aside>

      {menuMovil && <div className="adm-layout__velo" onClick={() => setMenuMovil(false)} aria-hidden="true" />}

      <div className="adm-layout__principal">
        <header className="adm-barra-movil">
          <button type="button" className="adm-btn adm-btn--fantasma adm-btn--icono" onClick={() => setMenuMovil(true)} aria-label="Abrir menú">
            <IconoMenu />
          </button>
          <img src={emblema} alt="" width="28" height="28" />
          <strong>Panel</strong>
        </header>

        <main className="adm-contenido">
          <Outlet />
        </main>
      </div>
    </div>
  )
}

/** Cabecera estandar de cada pagina del panel */
export function CabeceraPagina({ titulo, descripcion, acciones, volver }) {
  return (
    <div className="adm-cabecera">
      <div className="adm-cabecera__texto">
        {volver}
        <h1 className="adm-cabecera__titulo">{titulo}</h1>
        {descripcion && <p className="adm-cabecera__descripcion">{descripcion}</p>}
      </div>
      {acciones && <div className="adm-cabecera__acciones">{acciones}</div>}
    </div>
  )
}

export default AdminLayout
