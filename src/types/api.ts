/**
 * G-Calls S.A.S. — Tipos centralizados de la API REST
 *
 * Centraliza los contratos de datos compartidos entre el frontend
 * y el backend PHP. Importar desde aquí en lugar de desde
 * componentes específicos cuando se necesiten en múltiples lugares.
 */

// ── Formulario público (payload de envío) ────────────────────────────────────
// Refleja los campos que acepta POST /api/contactos.php
export interface ContactoPayload {
  nombre: string;
  email: string;
  empresa: string;
  telefono: string;
  mensaje: string;
  servicio_interes?: number;
}

// ── Respuesta genérica de la API ─────────────────────────────────────────────
// Estructura estándar { success, message, data?, errors? }
export interface ApiResponse<T = unknown> {
  success: boolean;
  message: string;
  data?: T;
  errors?: Record<string, string>;
}

// ── Estado del pipeline CRM ──────────────────────────────────────────────────
// Refleja exactamente el ENUM de contactos_leads.estado en MySQL
export type LeadEstado =
  | 'nuevo'
  | 'en_seguimiento'
  | 'cotizado'
  | 'ganado'
  | 'perdido'
  | 'spam';

// ── Lead: registro almacenado (lectura administrativa) ───────────────────────
// Representa una fila de contactos_leads tal como la devuelve
// GET /api/admin/contactos.php — distinto a ContactoPayload (escritura)
export interface Lead {
  id: number;                       // INT UNSIGNED NOT NULL AUTO_INCREMENT
  nombre: string;                   // VARCHAR(120) NOT NULL
  empresa: string | null;           // VARCHAR(180) DEFAULT NULL
  email: string;                    // VARCHAR(180) NOT NULL
  telefono: string | null;          // VARCHAR(30) DEFAULT NULL
  servicio_interes: number | null;  // INT UNSIGNED DEFAULT NULL (FK)
  servicio_titulo: string | null;   // título del servicio (LEFT JOIN); null si no hay servicio
  mensaje: string | null;           // TEXT DEFAULT NULL
  estado: LeadEstado;               // ENUM NOT NULL DEFAULT 'nuevo'
  fecha_registro: string;           // DATETIME → 'YYYY-MM-DD HH:MM:SS'
}

// ── Respuesta del GET /api/admin/contactos.php ───────────────────────────────
export interface LeadsListResponse {
  success: boolean;
  message: string;
  data?: {
    leads: Lead[];
    total: number;   // número de registros devueltos (= leads.length en v1)
  };
}

// ── Tipos de Autenticación y Sesiones Administrativas ────────────────────────
// Reflejan exactamente los contratos devueltos por:
// - POST /api/auth/login.php
// - GET  /api/auth/me.php
// - POST /api/auth/logout.php
export type UserRol = 'admin' | 'editor' | 'viewer';

export interface AuthUser {
  id: number;
  nombre: string;
  email: string;
  rol: UserRol;
}

export interface AuthResponseData {
  user: AuthUser;
  csrf_token: string;
}

export type AuthResponse = ApiResponse<AuthResponseData>;

export type LogoutResponse = ApiResponse<never>;


// ── CMS: contenidos editables (tabla `contenidos`) ────────────────────────────
// Campos definidos en public/api/config/contenidos.php. Todos son texto; vacío = no mostrar
// (en las imágenes, vacío = imagen por defecto).

export type ContenidoSeccion = 'global' | 'inicio' | 'identidad' | 'equipo' | 'quienes_somos' | 'decalogo';

/** Usos de imagen aceptados por /api/admin/medios.php (definen tamaño y formato) */
export type UsoImagen = 'logo' | 'favicon' | 'compartir' | 'foto' | 'retrato';

/** POST /api/admin/medios.php */
export interface MedioSubido {
  /** Nombre que se guarda en el contenido, ej. foto-<32 hex>.webp */
  archivo: string;
  ancho: number;
  alto: number;
  bytes: number;
}

export type MedioSubidoResponse = ApiResponse<MedioSubido>;

/** Sección `identidad`: logos e imágenes de marca. Vacío = la imagen original del sitio. */
export interface ContenidoIdentidad {
  /** Logo del menú superior y de la pantalla de mantenimiento (uso logo) */
  logo: string;
  /** Logo del pie de página (uso logo) */
  logo_pie: string;
  /** Ícono de la pestaña del navegador (uso favicon) */
  favicon: string;
  /** Vista previa al compartir el sitio en WhatsApp o redes (uso compartir) */
  compartir: string;
}

export interface ContenidoGlobal {
  email: string;
  telefono: string;
  telefono_secundario: string;
  /** Solo dígitos con indicativo de país, ej. 573201234567 */
  whatsapp: string;
  direccion: string;
  ciudad: string;
  /** Una línea por renglón del horario */
  horario: string;
  linkedin: string;
  facebook: string;
  instagram: string;
}

export interface EspecialidadInicio {
  titulo: string;
  descripcion: string;
  /** Nombre de ícono de la lista permitida */
  icono: string;
  /** Slug del servicio al que enlaza la tarjeta */
  servicio: string;
}

/** Sección `inicio`: banner, especialidades y llamada final de la página de inicio */
export interface ContenidoInicio {
  /** Foto de fondo del banner (uso foto). Vacío = solo el degradado de marca */
  hero_imagen: string;
  hero_antetitulo: string;
  hero_titulo: string;
  hero_titulo_destacado: string;
  hero_descripcion: string;
  hero_boton_principal: string;
  hero_boton_secundario: string;
  especialidades_titulo: string;
  especialidades_destacado: string;
  especialidades_descripcion: string;
  especialidades: EspecialidadInicio[];
  cta_titulo: string;
  cta_descripcion: string;
  cta_boton: string;
}

export interface MiembroEquipo {
  nombre: string;
  cargo: string;
  descripcion: string;
  /** Una especialidad por línea (máximo 6) */
  especialidades: string;
  /** Foto (uso retrato). Vacío = iniciales del nombre */
  foto: string;
  /** https://… o vacío (no se muestra el ícono) */
  linkedin: string;
  /** Correo o vacío (no se muestra el ícono) */
  email: string;
}

export interface ValorEquipo {
  /** Nombre de ícono de la lista permitida */
  icono: string;
  titulo: string;
  descripcion: string;
}

/** Sección `equipo`: página Nuestro Equipo. Sin miembros, la cuadrícula no se muestra. */
export interface ContenidoEquipo {
  encabezado_antetitulo: string;
  encabezado_titulo: string;
  encabezado_destacado: string;
  encabezado_descripcion: string;
  miembros: MiembroEquipo[];
  valores_titulo: string;
  valores_descripcion: string;
  valores: ValorEquipo[];
  cta_titulo: string;
  cta_descripcion: string;
  cta_boton: string;
}

export interface PasoMetodo {
  titulo: string;
  descripcion: string;
}

/** Sección `quienes_somos`: misión, visión y método. Texto vacío = esa tarjeta no se muestra. */
export interface ContenidoQuienesSomos {
  encabezado_titulo: string;
  encabezado_descripcion: string;
  mision_titulo: string;
  mision: string;
  vision_titulo: string;
  vision: string;
  valor_titulo: string;
  /** Una línea por renglón; el sitio las muestra tal cual (con «• » si se escribe) */
  valor: string;
  metodo_titulo: string;
  /** El sitio numera los pasos automáticamente */
  pasos: PasoMetodo[];
}

export interface PrincipioDecalogo {
  titulo: string;
  descripcion: string;
}

/** Sección `decalogo`: principios numerados y propuesta de valor */
export interface ContenidoDecalogo {
  encabezado_titulo: string;
  encabezado_destacado: string;
  encabezado_descripcion: string;
  principios: PrincipioDecalogo[];
  boton_ver_todos: string;
  propuesta_titulo: string;
  propuesta_texto: string;
}

/** GET /api/contenidos.php — `datos` puede venir parcial o vacío si nunca se guardó */
export interface ContenidoPublicoData<T> {
  seccion: ContenidoSeccion;
  datos: Partial<T>;
  actualizado_en: string | null;
}

/** GET/PUT /api/admin/contenidos.php */
export interface ContenidoAdminData<T> extends ContenidoPublicoData<T> {
  actualizado_por: string | null;
}

export type ContenidoPublicoResponse<T> = ApiResponse<ContenidoPublicoData<T>>;
export type ContenidoAdminResponse<T> = ApiResponse<ContenidoAdminData<T>>;

// ── Catálogo de servicios (tabla `servicios`) ─────────────────────────────────
// Listas permitidas en public/api/config/servicios.php (iguales en src/lib/iconos.ts y src/lib/servicios.ts)

export type ServicioTema = 'marca' | 'esmeralda' | 'naranja' | 'cian' | 'violeta' | 'azul';

export interface ServicioTarjeta {
  titulo: string;
  /** Nombre de ícono de la lista permitida */
  icono: string;
  items: string[];
}

export interface ServicioContenido {
  descripcion: string;
  tarjetas: ServicioTarjeta[];
  /** Foto de fondo del encabezado (uso foto). Ausente = sin foto */
  imagen?: string;
}

/** Servicio tal como lo entrega la API. null = usar respaldo del frontend. */
export interface ServicioApi {
  id: number;
  slug: string;
  titulo: string;
  icono: string | null;
  tema: ServicioTema | null;
  contenido: ServicioContenido | null;
}

/** En el panel también llega el estado de publicación */
export interface ServicioAdminApi extends ServicioApi {
  activo: boolean;
}

export type ServiciosPublicoResponse = ApiResponse<{ servicios: ServicioApi[] }>;
export type ServiciosAdminResponse = ApiResponse<{ servicios: ServicioAdminApi[] }>;
export type ServicioAdminResponse = ApiResponse<{ servicio: ServicioAdminApi }>;

/** PATCH /api/admin/servicios.php?id= */
export type ServicioPatch = Partial<{
  activo: boolean;
  titulo: string;
  icono: string;
  tema: ServicioTema;
  contenido: ServicioContenido;
}>;
