# G-Calls S.A.S. — Portal web corporativo + CMS + CRM

Sitio web corporativo para G-Calls S.A.S. (gestión de cadena de abastecimiento, ambiental,
SST y responsabilidad social), con formulario de contacto que genera leads, panel
administrativo con roles (CMS + CRM) y cotizaciones en PDF.

**Alcance de la entrega actual: G-Calls Core 1.0.** n8n, IA y WhatsApp automatizado quedan
para la etapa Automation 2.0 y no se tocan en este ciclo.

> Las líneas marcadas con `<!-- verificar -->` vienen de documentación, no del código.
> Confírmalas y quita la marca.

## Stack

- **Frontend:** React 18 + TypeScript + Vite 5.4 + Tailwind 3 + shadcn/ui (Radix), react-router-dom 6,
  @tanstack/react-query, react-hook-form + zod, date-fns, lucide-react, sonner, recharts.
  Proyecto originado en Lovable (`lovable-tagger` en dev).
- **Backend:** PHP nativo, sin framework, sin Composer. **Mínimo PHP 8.1** (`json_response(): never`).
  PDO + pdo_mysql con `EMULATE_PREPARES = false`, `declare(strict_types=1)` en todo archivo.
- **Base de datos:** MySQL `gcalls_db`, utf8mb4_unicode_ci. DDL completo en `schema.sql`;
  cambios posteriores en `migrations/` (idempotentes, sin DROP).
  Tablas: `usuarios` (sin columna `activo`), `servicios` (slug, contenido_json, activo),
  `contactos_leads`, `cotizaciones` (sin uso aún; FK a leads con `ON DELETE CASCADE`, pendiente de
  cambiar a RESTRICT antes de H2/H3), `contenidos` (CMS, una fila por sección).
  En `servicios`: `color_accent` guarda la **clave del tema** (no un HEX), `icono` un nombre de la lista
  permitida y `contenido_json` `{ descripcion, tarjetas: [{ titulo, icono, items[] }] }`.
- **Producción:** Colombia Hosting (cPanel), dominio `gcallssas.com`, plan COLHOST2 activo (renueva en ~10 meses, 23/11).
  **PHP 8.3** desde el 23/11 (cPanel → PHP Selector; antes era 7.0 y toda la API respondía 500). Extensiones
  activas verificadas: `gd`, `fileinfo`, `exif`, `mbstring`, `pdo`, `nd_pdo_mysql`, `mysqlnd` (no marcar
  también `pdo_mysql`: choca con `nd_pdo_mysql`).
  `.env` se lee desde `dirname(public/api/config, 3)`: en el hosting queda **fuera** de `public_html`.
  Imágenes subidas: `storage/medios/` en esa misma raíz (o `MEDIOS_DIR` del `.env`), también fuera de
  `public_html`: el FTP no las borra y nada subido se ejecuta. Requiere las extensiones **gd** y **fileinfo**.
  Los respaldos de producción deben incluir esa carpeta además de la BD.

## ⚠️ Despliegue automático

`.github/workflows/deploy.yml` hace build y sube `dist/` por FTP a `public_html/` **en cada push a `main`**.
Vite copia `public/` a `dist/`, así que **la API PHP (`public/api`) también se publica**.
**Push o merge a `main` = despliegue a producción.** Nunca hacerlo sin aprobación explícita.
Las migraciones de `migrations/` **no** se ejecutan solas: se corren a mano en cada base de datos.

Vercel (legado de una etapa anterior) se está retirando: no ejecuta PHP y sirve los `.php` como
descargas. No volver a conectarlo. El backend Node/Express de correo también se retiró.

## Entorno local (Windows + PowerShell)

- Repo: `C:\Proyectos\gcalls-sas\gcalls-web-portal` (respaldos de BD en `C:\Proyectos\gcalls-sas\`, fuera del repo)
- Frontend: `npm run dev` → http://localhost:8080
- API: `php -S localhost:8000 -t public/api` → http://localhost:8000
- Proxy Vite: `/api/*` → `localhost:8000` **quitando el prefijo `/api`**.
- MySQL: servicio Windows `MySQL267`, puerto 3306, base `gcalls_db`.
- PHP local en `C:\php` (8.4): `php.ini` con `extension=gd` y `extension=fileinfo` activas (necesarias para subir imágenes).
- Migraciones: entrar al cliente con `mysql -u root -p --default-character-set=utf8mb4 gcalls_db` y, ya en el
  prompt `mysql>`, ejecutar `source migrations/<archivo>.sql`. `source` es un comando del cliente: con `-e`
  falla con error 1064. No usar `Get-Content |` (PowerShell puede alterar la codificación).
  Antes de migrar: respaldo con `mysqldump ... --result-file=<ruta fuera del repo>` (no usar `>`).
- Mock de leads: `VITE_USE_MOCK_LEADS=true` usa `src/lib/api/admin-contactos.mock.ts`.

## Estructura clave

```
src/
  types/api.ts                 # Fuente única de verdad de contratos (Lead, ApiResponse, Contenido*...)
  lib/contenidos.ts            # CMS: valores de respaldo, useContenidoGlobal(), utilidades de enlaces
  lib/servicios.ts             # Servicios: temas de color, contenido de respaldo, useServicios()
  lib/iconos.ts                # Íconos permitidos (= SERVICIOS_ICONOS en PHP)
  lib/medios.ts                # urlMedio(): URL pública de una imagen subida (vacío = imagen por defecto)
  lib/api/admin-medios.ts      # subirImagen(): reduce en el navegador y sube a /api/admin/medios.php
  lib/api/admin-servicios.ts   # Cliente de /api/admin/servicios.php
  lib/api/*.mock.ts            # Mocks DEV (import dinámico)
  contexts/AuthContext.tsx     # Sesión real contra /api/auth/*; usuario y csrfToken en memoria
  components/admin/            # AdminLayout, AdminSidebar, AdminNavbar, ProtectedRoute, ContenidosTabs, SelectorIcono, CampoImagen
  components/Mantenimiento.tsx # Pantalla de mantenimiento
  pages/                       # Páginas públicas
  pages/ServicioDetalle.tsx    # Plantilla única de /servicios/:slug (inactivo o inexistente → 404)
  pages/admin/                 # Login, Dashboard, Contactos (leads), Contenidos, ContenidoInicio, ContenidoEquipo, ContenidoIdentidad, Servicios, ServicioEditar
public/api/
  config/env.php               # Carga .env
  config/db.php                # get_db_connection() singleton
  config/helpers.php           # json_response(), get_json_input() — mantener pequeño
  config/auth.php              # start_secure_session, check_auth, require_auth, validate_csrf_token, destroy_session
  config/cors.php              # Lista blanca de orígenes + X-CSRF-Token
  config/contenidos.php        # CMS: esquema de secciones (global, inicio, identidad, equipo), validar_contenido()
  config/servicios.php         # Íconos y temas permitidos, validar_servicio_patch(), servicio_desde_fila()
  config/medios.php            # Usos de imagen, validación, regeneración con GD, medio_ruta(), medio_enviar()
  auth/{login,logout,me}.php
  contactos.php                # POST público del formulario
  contenidos.php               # GET público ?seccion=
  servicios.php                # GET público: servicios activos
  medio.php                    # GET público ?f=<nombre>: entrega una imagen subida (caché 1 año)
  marca.php                    # GET ?tipo=favicon|compartir: imagen de Identidad o la de public/ (index.html)
  admin/contactos.php          # GET leads con servicio_titulo (admin, editor), LIMIT 200
  admin/contenidos.php         # GET (admin, editor, viewer) / PUT con CSRF (admin, editor) ?seccion=
  admin/servicios.php          # GET todos / PATCH ?id= parcial con CSRF (activo, titulo, icono, tema, contenido)
  admin/medios.php             # POST multipart (archivo, uso) con CSRF (admin, editor) → nombre de la imagen
migrations/                    # Cambios de esquema posteriores a schema.sql
scripts/create_admin.php       # CLI, contraseña oculta. NO ejecutar sin autorización
scripts/seed_servicios.php     # Idempotente. NO ejecutar sin autorización
schema.sql
```
Mantenimiento: `VITE_MAINTENANCE_MODE` (activo salvo que valga `"false"`; siempre inactivo en DEV).
Solo cubre las rutas públicas: `/admin/*` sigue accesible en producción.

## CMS: cómo se agrega contenido editable

Patrón: **campos controlados + listas editables**. Nada de editor de bloques libre.

1. **Esquema (servidor):** sección y campos en `contenidos_schema()` de `public/api/config/contenidos.php`.
   Tipos: `email`, `telefono`, `whatsapp`, `url` (solo https), `texto` (una línea), `multilinea` (opcional `max_lineas`),
   `icono` (lista permitida), `slug`, `imagen` (nombre de un medio del `uso` indicado; vacío = imagen
   por defecto; si el archivo ya no existe, la API pública lo omite) y `lista` (min/max elementos, cada
   uno con sus propios campos; errores en `<campo>.<i>.<subcampo>`). Vacío = no mostrar. Campos desconocidos → 400.
2. **Tipos:** interfaz en `src/types/api.ts` y la sección en `ContenidoSeccion`.
3. **Respaldo:** valores por defecto en `src/lib/contenidos.ts`. El sitio **nunca** queda en blanco:
   si la API falla o la sección no se ha guardado, se muestra el respaldo.
4. **Sitio:** el componente lee con un hook de `src/lib/contenidos.ts` (react-query, clave `["contenido", seccion]`).
5. **Panel:** formulario con react-hook-form + zod que refleja las reglas del servidor (el servidor decide);
   al guardar, invalidar la clave de react-query. Roles: viewer solo lectura. Nueva sección → pestaña en `ContenidosTabs`.

**Inicio:** las tarjetas de especialidades enlazan a un servicio por slug; si ese servicio está oculto (o no existe),
la tarjeta no se muestra. Con la API caída se muestran todas las del respaldo.

**Nuestro Equipo:** sección `equipo`. Personas de 0 a 12 **sin respaldo** (las 4 de ejemplo eran falsas y se
eliminaron con sus fotos): sin personas, la cuadrícula se oculta y la página queda con encabezado, valores (1 a 6)
y llamada final. Foto con uso `retrato` (800 × 800, recortada, en círculo); sin foto, iniciales. LinkedIn y correo
solo se muestran si se cargan. "Restaurar textos originales" conserva las personas.

**Layout del panel:** `AdminLayout` usa `h-screen` y el `<main relative overflow-y-auto>` es el que hace scroll.
No volver a `min-h-screen`: la barra de guardado `sticky bottom-0` dejaría de quedar fija y el clic en
"Guardar" se pierde cuando aparece un error al salir del campo.

**Servicios:** el diseño no es libre. El panel elige ícono y tema de listas cerradas que deben ser
**idénticas** en `public/api/config/servicios.php` y en `src/lib/iconos.ts` / `src/lib/servicios.ts`.
Los temas usan clases Tailwind escritas completas (no construirlas con interpolación).
Si un servicio no tiene ícono, tema o contenido válidos guardados, se usa su respaldo (contenido original).
Los slugs no se editan desde el panel (son las URLs). Crear servicios nuevos aún no está soportado.
Cada servicio admite una foto de fondo opcional en `contenido_json.imagen`.

**Imágenes:** el panel sube con `CampoImagen` (uso `logo`, `favicon`, `compartir` o `foto`) y el contenido
guarda solo el nombre (`<uso>-<32 hex>.<ext>`; usos: también `retrato` para personas). Sección `identidad`: logo del menú (también en mantenimiento),
logo del pie, favicon e imagen al compartir. Sin imagen subida se conserva el marcado original (el sitio
queda idéntico). Favicon y vista previa al compartir salen de `/api/marca.php` porque esos lectores no ejecutan JS.

## Comandos de verificación

```powershell
npx tsc --noEmit          # debe salir con código 0
npm run build             # build a dist/
npx eslint .              # 0 errores (8 advertencias preexistentes de shadcn)
php -l <archivo.php>      # cada PHP creado o modificado
git diff --check; git status
```
Pruebas HTTP con `curl.exe` (no el alias `curl` de PowerShell) contra `http://localhost:8000/...`.

## Convenciones

- **Respuesta API:** `{ success, message, data?, errors? }` vía `json_response()` de `helpers.php`.
- **Errores:** detalle a `error_log()`; al cliente, mensaje genérico. 503 conexión BD, 500 SQL,
  405 método, 404 recurso, 400 validación con `errors` por campo. Capturar `PDOException` **antes** que `RuntimeException`.
- **Datos:** guardar texto íntegro (`trim`, validación). **No** aplicar `htmlspecialchars` antes de
  almacenar: el escape se hace al renderizar (React ya escapa).
- **SQL:** solo prepared statements. Castear enteros (`(int)`), nulos como `null`. Upserts portables
  (MySQL y MariaDB): `ON DUPLICATE KEY UPDATE col = :param_repetido`, sin `VALUES()` ni alias.
- **Migraciones:** `CREATE TABLE IF NOT EXISTS`, sin DROP, `COMMENT` en ASCII (sin tildes).
- **Tipos:** contrato nuevo → `src/types/api.ts`, reflejando exactamente el esquema SQL.
- **UI admin:** páginas dentro del `<Outlet />` de `AdminLayout`; siempre estados loading/empty/error/null;
  ante 401, avisar y llamar `checkSession()` (ProtectedRoute redirige al login).
- **Codificación:** todo archivo en **UTF-8 sin BOM** y LF (`.editorconfig`, `.gitattributes`).
  Un BOM antes de `<?php` rompe `declare(strict_types=1)`.

## Seguridad (no negociable)

- Sesión `GCALLS_SESSID`: HttpOnly, SameSite=Lax, Secure en HTTPS, idle 2 h (`gc_maxlifetime` = 7200),
  lifetime 8 h, `session_regenerate_id(true)` al iniciar sesión, cookie expirada al caducar.
- Roles `admin`, `editor`, `viewer`. Todo endpoint admin llama `require_auth([...])` antes de tocar la BD.
  Ocultar botones en React **no** es autorización.
- Toda operación mutativa (POST/PUT/PATCH/DELETE admin y logout) exige `X-CSRF-Token` → `validate_csrf_token()`.
- Nunca devolver `password_hash`; mensaje uniforme ante credenciales inválidas; rate limiting en login (pendiente H4).
- URLs editables desde el panel: solo `https://` (bloquea `javascript:` y similares).
- Imágenes: solo JPG, PNG y WebP detectados por contenido (**nunca SVG**), límites de peso, píxeles por lado
  y megapíxeles; se regeneran con GD (sin metadatos ni contenido oculto), nombre aleatorio, guardadas fuera
  de `public_html` y entregadas solo por `medio.php` con `nosniff` y CSP `sandbox`.
- Secretos solo en `.env` fuera del repo; usuario MySQL de producción con privilegios mínimos.
- CORS: orígenes `gcallssas.com` (+ www) y Vite local. En producción sitio y API comparten origen.
- Envío de correo (SMTP en PHP, H4): si falla, el lead ya persistido no se pierde ni se reporta error al visitante.

## Reglas sobre datos y entorno

- **Preservar los registros QA 7, 8 y 9 de `contactos_leads`.** No borrar ni limpiar datos sin autorización.
- Sin cambios de esquema, migraciones, seeds, creación de usuarios ni despliegues sin autorización expresa.
- Inspecciones de BD en modo solo lectura (`SHOW TABLES`, `SHOW CREATE TABLE`) salvo autorización.

## Flujo de trabajo

1. **Plan primero:** objetivo → plan con archivos a crear/modificar y fuera de alcance → esperar aprobación.
2. **Alcance estricto:** no tocar archivos fuera del plan. Sin dependencias nuevas sin aprobación.
3. **Ramas y PR:** `feat/<hito>-<tema>` o `fix/<tema>` → Pull Request a `main` con informe de pruebas.
   El desarrollador revisa y fusiona (fusionar = desplegar). Merge con "Create a merge commit".
4. **Verificar antes de reportar:** comandos de verificación + pruebas HTTP reales + E2E en navegador del bloque.
5. **Honestidad en pruebas:** "garantizado por diseño" no es una prueba ejecutada. Reportar cada
   prueba como aprobada / fallida / no ejecutada (con motivo).
6. **Commits pequeños** por bloque funcional.

## Estado de Core 1.0 <!-- actualizar al cerrar cada bloque -->

| Hito | Contenido | Estado |
|---|---|---|
| H0 Línea base | Auth real, CSRF, sesiones, CORS, codificación, retiro de legado (PR #1, `47bb001`, 22/11) | ✅ Cerrado |
| H1a CMS esencial | PR #2 contenidos globales (contacto, horario, redes, WhatsApp) · PR #3 servicios (plantilla única, edición, publicar/ocultar, selector en formulario) · PR #4 Inicio (banner y tarjetas) · PR #6 imágenes (identidad, banner, servicios) | ✅ Cerrado (#2–#6 fusionados, 22–23/11) |
| H1b CMS resto | PR #7 Nuestro Equipo · Quiénes Somos, Decálogo, Mercados, Qué Gestionamos | En revisión: PR #7 |
| H2 CRM de leads | CRUD, estados, responsables, notas, próximas acciones, historial, borrado solo admin | Pendiente |
| H3 Cotizaciones/PDF | Cotizaciones ligadas a leads, conceptos, cálculos, estados, PDF corporativo | Pendiente |
| H4 Calidad y producción | ~~PHP 8.3 en el hosting~~ (hecho 23/11) · BD y `.env` en el hosting, SMTP PHP, rate limiting, antispam, `.htaccess` SPA, backups, retiro de mantenimiento, manuales | Pendiente |
| H5 Automation 2.0 | n8n, IA, WhatsApp | Fuera de Core 1.0 |

BD local (22/11): estructura igual a `schema.sql` previo a H1a; 1 usuario admin; 6 servicios; 9 leads; 0 cotizaciones.
Producción (verificado 23/11, PHP 8.3): sin BD ni `.env` aún; la API responde 503 controlado ("No se pudo conectar
con la base de datos"); `marca.php` entrega favicon e imagen al compartir por defecto.

Pendientes menores detectados:
- Datos reales del cliente por cargar desde el panel (correo, teléfonos, dirección, horario, redes).
- Placeholder del login muestra el correo real del admin.
- Barra lateral del panel oculta en móvil (`hidden md:flex`): sin navegación en pantallas pequeñas.
- Etiqueta "PRÓXIMAMENTE" desbordada en la barra lateral; Dashboard con un segundo botón "Cerrar sesión".
- Footer: formulario de newsletter sin funcionalidad.
- Tarjetas de servicios en "¿Qué Gestionamos?" siguen fijas en el código (H1b).
- Inicio: la sección "Nuestros Aliados" (empresas, cifras y testimonios) se retiró por no ser real (PR #4).
  Volverá como sección editable cuando el cliente entregue datos reales y autorización de uso de logos y testimonios.
- Imágenes subidas que dejan de usarse no se borran (falta limpieza; sin impacto práctico por ahora).
- Leads: paginación/filtros (M-03), consulta redundante de `fecha_registro` tras INSERT (M-01).
