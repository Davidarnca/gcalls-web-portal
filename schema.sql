-- =============================================================================
-- G-Calls S.A.S. -- Schema inicial de base de datos
-- Fase 1: Backend -- Tablas principales
--
-- Motor:        MySQL 8.0+ (compatible con MySQL 5.7 excepto donde se indique)
-- Codificacion: utf8mb4 / utf8mb4_unicode_ci  (soporte completo Unicode + emojis)
-- Idempotente:  Si -- seguro de ejecutar multiples veces sin errores
--
-- Orden de creacion (respeta dependencias FK):
--   1. usuarios
--   2. servicios
--   3. contactos_leads
--   4. cotizaciones
-- =============================================================================

-- Selecciona (o crea) la base de datos del proyecto.
-- Ajusta el nombre si tu entorno usa otro identificador.
CREATE DATABASE IF NOT EXISTS gcalls_db
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE gcalls_db;

-- Deshabilita FK checks temporalmente para re-ejecuciones seguras
SET FOREIGN_KEY_CHECKS = 0;


-- =============================================================================
-- TABLA 1: usuarios
-- Almacena las cuentas de acceso al panel administrativo de G-Calls.
-- El campo `rol` controla permisos (admin, editor, viewer, etc.)
-- =============================================================================
CREATE TABLE IF NOT EXISTS usuarios (
  id            INT UNSIGNED     NOT NULL AUTO_INCREMENT COMMENT 'Identificador unico del usuario',
  nombre        VARCHAR(120)     NOT NULL                COMMENT 'Nombre completo del usuario',
  email         VARCHAR(180)     NOT NULL                COMMENT 'Direccion de correo electronico (usada como login)',
  password_hash VARCHAR(255)     NOT NULL                COMMENT 'Hash bcrypt/argon2 de la contrasena -- NUNCA almacenar texto plano',
  rol           ENUM(
                  'admin',
                  'editor',
                  'viewer'
                ) NOT NULL DEFAULT 'viewer'              COMMENT 'Rol de acceso: admin=acceso total, editor=contenido y leads, viewer=solo lectura',
  creado_en     DATETIME         NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT 'Fecha y hora de creacion del registro',

  -- Clave primaria
  PRIMARY KEY (id),

  -- El email identifica univocamente a cada usuario
  UNIQUE KEY uq_usuarios_email (email)

) ENGINE=InnoDB
  DEFAULT CHARSET=utf8mb4
  COLLATE=utf8mb4_unicode_ci
  COMMENT='Cuentas de acceso al portal administrativo de G-Calls';

-- Indice: busqueda por rol para listar usuarios por tipo de acceso
-- CREATE INDEX IF NOT EXISTS requiere MySQL 8.0.29+
-- En MySQL 5.7 usa: ALTER TABLE usuarios ADD INDEX IF NOT EXISTS idx_usuarios_rol (rol);
CREATE INDEX IF NOT EXISTS idx_usuarios_rol
  ON usuarios (rol);


-- =============================================================================
-- TABLA 2: servicios
-- Catalogo de servicios ofrecidos por G-Calls S.A.S.
-- `contenido_json` permite almacenar bloques de contenido ricos (secciones,
--  bullet points, casos de uso) sin necesidad de columnas adicionales.
-- =============================================================================
CREATE TABLE IF NOT EXISTS servicios (
  id                INT UNSIGNED  NOT NULL AUTO_INCREMENT COMMENT 'Identificador unico del servicio',
  slug              VARCHAR(100)  NOT NULL                COMMENT 'URL amigable -- ej: call-center-outbound',
  titulo            VARCHAR(200)  NOT NULL                COMMENT 'Nombre visible del servicio',
  descripcion_corta VARCHAR(500)  NOT NULL DEFAULT ''     COMMENT 'Resumen breve para tarjetas y meta-descripciones SEO',

  -- JSON nativo (MySQL 5.7.8+). Almacena secciones, bullets, FAQs, etc.
  -- Ejemplo: {"secciones": [...], "beneficios": [...], "casos_de_uso": [...]}
  contenido_json    JSON                                  COMMENT 'Contenido estructurado completo del servicio (secciones, beneficios, FAQs)',

  -- Color en formato HEX o CSS custom property -- ej: "#FF6B35"
  color_accent      VARCHAR(50)   NOT NULL DEFAULT '#0057B7' COMMENT 'Color de acento para la UI del servicio (HEX o CSS var)',

  -- Nombre de icono (heroicon slug, FontAwesome class, nombre SVG propio)
  icono             VARCHAR(100)  NOT NULL DEFAULT ''     COMMENT 'Identificador del icono del servicio',

  activo            TINYINT(1)    NOT NULL DEFAULT 1      COMMENT '1 = visible en el portal; 0 = oculto/borrador',

  -- Clave primaria
  PRIMARY KEY (id),

  -- El slug debe ser unico para enrutar correctamente las URLs del portal
  UNIQUE KEY uq_servicios_slug (slug)

) ENGINE=InnoDB
  DEFAULT CHARSET=utf8mb4
  COLLATE=utf8mb4_unicode_ci
  COMMENT='Catalogo de servicios publicados en el portal de G-Calls';

-- Indice: filtrar servicios activos es la query mas frecuente en el portal publico
CREATE INDEX IF NOT EXISTS idx_servicios_activo
  ON servicios (activo);

-- Indice: busqueda por titulo (util en buscadores internos del panel admin)
CREATE INDEX IF NOT EXISTS idx_servicios_titulo
  ON servicios (titulo);


-- =============================================================================
-- TABLA 3: contactos_leads
-- Registra cada solicitud de contacto o prospecto capturado desde el portal.
-- El campo `estado` permite gestionar el ciclo de vida del lead en el CRM.
-- =============================================================================
CREATE TABLE IF NOT EXISTS contactos_leads (
  id               INT UNSIGNED   NOT NULL AUTO_INCREMENT COMMENT 'Identificador unico del lead',
  nombre           VARCHAR(120)   NOT NULL                COMMENT 'Nombre completo del prospecto',
  empresa          VARCHAR(180)            DEFAULT NULL   COMMENT 'Empresa u organizacion del prospecto (opcional)',
  email            VARCHAR(180)   NOT NULL                COMMENT 'Correo electronico de contacto',
  telefono         VARCHAR(30)             DEFAULT NULL   COMMENT 'Telefono de contacto incluyendo codigo de pais -- ej: +57 300 1234567',

  -- FK a servicios.id -- puede ser NULL si el lead no especifico servicio
  servicio_interes INT UNSIGNED            DEFAULT NULL   COMMENT 'Servicio por el que pregunta el lead (FK a servicios.id)',

  mensaje          TEXT                    DEFAULT NULL   COMMENT 'Mensaje libre enviado por el prospecto',

  estado           ENUM(
                     'nuevo',
                     'en_seguimiento',
                     'cotizado',
                     'ganado',
                     'perdido',
                     'spam'
                   ) NOT NULL DEFAULT 'nuevo'             COMMENT 'Estado en pipeline: nuevo, en_seguimiento, cotizado, ganado, perdido, spam',

  fecha_registro   DATETIME       NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT 'Timestamp de creacion automatico al recibir el lead',

  -- Clave primaria
  PRIMARY KEY (id),

  -- Clave foranea: si se elimina el servicio, el lead queda con NULL (preserva historial)
  CONSTRAINT fk_leads_servicio
    FOREIGN KEY (servicio_interes)
    REFERENCES servicios (id)
    ON DELETE SET NULL
    ON UPDATE CASCADE

) ENGINE=InnoDB
  DEFAULT CHARSET=utf8mb4
  COLLATE=utf8mb4_unicode_ci
  COMMENT='Prospectos y solicitudes de contacto captados por el portal';

-- Indice: filtrar leads por estado es la operacion principal del pipeline CRM
CREATE INDEX IF NOT EXISTS idx_leads_estado
  ON contactos_leads (estado);

-- Indice: buscar leads de un servicio especifico
CREATE INDEX IF NOT EXISTS idx_leads_servicio_interes
  ON contactos_leads (servicio_interes);

-- Indice: ordenar y filtrar por fecha de registro (reportes, dashboards)
CREATE INDEX IF NOT EXISTS idx_leads_fecha_registro
  ON contactos_leads (fecha_registro);

-- Indice: busqueda de leads por email (deduplicacion, historial de cliente)
CREATE INDEX IF NOT EXISTS idx_leads_email
  ON contactos_leads (email);


-- =============================================================================
-- TABLA 4: cotizaciones
-- Propuestas economicas generadas a partir de un lead calificado.
-- `datos_json` almacena el detalle de items, tarifas y condiciones comerciales.
-- =============================================================================
CREATE TABLE IF NOT EXISTS cotizaciones (
  id                INT UNSIGNED      NOT NULL AUTO_INCREMENT COMMENT 'Identificador unico de la cotizacion',

  -- FK obligatoria: toda cotizacion debe estar asociada a un lead
  lead_id           INT UNSIGNED      NOT NULL                COMMENT 'Lead al que pertenece esta cotizacion (FK a contactos_leads.id)',

  -- Codigo legible por humanos -- ej: COT-2024-00042
  -- Generado en la capa de aplicacion (API) antes de insertar
  codigo_cotizacion VARCHAR(50)       NOT NULL                COMMENT 'Codigo unico y legible de la cotizacion -- ej: COT-2024-00001',

  -- Total en pesos colombianos (COP). DECIMAL(15,2) soporta hasta ~999 billones
  total             DECIMAL(15, 2)    NOT NULL DEFAULT 0.00   COMMENT 'Valor total de la cotizacion en COP',

  -- JSON con el desglose: lineas de item, tarifas, descuentos, condiciones, etc.
  -- Ejemplo: {"items": [{"desc": "Call Center 50 posiciones", "valor": 5000000}], "vigencia_dias": 30}
  datos_json        JSON                                      COMMENT 'Detalle completo de items, tarifas y condiciones comerciales',

  estado            ENUM(
                      'borrador',
                      'enviada',
                      'aceptada',
                      'rechazada',
                      'vencida'
                    ) NOT NULL DEFAULT 'borrador'             COMMENT 'Estado: borrador, enviada, aceptada, rechazada, vencida',

  fecha_creacion    DATETIME          NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT 'Timestamp de creacion de la cotizacion',

  -- Clave primaria
  PRIMARY KEY (id),

  -- El codigo de cotizacion debe ser globalmente unico para referencias externas
  UNIQUE KEY uq_cotizaciones_codigo (codigo_cotizacion),

  -- Clave foranea: si se elimina un lead, sus cotizaciones se eliminan en cascada.
  -- Cambia a ON DELETE RESTRICT si prefieres preservar el historial de cotizaciones.
  CONSTRAINT fk_cotizaciones_lead
    FOREIGN KEY (lead_id)
    REFERENCES contactos_leads (id)
    ON DELETE CASCADE
    ON UPDATE CASCADE

) ENGINE=InnoDB
  DEFAULT CHARSET=utf8mb4
  COLLATE=utf8mb4_unicode_ci
  COMMENT='Propuestas economicas formales generadas para leads calificados';

-- Indice: obtener todas las cotizaciones de un lead (relacion 1:N frecuente)
CREATE INDEX IF NOT EXISTS idx_cotizaciones_lead_id
  ON cotizaciones (lead_id);

-- Indice: filtrar cotizaciones por estado (pipeline comercial y reportes)
CREATE INDEX IF NOT EXISTS idx_cotizaciones_estado
  ON cotizaciones (estado);

-- Indice: ordenar por fecha de creacion en dashboards y exportaciones
CREATE INDEX IF NOT EXISTS idx_cotizaciones_fecha_creacion
  ON cotizaciones (fecha_creacion);


-- =============================================================================
-- Re-habilita la verificacion de claves foraneas
-- =============================================================================
SET FOREIGN_KEY_CHECKS = 1;


-- =============================================================================
-- VERIFICACION RAPIDA (opcional -- ejecutar manualmente para confirmar estructura)
-- =============================================================================
-- SHOW TABLES;
-- DESCRIBE usuarios;
-- DESCRIBE servicios;
-- DESCRIBE contactos_leads;
-- DESCRIBE cotizaciones;
-- SHOW CREATE TABLE cotizaciones\G
-- =============================================================================
-- FIN DEL SCRIPT -- G-Calls S.A.S. Fase 1 Backend
-- =============================================================================
