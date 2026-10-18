# Despliegue en Render

Dos servicios: la **API** (Express) como *Web Service* y el **sitio** (React) como *Static Site*. La base de datos y las imágenes ya viven en Supabase, así que no hay que crear nada más.

> Los dos servicios se instalan **desde la raíz del repositorio**, no desde su subcarpeta: el proyecto usa workspaces de npm y el `package-lock.json` está arriba.

---

## Paso 0 · Subir el repositorio a GitHub

Render despliega desde un repositorio. Si todavía no está en GitHub:

```bash
git init
git add .
git commit -m "Sitio y panel de Comercializadora Gonzalez"
git branch -M main
git remote add origin https://github.com/TU-USUARIO/comercializadora-gonzalez.git
git push -u origin main
```

El `.gitignore` ya excluye `node_modules`, `dist` y **los `.env` con las credenciales**. Verifica antes de subir:

```bash
git status --short | grep -i env
```

No debe aparecer `backend/.env`. Si aparece, no hagas commit y avísame.

---

## Opción A · Blueprint (recomendado, crea todo de una vez)

1. En Render: **New → Blueprint** y selecciona el repositorio.
2. Render lee `render.yaml` y propone los dos servicios.
3. Pide los valores marcados como secretos. Pégalos de `backend/.env`:

| Variable | De dónde sale |
| --- | --- |
| `DATABASE_URL` | Supabase → Project Settings → Database → Connection string → **Session pooler**, con la clave de la base |
| `JWT_SECRETO` | El mismo de tu `.env` (o genera otro: `node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"`) |
| `ADMIN_USUARIO` | `admin` |
| `ADMIN_CLAVE_HASH` | El hash de tu `.env` (el que empieza por `$2b$12$`) |
| `SUPABASE_URL` | `https://ukkdqwpiuytizhseupkt.supabase.co` |
| `SUPABASE_SERVICE_KEY` | La clave secreta (`sb_secret_…`) |
| `ORIGENES_PERMITIDOS` | Déjalo vacío por ahora; se completa en el paso 5 |
| `VITE_SITIO_URL` | Déjalo vacío por ahora; se completa en el paso 5 |

4. **Apply**. Render crea la API y el sitio. La primera construcción tarda unos minutos.
5. Cuando terminen, copia las dos URLs que te da Render y completa:
   - En **comercializadora-gonzalez-api** → *Environment* → `ORIGENES_PERMITIDOS` = la URL del **sitio** (ej. `https://comercializadora-gonzalez.onrender.com`, sin barra final).
   - En **comercializadora-gonzalez** (sitio) → *Environment* → `VITE_SITIO_URL` = esa misma URL.
6. Vuelve a desplegar el **sitio** (*Manual Deploy → Deploy latest commit*): `VITE_SITIO_URL` se incrusta al compilar.

`VITE_API_URL` no hay que tocarla: el blueprint la toma automáticamente de la URL de la API.

---

## Opción B · A mano, servicio por servicio

### B.1 · API (Web Service)

| Campo | Valor |
| --- | --- |
| Type | Web Service |
| Repository | el repositorio del proyecto |
| Root Directory | *(vacío: la raíz)* |
| Runtime | Node |
| Build Command | `npm install` |
| Start Command | `node backend/src/server.js` |
| Health Check Path | `/api/salud` |
| Instance Type | Free |

Variables de entorno:

```
NODE_VERSION=22
DATABASE_URL=postgresql://postgres.ukkdqwpiuytizhseupkt:CLAVE@aws-0-us-east-1.pooler.supabase.com:5432/postgres
JWT_SECRETO=<el de tu .env>
JWT_DURACION=8h
ADMIN_USUARIO=admin
ADMIN_CLAVE_HASH=<el hash de tu .env>
SUPABASE_URL=https://ukkdqwpiuytizhseupkt.supabase.co
SUPABASE_SERVICE_KEY=<la clave sb_secret_...>
SUPABASE_BUCKET=catalogo
MAX_IMAGEN_MB=8
ORIGENES_PERMITIDOS=<se completa con la URL del sitio>
```

### B.2 · Sitio (Static Site)

| Campo | Valor |
| --- | --- |
| Type | Static Site |
| Root Directory | *(vacío: la raíz)* |
| Build Command | `npm install && npm run build` |
| Publish Directory | `frontend/dist` |

Variables de entorno:

```
VITE_API_URL=<la URL de la API, ej. https://comercializadora-gonzalez-api.onrender.com>
VITE_SITIO_URL=<la URL de este sitio>
```

Redirects/Rewrites (para que React Router funcione al recargar una ruta):

| Source | Destination | Action |
| --- | --- | --- |
| `/*` | `/index.html` | Rewrite |

> El archivo `frontend/public/_redirects` ya lo cubre, pero dejarlo también en el panel no estorba.

---

## Paso final · Comprobaciones

1. `https://TU-API.onrender.com/api/salud` → `{"ok":true,...}`
2. `https://TU-API.onrender.com/api/productos?limite=1` → devuelve un producto **sin precio**.
3. Abre el sitio: deben cargar los 31 productos.
4. Entra a `TU-SITIO/admin`, inicia sesión y sube una foto de prueba a un producto: confirma que Supabase Storage funciona desde Render.
5. Prueba un botón "Cotizar por WhatsApp": el enlace debe llevar tu número real.

### Si el sitio carga pero sin productos

Casi siempre es una de dos:

- **CORS**: en los logs de la API aparecerá `[cors] Rechazado https://...`. Revisa que `ORIGENES_PERMITIDOS` tenga exactamente la URL del sitio, sin barra final.
- **`VITE_API_URL` vacía o mal**: en la consola del navegador verás un error diciendo que falta. Corrígela y **vuelve a desplegar el sitio** (no basta con guardar la variable: se incrusta al compilar).

### Si el despliegue se queda en `Port scan timeout reached, no open ports detected`

Significa que el proceso arrancó pero nunca abrió el puerto. Mira si en los logs aparece la línea `[arranque] Node vXX · PORT=...`:

- **No aparece**: el servidor ni siquiera empezó a ejecutarse; el problema está antes, en la cadena de arranque. Por eso el *start command* es `node backend/src/server.js` y no `npm start`: encadenar dos procesos de npm añade puntos de fallo silenciosos (por ejemplo, npm esperando un lock de caché) que dejan el servicio colgado sin un solo mensaje.
- **Sí aparece pero no llega el "API ... escuchando"**: se quedó atascado cargando configuración o dependencias; el error estará en las líneas siguientes.

Mientras un despliegue falla, Render **mantiene en línea la versión anterior**. Conviene comprobarlo antes de sacar conclusiones: que el sitio responda no significa que el último cambio esté publicado.

### Si el despliegue de la API falla con `Could not load the "sharp" module`

`sharp` usa un binario distinto por sistema operativo. Si el `package-lock.json` se generó en Windows, solo registra el binario de Windows y en Linux no se instala ninguno.

Ya está resuelto: `backend/package.json` declara `@img/sharp-linux-x64` como dependencia opcional, así que el lockfile incluye ambos. Si vuelve a aparecer tras actualizar `sharp`, hay que **subir también la versión de ese paquete** para que coincidan exactamente.

Desde ese arreglo, además, un fallo de `sharp` ya no tumba la API: el catálogo y el panel siguen funcionando y solo falla la subida de imágenes, con el motivo escrito en los logs.

### Si un despliegue falla con `Cannot find module '...linux-x64-gnu'`

El proyecto usa tres paquetes con **binario nativo distinto por sistema operativo**:

| Paquete | Para qué | Binario de Linux |
| --- | --- | --- |
| `sharp` | optimizar las imágenes que se suben | `@img/sharp-linux-x64` |
| `rolldown` | el compilador de Vite 8 | `@rolldown/binding-linux-x64-gnu` |
| `lightningcss` | el minificador de CSS de Vite 8 | `lightningcss-linux-x64-gnu` |

Un `package-lock.json` generado en Windows solo registra los binarios de Windows, así que en Linux no se instala ninguno y el proceso muere al cargarlo. Ya está resuelto: los tres binarios de Linux están declarados como dependencias opcionales (`backend/package.json` el de sharp, `frontend/package.json` los otros dos), así que el lockfile incluye ambas plataformas.

> Cada binario va **fijado a la versión exacta** del paquete que lo usa. Al actualizar `sharp`, `vite` o `rolldown` hay que revisar que las versiones sigan coincidiendo.

Para comprobarlo sin esperar a Render, basta con listar los binarios que quedaron en el lockfile:

```bash
node -e "const p=require('./package-lock.json').packages; for (const [k,v] of Object.entries(p)) if (v.os) console.log(v.os[0], k.split('node_modules/').pop(), v.version)"
```

Deben aparecer las dos plataformas de cada uno. Si tienes WSL, la prueba definitiva es correr ahí el mismo `npm install && npm run build` con Node 22.

### Sobre el plan gratuito de Render

La API se duerme tras unos 15 minutos sin tráfico y la siguiente visita tarda ~30-60 s en despertarla. El sitio ya lo contempla: reintenta la petición varios segundos antes de mostrar un error, así que el visitante ve el esqueleto de carga, no un fallo. Si quieres evitarlo del todo, el plan de pago de Render mantiene el servicio siempre encendido.

Recuerda también el *keep-alive* de Supabase (`.github/workflows/mantener-base-activa.yml`): necesita el secreto `DATABASE_URL` en GitHub para que la base no se pause por inactividad.
