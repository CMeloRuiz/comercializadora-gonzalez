# Frontend — Comercializadora Gonzalez

React 19 + Vite + React Router 7. Estilos en **CSS puro**, un archivo por componente.

## Estructura

```
src/
├── styles/            tokens.css (paleta, tipografía, espaciado) · base.css · utilidades.css (botones, secciones)
├── lib/               api.js (catálogo) · peticion.js (reintentos) · imagenes.js · whatsapp.js (mensajes de cotización)
├── context/           Datos del negocio (desde /api/ajustes, con valores por defecto)
├── hooks/             useConsulta, useRetraso, useTitulo, useAlAparecer (animaciones al hacer scroll)
├── components/
│   ├── layout/        Header, BuscadorGlobal, Footer, BotonWhatsAppFlotante
│   ├── productos/     TarjetaProducto, GrillaProductos
│   ├── carrito/       BotonAgregar, BotonCarrito (contador), PanelCarrito (cotización de varios)
│   └── ui/            Reveal, EncabezadoPagina, EstadoMensaje, MapaUbicacion, IconosMarca
├── sections/inicio/   Secciones del home (cada una con su CSS)
├── pages/             Inicio, Catalogo, DetalleProducto, Nosotros, Contacto, NoEncontrada
└── admin/             Panel (se carga aparte con React.lazy)
    ├── estilos/       Sistema de diseño propio con prefijo adm-
    ├── componentes/   Avisos, Modal, Confirmar, Interruptor, SubidorImagenes, Editores
    └── paginas/       Login, Resumen, Productos, EditorProducto, Categorias, Ajustes
```

## Convenciones de CSS

- Colores, radios y sombras **solo** desde variables (`tokens.css` en el sitio, `.adm` en el panel).
- Clases BEM en español: `tarjeta-producto__imagen--activa`.
- El panel usa el prefijo `adm-` y su propio CSS, así nunca pisa estilos del sitio.

## Variables

`.env.local` (ver `.env.example`):

- `VITE_API_URL` — URL del backend. **Vacía en desarrollo**: el sitio llama a `/api` en su propio origen y el proxy de `vite.config.js` lo reenvía al puerto 4000. Obligatoria al compilar para producción.
- `VITE_SITIO_URL` — URL pública, para el enlace que va en el mensaje de WhatsApp.

```bash
npm run dev      # desarrollo
npm run build    # genera dist/
npm run lint
```

Desde la raíz del proyecto son `npm run dev:frontend`, `npm run build` y `npm run lint`.

> Nota: el `package.json` de la **raíz** fija `rolldown` en 1.2.8 (dependencia de Vite) porque la 1.2.9 publicada en npm está rota. Va ahí y no aquí porque npm solo aplica `overrides` del paquete raíz en un repositorio con workspaces.
