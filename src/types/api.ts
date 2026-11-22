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
// Campos definidos en public/api/config/contenidos.php. Todos son texto; vacío = no mostrar.

export type ContenidoSeccion = 'global';

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
