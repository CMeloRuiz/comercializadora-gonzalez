# Backend — API Comercializadora Gonzalez

Express 5 + PostgreSQL (Supabase). Sirve el catálogo público y la API del panel administrativo.

> La base es un PostgreSQL normal: el backend se conecta con `pg` y una cadena de conexión, sin el SDK de Supabase. Cambiar de proveedor (Supabase, Neon, un Postgres propio) es solo cambiar `DATABASE_URL`.

## Estructura

```
backend/
├── db/schema.sql                 Tablas: categorias, productos, ajustes
├── src/
│   ├── server.js                 Arranque, CORS, rutas
│   ├── config/
│   │   ├── entorno.js            Lectura y validación del .env
│   │   ├── db.js                 Pool de conexiones, TLS, consultar() y transaccion()
│   │   └── imagenes.js           Optimización (sharp → WebP) y guardado (Supabase Storage, Cloudinary o disco)
│   ├── middleware/               requiereSesion (JWT) y manejador de errores
│   ├── models/                   productos, categorias, ajustes (todo el SQL vive aquí)
│   ├── controllers/              catálogo público, panel, autenticación y validaciones
│   ├── routes/                   /api, /api/admin, /api/auth
│   ├── data/catalogoInicial.js   Catálogo migrado del sitio anterior
│   └── scripts/                  db:crear, db:sembrar, hash
└── uploads/                      Imágenes subidas en desarrollo (sin almacenamiento remoto)
```

## Configuración

1. Copia `.env.example` a `.env`.
2. **DATABASE_URL**: en Supabase → *Project Settings* → *Database* → *Connection string* → pestaña **Session pooler**, y reemplaza `[YOUR-PASSWORD]` por la clave de la base:

   ```
   postgresql://postgres.PROYECTO:CLAVE@aws-0-REGION.pooler.supabase.com:5432/postgres
   ```

   - *Session pooler* (puerto 5432) es el indicado para un servidor siempre encendido como este. El *Transaction pooler* (6543) también funciona.
   - La conexión **directa** (`db.PROYECTO.supabase.co`) solo resuelve por IPv6, y Render no llega por ahí.
3. **DB_SSL_CA** (opcional, recomendado): Supabase firma sus servidores con su propia autoridad ("Supabase Root 2021 CA"), que Node no conoce. Descarga el certificado en *Database → SSL Configuration* y apunta la variable a ese archivo para verificarlo. Sin él la conexión va cifrada igual, pero sin verificar, y el servidor lo avisa al arrancar.
4. **JWT_SECRETO**: `node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"`
5. **Clave del admin**: `npm run hash` y pega el resultado en `ADMIN_CLAVE_HASH` (borra `ADMIN_CLAVE`).
6. **Imágenes** (obligatorio en producción): `SUPABASE_URL` y `SUPABASE_SERVICE_KEY` (ver abajo).

```bash
npm install
npm run db:crear      # idempotente: no borra datos
npm run db:sembrar    # agrega el catálogo inicial sin tocar lo existente
npm run dev
```

> Estos comandos también funcionan desde la raíz del proyecto (workspaces de npm), donde además `npm run dev` levanta la API y el sitio a la vez.

`npm run db:ping` hace una consulta mínima y sirve para dos cosas: comprobar que la conexión funciona y evitar que Supabase pause el proyecto por inactividad (plan gratuito, ~7 días). La versión automática está en `.github/workflows/mantener-base-activa.yml`.

`npm run db:sembrar -- --reemplazar` vuelve a escribir los 22 productos iniciales (útil si se editaron por error); nunca toca productos creados desde el panel.

### Seguridad de las tablas en Supabase

Supabase publica automáticamente el esquema `public` por su API REST (PostgREST), accesible con la clave `anon`, que es pública por diseño. Para que nadie pueda leer precios ni borrar productos saltándose este backend, `schema.sql`:

- activa **RLS sin políticas** en las tres tablas (nadie entra por esa vía), y
- quita los permisos a los roles `anon` y `authenticated`.

El backend se conecta como `postgres`, dueño de las tablas, y el dueño no está sujeto a RLS (no se usa `FORCE ROW LEVEL SECURITY`), así que sigue leyendo y escribiendo con normalidad. Si algún día quieres consultar el catálogo desde el cliente con `supabase-js`, habrá que añadir una política de solo lectura para `anon`.

## Imágenes

Toda imagen que llega del panel se optimiza antes de guardarse: orientación corregida, máximo 1600 px por lado y conversión a WebP (una foto de celular de 5 MB queda en 100–200 KB). Se guarda en el primer destino configurado:

| Destino | Cuándo se usa | Variables |
| --- | --- | --- |
| **Supabase Storage** | En producción | `SUPABASE_URL`, `SUPABASE_SERVICE_KEY`, `SUPABASE_BUCKET` (por defecto `catalogo`) |
| Cloudinary | Alternativa | `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET` |
| `backend/uploads` | Si no hay ninguno | — (solo desarrollo) |

Sobre Supabase Storage:

- `SUPABASE_URL` sale de *Project Settings → Data API → Project URL*.
- `SUPABASE_SERVICE_KEY` es una clave **secreta** del proyecto, nunca la `anon`/`publishable` (esa no puede escribir en Storage). Es secreta: da acceso total al proyecto y solo vive en el servidor. Se acepta en dos formatos:
  - **Recomendado:** *Project Settings → API Keys → pestaña "Publishable and secret API keys"* → crear una **Secret key** (`sb_secret_…`). Se puede revocar por separado, conviene una por servicio, y las claves legacy se deprecan a finales de 2026.
  - **Legacy:** la clave `service_role` (un JWT largo) de la otra pestaña. Funciona igual, pero no se puede rotar sola: regenerarla implica cambiar el *JWT secret*, lo que invalida también la clave `anon` del proyecto.
- El bucket se crea solo la primera vez que se sube una imagen, público y limitado a WebP. Si lo creas a mano, márcalo como público o las fotos no se verán.
- Las fotos se guardan en `catalogo/comercializadora-gonzalez/{productos|categorias}/<uuid>.webp`, con caché de un año (el nombre cambia con cada subida, así que nunca se sirve una versión vieja).
- Al quitar una imagen de un producto, o al eliminar el producto, el archivo se borra del bucket.

## Endpoints

### Públicos
| Método | Ruta | Notas |
| --- | --- | --- |
| GET | `/api/productos` | `?categoria=slug&q=&destacado=true&nuevo=true&orden=relevancia\|nombre\|recientes&pagina=&limite=` |
| GET | `/api/productos/:slug` | `{ producto, relacionados }` |
| GET | `/api/categorias` | Incluye `totalProductos` e `imagenRespaldo` |
| GET | `/api/ajustes` | WhatsApp, teléfono, dirección, horario, redes |

Solo productos publicados. **El precio nunca se incluye.**

### Panel (Bearer token)
| Método | Ruta |
| --- | --- |
| POST | `/api/auth/login` · GET `/api/auth/verificar` |
| GET | `/api/admin/resumen` |
| GET · POST | `/api/admin/productos` (`?q=&categoria=&estado=publicados\|borradores\|destacados\|agotados\|sin-imagen`) |
| GET · PUT · PATCH · DELETE | `/api/admin/productos/:id` |
| GET · POST | `/api/admin/categorias` · PUT `/api/admin/categorias/orden` |
| PUT · DELETE | `/api/admin/categorias/:id` |
| PUT | `/api/admin/ajustes` |
| POST | `/api/admin/imagenes?carpeta=productos\|categorias` (multipart, campo `imagen`) |

## Despliegue en Render (Web Service)

- Root directory: **la raíz del repositorio** (no `backend`: el `package-lock.json` vive arriba, con los workspaces) · Build: `npm install` · Start: `npm start`
- Variables: todas las del `.env` (con `ORIGENES_PERMITIDOS` = URL del sitio publicado).
- Health check: `/api/salud`
- Sin almacenamiento remoto configurado, las imágenes subidas **se pierden en cada despliegue**; el panel muestra un aviso mientras falte.
