# Comercializadora Gonzalez S.A.S. — Sitio web y panel administrativo

Tienda virtual (catálogo con cotización por WhatsApp) y panel para gestionar productos sin tocar código.

```
comercializadora-gonzalez/
├── frontend/      React 19 + Vite · CSS puro · sitio público + panel (/admin)
├── backend/       Node.js + Express 5 · API REST · PostgreSQL (Supabase)
├── _legacy_v1/    Sitio anterior en HTML/CSS/JS (solo como respaldo)
├── package.json   Raíz: workspaces de npm, levanta todo con un comando
└── render.yaml    Blueprint del sitio estático en Render
```

## Puesta en marcha (desarrollo)

Requisitos: Node 22.13 o superior y un proyecto en [Supabase](https://supabase.com).

El backend habla con Supabase como con cualquier PostgreSQL (`pg` + cadena de conexión), sin el SDK: la cadena va en `DATABASE_URL`, tomada de *Project Settings → Database → Connection string → Session pooler*. Detalles de TLS y seguridad de las tablas, en [backend/README.md](backend/README.md).

Todo se maneja **desde la raíz** (el proyecto usa workspaces de npm, así que una sola instalación cubre frontend y backend):

```bash
npm install                 # instala frontend y backend de una vez
cp backend/.env.example backend/.env   # completar DATABASE_URL, JWT_SECRETO y la clave del admin
npm run db:crear            # crea las tablas en Supabase
npm run db:sembrar          # carga el catálogo inicial (31 fichas, 69 referencias)
npm run dev                 # API en :4000 y sitio en :5173, en una sola terminal
```

El frontend **no necesita variables en desarrollo**: llama a `/api` contra su propio origen y el proxy de Vite lo reenvía al backend, así que no hay CORS ni direcciones que mantener sincronizadas. Y si el sitio abre antes de que la API termine de arrancar, reintenta solo durante unos segundos en vez de quedarse en una pantalla de error.

Para publicarlo: [DESPLIEGUE.md](DESPLIEGUE.md).

### Comandos disponibles en la raíz

| Comando | Qué hace |
| --- | --- |
| `npm run dev` | Levanta API y sitio juntos, con la salida de cada uno etiquetada (`API`, `WEB`) |
| `npm run dev:backend` · `npm run dev:frontend` | Solo uno de los dos |
| `npm run build` | Compila el sitio en `frontend/dist` |
| `npm start` | Arranca la API en modo producción |
| `npm run lint` | ESLint sobre el frontend |
| `npm run db:crear` · `npm run db:sembrar` | Esquema y catálogo inicial |
| `npm run hash` | Genera el hash de la clave del administrador |
| `npm run db:ping` | Despierta la base (ver abajo) |
| `npm run setup` | Instala, crea el esquema y siembra, en un paso |

### Que la base no se pause

En el plan gratuito, Supabase pausa el proyecto tras unos **7 días sin actividad**: los datos siguen ahí, pero el sitio responde error hasta restaurarlo a mano desde el panel.

- **Mientras desarrollas:** cualquier uso cuenta como actividad. Si vas a dejarlo quieto varios días, corre `npm run db:ping` al volver (o antes de irte).
- **Ya publicado:** cada visita al catálogo consulta la base, así que no se pausa. Como seguro, el repositorio trae `.github/workflows/mantener-base-activa.yml`, que hace una consulta diaria automática. Para activarlo, crea en GitHub el secreto `DATABASE_URL` (*Settings → Secrets and variables → Actions*) con la misma cadena del `.env`.

## Cómo funciona

| Parte | Ruta | Qué hace |
| --- | --- | --- |
| Inicio | `/` | Hero, beneficios, categorías, más cotizados, banners, cómo comprar, marcas, ubicación |
| Tienda | `/productos` | Buscador, filtros por categoría, orden y paginación (estado en la URL) |
| Detalle | `/productos/:slug` | Galería con zoom, presentaciones, características, especificaciones, **Cotizar por WhatsApp** |
| Cotización | icono del carrito | Junta varios productos y los manda en un solo mensaje de WhatsApp. Convive con el botón de cotizar de cada producto, que sigue igual |
| Nosotros / Contacto | `/nosotros`, `/contacto` | El formulario de contacto abre WhatsApp con el mensaje armado |
| Panel | `/admin` | Login, resumen, productos (CRUD + imágenes), categorías, ajustes de contacto |

- **Sin precios públicos.** El campo `precio` existe en la base y se edita en el panel, pero la API pública nunca lo devuelve.
- **Flujo de venta:** cada botón “Cotizar” abre `wa.me` con el producto, la presentación elegida y el enlace.
- **Imágenes:** toda imagen subida se optimiza a WebP (máx. 1600 px) en el backend. En producción se guardan en Supabase Storage (bucket `catalogo`), en el mismo proyecto que la base de datos.

## Imágenes que puedes reemplazar

| Sección | Archivo | Tamaño recomendado |
| --- | --- | --- |
| Hero del inicio | `frontend/src/assets/images/taladro-pared-960.webp` y `-1920.webp` | 1200 × 1500 px (4:5), JPG/WEBP |
| Encabezado de páginas internas | `frontend/src/assets/images/hero-herramientas-*.webp` | 1920 × 700 px |
| Fondo “Compra por categoría” | `frontend/src/assets/images/set-llaves-1920.webp` | 1920 × 1080 px (se oscurece) |
| Banner “Herramientas” | `frontend/src/assets/images/herramientas-azul-960.webp` | 1200 × 800 px |
| Banners LED / Emergencia | `frontend/public/productos/*.webp` | 800 × 800 px, fondo transparente |
| Nosotros | `atornillador-960.webp`, `set-llaves-960.webp`, `construccion-1920.webp` | 960 × 1200 / 960 × 640 / 1920 × 1080 |
| Productos | **Desde el panel** | 1000 × 1000 px, fondo blanco o transparente |
| Categorías | **Desde el panel** | 800 × 800 px, fondo transparente |

Si reemplazas un archivo de `assets`, conserva el nombre o actualiza el `import` del componente.
