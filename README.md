# Lunatika Accesorios
 
Tienda online + panel de administración de Lunatika Accesorios, en una
sola app de **Next.js 15** (App Router). Antes eran dos proyectos
separados sobre Supabase/PostgreSQL; hoy la tienda vive en `/`, el panel
en `/admin`, y la base de datos es **MongoDB**.
 
🔗 Sitio: https://lunatika.vercel.app/
 
---
 
## Índice
 
- [Stack](#stack)
- [Funcionalidades](#funcionalidades)
- [Estructura del proyecto](#estructura-del-proyecto)
- [Configuración local](#configuración-local)
- [Scripts disponibles](#scripts-disponibles)
- [Migrar datos existentes desde Supabase](#migrar-datos-existentes-desde-supabase)
- [Gestión de imágenes](#gestión-de-imágenes)
- [Evitar que Supabase se pause por inactividad](#evitar-que-supabase-se-pause-por-inactividad)
- [Despliegue en Vercel](#despliegue-en-vercel)
- [Seguridad](#seguridad)
---
 
## Stack
 
| Parte              | Tecnología                                      |
| ------------------ | ------------------------------------------------ |
| Framework           | Next.js 15 (App Router, Server Components)       |
| Base de datos       | MongoDB + Mongoose                               |
| Autenticación       | Auth.js / NextAuth v5 (usuario + contraseña, bcrypt) |
| Almacenamiento de imágenes | Supabase Storage                          |
| UI                  | Tailwind CSS + shadcn/ui (Radix UI)               |
| Validación          | Zod + React Hook Form                            |
| Notificaciones (UI) | Sonner (toasts)                                  |
 
## Funcionalidades
 
**Tienda pública**
- Catálogo filtrable por categoría y material.
- Fichas de producto con galería de imágenes/video, precio y stock.
- Contacto directo por WhatsApp (no hay carrito de compras).
- SEO: metadata dinámica por página, Open Graph/Twitter cards,
  `sitemap.xml` y `robots.txt` generados dinámicamente, JSON-LD de
  producto y organización.
- Menú lateral con categorías (dropdown al hover en escritorio, drawer en
  mobile).
**Panel de administración** (`/admin`, protegido por login)
- ABM de productos, categorías y materiales.
- Al subir la portada de un producto/categoría: podés subir un archivo
  nuevo o elegir uno ya subido antes al bucket, con selector visual.
- `/admin/images`: galería con **todas** las imágenes del Storage,
  mostrando en qué producto(s)/categoría(s) está usada cada una —
  permite reemplazar el archivo (sin tocar la base) o eliminarlo (con
  chequeo de qué se rompería antes de confirmar).
- Confirmaciones de borrado con modal prolijo (no el `confirm()` feo del
  navegador).
## Estructura del proyecto
 
```
app/
  (site)/              Tienda pública (Navbar + Footer, layout con sticky footer)
  admin/                Panel de administración (protegido)
  login/                Formulario de login
  api/                  Rutas de API (categorías, materiales, productos, auth, cron, admin/images)
  sitemap.ts            Sitemap dinámico
  robots.ts             robots.txt dinámico
components/
  admin/                Componentes exclusivos del panel
  ui/                   Componentes compartidos (shadcn)
  *.tsx                 Componentes de la tienda pública
hooks/
  use-confirm.tsx       Modal de confirmación reutilizable (reemplaza confirm())
  use-delete-resource.ts  Patrón de "borrar + toast + refresh" compartido
lib/
  models/               Esquemas de Mongoose (Category, Material, Product, Admin)
  mongodb.ts            Conexión a MongoDB (cacheada para dev/serverless)
  serializers.ts        Convierte documentos de Mongo al shape que usa el front
  supabase-storage.ts   Cliente de Supabase, solo para el storage de imágenes
  types.ts / zod.ts     Tipos y validaciones compartidas
actions/                Funciones server-side que consultan MongoDB directamente
scripts/                Scripts de mantenimiento (ver tabla más abajo)
auth.ts / auth.config.ts / middleware.ts   Autenticación y rutas protegidas
vercel.json             Config del cron de keep-alive de Supabase
```
 
## Configuración local
 
**Requisitos**: Node.js 18.18+, un cluster de [MongoDB Atlas](https://www.mongodb.com/atlas)
(gratis) y un proyecto de [Supabase](https://supabase.com) (gratis, solo
para Storage).
 
1. Cloná el repo y copiá las variables de entorno de ejemplo:
```bash
   git clone <tu-repo>
   cd lunatika
   cp .env.example .env
```
 
2. Completá el `.env`:
   | Variable | Qué es |
   | --- | --- |
   | `MONGODB_URI` | Cadena de conexión a tu cluster de Atlas |
   | `AUTH_SECRET` | Generalo con `openssl rand -base64 32` |
   | `NEXTAUTH_URL` | `http://localhost:3000` en local |
   | `ADMIN_USERNAME` / `ADMIN_PASSWORD` / `ADMIN_NAME` | Credenciales para `npm run seed:admin`. El login pide **usuario**, no email |
   | `ADMIN_EMAIL` | Opcional, solo dato de contacto |
   | `NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Las de tu proyecto de Supabase (la key **publishable**, no la `secret`) |
   | `CRON_SECRET` | Generalo con `openssl rand -base64 32` — protege el endpoint de keep-alive |
3. Instalá dependencias y creá tu usuaria administradora:
```bash
   npm install
   npm run seed:admin
```
 
4. Levantá el servidor:
```bash
   npm run dev
```
 
   - Tienda: http://localhost:3000
   - Login: http://localhost:3000/login
   - Panel: http://localhost:3000/admin
## Scripts disponibles
 
| Comando | Para qué sirve |
| --- | --- |
| `npm run dev` | Servidor de desarrollo |
| `npm run build` / `npm run start` | Build y arranque en modo producción |
| `npm run lint` | Lint del proyecto |
| `npm run seed:admin` | Crea o actualiza la cuenta de administradora (usuario/contraseña) |
| `npm run migrate:supabase -- --file=...` | Migra categorías/materiales/productos desde un backup viejo de Supabase/Postgres |
| `npm run reupload:images -- --dir=...` | Sube en lote fotos locales al bucket, preservando el nombre de archivo esperado |
| `npm run fix:image-urls -- --from=... --to=...` | Reemplaza el dominio de Supabase en las URLs guardadas (por si cambiás de proyecto) |
| `npm run cleanup:images [-- --apply]` | Borra imágenes del Storage que no están enlazadas a ningún producto/categoría |
 
Todos los scripts de migración/limpieza corren en modo **dry run** por
defecto cuando aplica (te muestran qué harían sin tocar nada) — hay que
agregar `--apply` o `--force` explícitamente para que escriban de verdad.
 
## Migrar datos existentes desde Supabase
 
1. Desde el dashboard de Supabase, bajate un backup de la base
   (**Database → Backups**), en formato **texto plano** (no el binario
   `.dump` de `pg_dump -F c`).
2. Poné el archivo en `scripts/data/` (ignorada por git, así nunca se sube
   sin querer).
3. Corré:
```bash
   npm run migrate:supabase -- --file=scripts/data/tu-backup.backup
```
 
   El script lee categorías, materiales y productos del dump, los inserta
   en Mongo manteniendo fechas originales, mapea los IDs viejos (UUID de
   Postgres) a los `_id` nuevos de Mongo, avisa (sin frenar) si hay
   posibles duplicados por nombre+precio, y no hace nada si Mongo ya tiene
   datos cargados (salvo que agregues `--force`).
 
Las **imágenes no se tocan**: las URLs migran tal cual apuntando a tu
Supabase Storage. Mientras ese proyecto siga activo, van a seguir
funcionando sin hacer nada más. Si en algún momento cambiás de proyecto de
Supabase, `fix:image-urls` actualiza las URLs guardadas por vos.
 
## Gestión de imágenes
 
`/admin/images` muestra **todas** las imágenes subidas al Storage, con en
qué producto(s)/categoría(s) está usada cada una:
 
- **Editar** (lápiz): reemplaza el archivo en el mismo bucket y con el
  mismo nombre — como la URL no cambia, cualquier producto/categoría que
  ya la use muestra la foto nueva sola, sin tocar nada más. (Por caché del
  navegador/CDN puede tardar un momento en verse; Ctrl/Cmd+Shift+R para
  forzarlo).
- **Eliminar** (tacho): bloqueado si es portada de una categoría (siempre
  necesita una) — hay que cambiarla desde ahí primero. Si está en uso por
  productos, se borra y se les saca la referencia automáticamente para no
  dejar fotos rotas.
- Filtro **"Solo sin usar"**: para encontrar huérfanas a simple vista.
Para una limpieza masiva de una sola vez: `npm run cleanup:images -- --apply`.
 
## Evitar que Supabase se pause por inactividad
 
El plan gratis de Supabase pausa un proyecto (Storage incluido) después de
~7 días sin actividad real contra su base de Postgres. Como esta app ya no
usa esa base para nada (todo vive en MongoDB), nada la mantendría "viva"
sin ayuda:
 
- `app/api/cron/keep-supabase-alive/route.ts` le pega un `list()` liviano
  al bucket de productos (cuenta como actividad real, porque Storage
  consulta su propia tabla `storage.objects`).
- `vercel.json` ya trae configurado un [Vercel Cron](https://vercel.com/docs/cron-jobs)
  que llama a ese endpoint todos los días a las 6am UTC (funciona incluso
  en el plan gratis de Vercel).
- El endpoint está protegido con `CRON_SECRET`: cargalo como variable de
  entorno en Vercel y este manda automáticamente el header
  `Authorization: Bearer <CRON_SECRET>` en cada llamada.
- **Sin Vercel**: armá el mismo ping con un
  [GitHub Action programado](https://docs.github.com/en/actions/using-workflows/events-that-trigger-workflows#schedule)
  o un servicio gratuito como [cron-job.org](https://cron-job.org) /
  [UptimeRobot](https://uptimerobot.com), apuntando a
  `https://tu-dominio.com/api/cron/keep-supabase-alive` con el header de
  arriba, una vez cada 1-3 días.
- Alternativa sin código: el plan pago de Supabase (Pro, US$25/mes)
  elimina el pausado por inactividad directamente.
## Despliegue en Vercel
 
1. Subí el repo a GitHub/GitLab e importalo en Vercel.
2. Cargá las mismas variables del `.env` en Project Settings →
   Environment Variables, con `NEXTAUTH_URL=https://tu-dominio.vercel.app`.
3. Confirmá que tu cluster de Atlas permita conexiones desde `0.0.0.0/0`
   (o los rangos de Vercel).
4. Corré `npm run seed:admin` **localmente, apuntando al `MONGODB_URI` de
   producción**, para que la cuenta de administradora exista antes del
   primer login.
5. Deploy 🚀 — el cron de keep-alive de Supabase se activa solo, sin pasos
   extra.
## Seguridad
 
- Cambiá la contraseña de la administradora apenas puedas:
  `npm run seed:admin -- --username=tu-usuario --password=nueva-clave`.
- `middleware.ts` bloquea `/admin/*`, las escrituras (`POST/PUT/DELETE`)
  de `/api/categories`, `/api/materials` y `/api/products`, y **todos**
  los métodos de `/api/admin/*` a quien no tenga sesión iniciada.
- Los buckets de Supabase Storage (`product-image`, `category-image`)
  deben tener lectura pública y escritura restringida. Hoy se sube con la
  key `anon`/`publishable` (protegida por políticas del bucket, no por
  secreto) — para blindarlo más, la subida podría moverse a un endpoint de
  servidor con la `service_role`/`secret` key.
- El `.env` nunca se versiona (`.gitignore` ya lo excluye) — si alguna vez
  quedó commiteado por error, hay que rotar todas esas credenciales
  (Mongo, Supabase, `AUTH_SECRET`) sin importar si el repo es público o
  privado.
 