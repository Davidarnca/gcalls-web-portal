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
- **Producción:** Colombia Hosting (cPanel), dominio `gcallssas.com` <!-- verificar vigencia del plan -->.
  `.env` se lee desde `dirname(public/api/config, 3)`: en el hosting queda **fuera** de `public_html`.

## ⚠️ Despliegue automático

`.github/workflows/deploy.yml` hace build y sube `dist/` por FTP a `public_html/` **en cada push a `main`**.
Vite copia `public/` a `dist/`, así que **la API PHP (`public/api`) también se publica**.
**Push o merge a `main` = despliegue a producción.** Nunca hacerlo sin aprobación explícita.
Las migraciones de `migrations/` **no** se ejecutan solas: se corren a mano en cada base de datos.

Vercel (legado de una etapa anterior) se está retirando: no ejecuta PHP y sirve los `.php` como
descargas. No volver a conectarlo. El backend Node/Express de correo también se retiró.

## Entorno local (Windows + PowerShell)

- Repo: `C:\Proyectos\gcalls-web-portal`
- Frontend: `npm run dev` → http://localhost:8080
- API: `php -S localhost:8000 -t public/api` → http://localhost:8000
- Proxy Vite: `/api/*` → `localhost:8000` **quitando el prefijo `/api`**.
- MySQL: servicio Windows `MySQL267`, puerto 3306, base `gcalls_db`.
- Migraciones: `mysql -u root -p gcalls_db -e "source migrations/<archivo>.sql"` (no usar `Get-Content |`,
  PowerShell puede alterar la codificación).
- Mock de leads: `VITE_USE_MOCK_LEADS=true` usa `src/lib/api/admin-contactos.mock.ts`.

## Estructura clave

```
src/
  types/api.ts                 # Fuente única de verdad de contratos (Lead, ApiResponse, Contenido*...)
  lib/contenidos.ts            # CMS: valores de respaldo, useContenidoGlobal(), utilidades de enlaces
  lib/servicios.ts             # Servicios: temas de color, contenido de respaldo, useServicios()
  lib/iconos.ts                # Íconos permitidos (= SERVICIOS_ICONOS en PHP)
  lib/api/admin-servicios.ts   # Cliente de /api/admin/servicios.php
  lib/api/*.mock.ts            # Mocks DEV (import dinámico)
  contexts/AuthContext.tsx     # Sesión real contra /api/auth/*; usuario y csrfToken en memoria
  components/admin/            # AdminLayout, AdminSidebar, AdminNavbar, ProtectedRoute
  components/Mantenimiento.tsx # Pantalla de mantenimiento
  pages/                       # Páginas públicas
  pages/ServicioDetalle.tsx    # Plantilla única de /servicios/:slug (inactivo o inexistente → 404)
  pages/admin/                 # Login, Dashboard, Contactos (leads), Contenidos, Servicios, ServicioEditar
public/api/
  config/env.php               # Carga .env
  config/db.php                # get_db_connection() singleton
  config/helpers.php           # json_response(), get_json_input() — mantener pequeño
  config/auth.php              # start_secure_session, check_auth, require_auth, validate_csrf_token, destroy_session
  config/cors.php              # Lista blanca de orígenes + X-CSRF-Token
  config/contenidos.php        # CMS: esquema de secciones, validar_contenido(), obtener_contenido()
  config/servicios.php         # Íconos y temas permitidos, validar_servicio_patch(), servicio_desde_fila()
  auth/{login,logout,me}.php
  contactos.php                # POST público del formulario
  contenidos.php               # GET público ?seccion=
  servicios.php                # GET público: servicios activos
  admin/contactos.php          # GET leads con servicio_titulo (admin, editor), LIMIT 200
  admin/contenidos.php         # GET (admin, editor, viewer) / PUT con CSRF (admin, editor) ?seccion=
  admin/servicios.php          # GET todos / PATCH ?id= parcial con CSRF (activo, titulo, icono, tema, contenido)
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
   Tipos: `email`, `telefono`, `whatsapp`, `url` (solo https), `texto` (una línea), `multilinea`.
   Todos son texto; vacío = no mostrar. Campos desconocidos → 400.
2. **Tipos:** interfaz en `src/types/api.ts` y la sección en `ContenidoSeccion`.
3. **Respaldo:** valores por defecto en `src/lib/contenidos.ts`. El sitio **nunca** queda en blanco:
   si la API falla o la sección no se ha guardado, se muestra el respaldo.
4. **Sitio:** el componente lee con un hook de `src/lib/contenidos.ts` (react-query, clave `["contenido", seccion]`).
5. **Panel:** formulario con react-hook-form + zod que refleja las reglas del servidor (el servidor decide);
   al guardar, invalidar la clave de react-query. Roles: viewer solo lectura.

**Servicios:** el diseño no es libre. El panel elige ícono y tema de listas cerradas que deben ser
**idénticas** en `public/api/config/servicios.php` y en `src/lib/iconos.ts` / `src/lib/servicios.ts`.
Los temas usan clases Tailwind escritas completas (no construirlas con interpolación).
Si un servicio no tiene ícono, tema o contenido válidos guardados, se usa su respaldo (contenido original).
Los slugs no se editan desde el panel (son las URLs). Crear servicios nuevos aún no está soportado.

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
| H1a CMS esencial | PR #2 contenidos globales (contacto, horario, redes, WhatsApp) · PR #3 servicios (plantilla única, edición, publicar/ocultar, selector en formulario) · PR #4 Inicio (banner y tarjetas) · PR #5 imágenes | En revisión: PR #2 y PR #3 |
| H1b CMS resto | Quiénes Somos, Nuestro Equipo, Decálogo, Mercados, Qué Gestionamos | Pendiente |
| H2 CRM de leads | CRUD, estados, responsables, notas, próximas acciones, historial, borrado solo admin | Pendiente |
| H3 Cotizaciones/PDF | Cotizaciones ligadas a leads, conceptos, cálculos, estados, PDF corporativo | Pendiente |
| H4 Calidad y producción | BD y `.env` en el hosting, SMTP PHP, rate limiting, antispam, `.htaccess` SPA, backups, retiro de mantenimiento, manuales | Pendiente |
| H5 Automation 2.0 | n8n, IA, WhatsApp | Fuera de Core 1.0 |

BD local (22/11): estructura igual a `schema.sql` previo a H1a; 1 usuario admin; 6 servicios; 9 leads; 0 cotizaciones.
Producción: sin BD ni `.env` configurados aún; el panel responde 503 controlado.

Pendientes menores detectados:
- Datos reales del cliente por cargar desde el panel (correo, teléfonos, dirección, horario, redes).
- Placeholder del login muestra el correo real del admin.
- Barra lateral del panel oculta en móvil (`hidden md:flex`): sin navegación en pantallas pequeñas.
- Etiqueta "PRÓXIMAMENTE" desbordada en la barra lateral; Dashboard con un segundo botón "Cerrar sesión".
- Footer: formulario de newsletter sin funcionalidad.
- Tarjetas de servicios en Inicio y en "¿Qué Gestionamos?" siguen fijas en el código (PR #4 / H1b).
- La página de servicio tipo marca usa una imagen de Unsplash enlazada externamente (conviene alojarla).
- Leads: paginación/filtros (M-03), consulta redundante de `fecha_registro` tras INSERT (M-01).
