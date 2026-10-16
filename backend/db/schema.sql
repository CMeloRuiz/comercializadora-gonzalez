-- ===== Esquema del catalogo de Comercializadora Gonzalez =====
--
-- Se ejecuta sobre la base de Supabase antes del primer arranque. Es
-- idempotente: volver a lanzarlo no borra ni altera datos.
--
--   a) Pegarlo en el SQL Editor de Supabase, o
--   b) desde backend/:  npm run db:crear
--
-- Despues, para cargar el catalogo inicial:  npm run db:sembrar

-- ---------------------------------------------------------------------------
-- Categorias
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS categorias (
  id             SERIAL PRIMARY KEY,
  slug           VARCHAR(120) UNIQUE NOT NULL,
  nombre         VARCHAR(120) NOT NULL,
  descripcion    TEXT NOT NULL DEFAULT '',
  -- { url, id } | NULL. Sin imagen, el sitio usa la de un producto de la categoria
  imagen         JSONB,
  orden          INTEGER NOT NULL DEFAULT 0,
  creado_en      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  actualizado_en TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ---------------------------------------------------------------------------
-- Productos
-- ---------------------------------------------------------------------------
-- Las listas (caracteristicas, especificaciones, variantes, imagenes) van en
-- JSONB: siempre se leen y escriben junto con el producto, nunca se consultan
-- por separado, y asi el panel puede crecer sin migrar el esquema.
CREATE TABLE IF NOT EXISTS productos (
  id               SERIAL PRIMARY KEY,
  slug             VARCHAR(160) UNIQUE NOT NULL,
  nombre           VARCHAR(160) NOT NULL,
  categoria_id     INTEGER REFERENCES categorias(id) ON DELETE SET NULL,
  marca            VARCHAR(80),
  referencia       VARCHAR(80),

  -- Frase corta para tarjetas y buscadores
  resumen          VARCHAR(300) NOT NULL DEFAULT '',
  -- Descripcion larga, en parrafos separados por linea en blanco
  descripcion      TEXT NOT NULL DEFAULT '',

  caracteristicas  JSONB NOT NULL DEFAULT '[]'::jsonb,  -- ["texto", ...]
  aplicaciones     JSONB NOT NULL DEFAULT '[]'::jsonb,  -- ["texto", ...]
  especificaciones JSONB NOT NULL DEFAULT '[]'::jsonb,  -- [{ "etiqueta": "", "valor": "" }]
  variantes        JSONB NOT NULL DEFAULT '[]'::jsonb,  -- ["9W - 6500K", ...]
  imagenes         JSONB NOT NULL DEFAULT '[]'::jsonb,  -- [{ "url": "", "id": "" }], la primera es la portada

  -- Aun NO se publica: la API publica nunca lo devuelve. Queda listo para cuando
  -- el negocio decida mostrar precios.
  precio           NUMERIC(12, 2) CHECK (precio IS NULL OR precio >= 0),

  disponible       BOOLEAN NOT NULL DEFAULT TRUE,   -- en stock / bajo pedido
  destacado        BOOLEAN NOT NULL DEFAULT FALSE,  -- "Mas cotizados" del inicio
  nuevo            BOOLEAN NOT NULL DEFAULT FALSE,  -- etiqueta "Nuevo"
  publicado        BOOLEAN NOT NULL DEFAULT TRUE,   -- FALSE = borrador, oculto del sitio

  creado_en        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  actualizado_en   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS productos_categoria_idx ON productos (categoria_id);
CREATE INDEX IF NOT EXISTS productos_publicado_idx ON productos (publicado);

-- ---------------------------------------------------------------------------
-- Ajustes del negocio (WhatsApp, telefono, direccion, redes...)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS ajustes (
  clave          VARCHAR(60) PRIMARY KEY,
  datos          JSONB NOT NULL,
  actualizado_en TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON COLUMN productos.precio IS 'Opcional y privado: no se expone en la API publica todavia';
COMMENT ON COLUMN productos.imagenes IS 'Lista ordenada de { url, id }; la primera es la portada';

-- ---------------------------------------------------------------------------
-- Seguridad en Supabase
-- ---------------------------------------------------------------------------
-- Supabase publica automaticamente todo lo que viva en el esquema "public" a
-- traves de su API REST (PostgREST). Sin esto, cualquiera con la clave "anon"
-- del proyecto (que es publica por diseno) podria leer los precios o borrar
-- productos sin pasar por nuestro backend.
--
-- Dos candados:
--   1. RLS activo y SIN politicas: nadie que entre por esa API puede leer ni
--      escribir. El dueno de la tabla (el rol "postgres" con el que se conecta
--      el backend) no esta sujeto a RLS, asi que la API propia sigue igual.
--      No se usa FORCE ROW LEVEL SECURITY, justamente para no bloquearla.
--   2. Se quitan los permisos a los roles anon y authenticated.
--
-- Todo va condicionado a que esos roles existan, para que el mismo archivo
-- siga sirviendo en un Postgres normal.

ALTER TABLE categorias ENABLE ROW LEVEL SECURITY;
ALTER TABLE productos  ENABLE ROW LEVEL SECURITY;
ALTER TABLE ajustes    ENABLE ROW LEVEL SECURITY;

-- Solo sobre nuestras tablas y sus secuencias: en el mismo proyecto puede
-- haber otras aplicaciones del cliente, y no se les deben tocar los permisos.
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'anon') THEN
    REVOKE ALL ON categorias, productos, ajustes FROM anon;
    REVOKE ALL ON SEQUENCE categorias_id_seq, productos_id_seq FROM anon;
  END IF;

  IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'authenticated') THEN
    REVOKE ALL ON categorias, productos, ajustes FROM authenticated;
    REVOKE ALL ON SEQUENCE categorias_id_seq, productos_id_seq FROM authenticated;
  END IF;
END
$$;
