-- =============================================================================
-- G-Calls S.A.S. -- Schema inicial de base de datos
-- Fase 1: Backend -- Tablas principales
--
-- Motor:        MySQL 8.0.29+ (requerido -- ver PREREQUISITO a continuacion)
-- Codificacion: utf8mb4 / utf8mb4_unicode_ci  (soporte completo Unicode + emojis)
-- Idempotente:  Si -- seguro de ejecutar multiples veces sin errores
--
-- Orden de creacion (respeta dependencias FK):
--   1. usuarios
--   2. servicios
--   3. contactos_leads
--   4. cotizaciones
--
-- =============================================================================
-- PREREQUISITO OBLIGATORIO
-- =============================================================================
-- Antes de ejecutar SOURCE schema.sql, verificar la version real del servidor:
--
--   SELECT VERSION();
--
-- El resultado debe ser >= 8.0.29.
-- CREATE PROCEDURE IF NOT EXISTS fue introducido en MySQL 8.0.29.
-- Si la version es inferior, NO ejecutar este script sin revision previa del plan.
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


-- =============================================================================
-- TABLA: contenidos  (H1a — migrations/2026-11-22_h1a_contenidos.sql)
-- =============================================================================
-- Contenido editable del sitio publico desde el panel, una fila por seccion.
-- Los campos permitidos y su validacion viven en public/api/config/contenidos.php.
-- Sin datos iniciales: el sitio usa valores de respaldo hasta el primer guardado.
-- =============================================================================
CREATE TABLE IF NOT EXISTS contenidos (
  seccion         VARCHAR(50)   NOT NULL                COMMENT 'Clave de la seccion editable -- ej: global',
  datos           JSON          NOT NULL                COMMENT 'Contenido validado de la seccion',
  actualizado_en  DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
                                                        COMMENT 'Fecha y hora de la ultima edicion',
  actualizado_por INT UNSIGNED  NULL DEFAULT NULL       COMMENT 'Usuario que hizo la ultima edicion (FK a usuarios.id)',

  PRIMARY KEY (seccion),

  CONSTRAINT fk_contenidos_usuario
    FOREIGN KEY (actualizado_por)
    REFERENCES usuarios (id)
    ON DELETE SET NULL
    ON UPDATE CASCADE

) ENGINE=InnoDB
  DEFAULT CHARSET=utf8mb4
  COLLATE=utf8mb4_unicode_ci
  COMMENT='Contenido editable del sitio publico, una fila por seccion';


-- =============================================================================
-- PROCEDIMIENTO AUXILIAR: gcalls_add_index
-- =============================================================================
-- Crea un indice solo si no existe, consultando information_schema.STATISTICS.
-- No modifica ni elimina tablas, datos ni indices existentes.
-- No ejecuta ninguna operacion DROP.
--
-- CREATE PROCEDURE IF NOT EXISTS garantiza idempotencia:
--   - Primera ejecucion: crea el procedimiento y lo llama 10 veces.
--   - Segunda ejecucion: IF NOT EXISTS omite la creacion; CALL usa la
--     definicion existente, que sigue siendo valida porque el cuerpo es
--     un utilitario generico y parametrico sin logica dependiente del schema.
--
-- NOTA IMPORTANTE: si en el futuro el cuerpo del procedimiento necesitara
-- cambiar, CREATE PROCEDURE IF NOT EXISTS NO actualizaria la definicion
-- existente. En ese caso se requiere intervencion manual del operador:
--   SHOW CREATE PROCEDURE gcalls_add_index;
-- El procedimiento permanece en la BD de forma intencional (prefijo gcalls_).
-- =============================================================================

DELIMITER $$

CREATE PROCEDURE IF NOT EXISTS gcalls_add_index(
    IN p_schema  VARCHAR(64),
    IN p_table   VARCHAR(64),
    IN p_index   VARCHAR(64),
    IN p_ddl     TEXT
)
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM   information_schema.STATISTICS
        WHERE  TABLE_SCHEMA = p_schema
          AND  TABLE_NAME   = p_table
          AND  INDEX_NAME   = p_index
    ) THEN
        SET @gcalls_ddl = p_ddl;
        PREPARE gcalls_stmt FROM @gcalls_ddl;
        EXECUTE gcalls_stmt;
        DEALLOCATE PREPARE gcalls_stmt;
    END IF;
END$$

DELIMITER ;


-- =============================================================================
-- INDICES CONDICIONALES (10 en total)
-- Cada CALL verifica information_schema.STATISTICS antes de crear el indice.
-- Si el indice ya existe, lo omite silenciosamente. Sin DROP. Sin error.
-- =============================================================================

-- TABLA 1: usuarios
-- Indice: busqueda por rol para listar usuarios por tipo de acceso
CALL gcalls_add_index(
    'gcalls_db', 'usuarios', 'idx_usuarios_rol',
    'CREATE INDEX idx_usuarios_rol ON usuarios (rol)'
);

-- TABLA 2: servicios
-- Indice: filtrar servicios activos es la query mas frecuente en el portal publico
CALL gcalls_add_index(
    'gcalls_db', 'servicios', 'idx_servicios_activo',
    'CREATE INDEX idx_servicios_activo ON servicios (activo)'
);

-- Indice: busqueda por titulo (util en buscadores internos del panel admin)
CALL gcalls_add_index(
    'gcalls_db', 'servicios', 'idx_servicios_titulo',
    'CREATE INDEX idx_servicios_titulo ON servicios (titulo)'
);

-- TABLA 3: contactos_leads
-- Indice: filtrar leads por estado es la operacion principal del pipeline CRM
CALL gcalls_add_index(
    'gcalls_db', 'contactos_leads', 'idx_leads_estado',
    'CREATE INDEX idx_leads_estado ON contactos_leads (estado)'
);

-- Indice: buscar leads de un servicio especifico
CALL gcalls_add_index(
    'gcalls_db', 'contactos_leads', 'idx_leads_servicio_interes',
    'CREATE INDEX idx_leads_servicio_interes ON contactos_leads (servicio_interes)'
);

-- Indice: ordenar y filtrar por fecha de registro (reportes, dashboards)
CALL gcalls_add_index(
    'gcalls_db', 'contactos_leads', 'idx_leads_fecha_registro',
    'CREATE INDEX idx_leads_fecha_registro ON contactos_leads (fecha_registro)'
);

-- Indice: busqueda de leads por email (deduplicacion, historial de cliente)
CALL gcalls_add_index(
    'gcalls_db', 'contactos_leads', 'idx_leads_email',
    'CREATE INDEX idx_leads_email ON contactos_leads (email)'
);

-- TABLA 4: cotizaciones
-- Indice: obtener todas las cotizaciones de un lead (relacion 1:N frecuente)
CALL gcalls_add_index(
    'gcalls_db', 'cotizaciones', 'idx_cotizaciones_lead_id',
    'CREATE INDEX idx_cotizaciones_lead_id ON cotizaciones (lead_id)'
);

-- Indice: filtrar cotizaciones por estado (pipeline comercial y reportes)
CALL gcalls_add_index(
    'gcalls_db', 'cotizaciones', 'idx_cotizaciones_estado',
    'CREATE INDEX idx_cotizaciones_estado ON cotizaciones (estado)'
);

-- Indice: ordenar por fecha de creacion en dashboards y exportaciones
CALL gcalls_add_index(
    'gcalls_db', 'cotizaciones', 'idx_cotizaciones_fecha_creacion',
    'CREATE INDEX idx_cotizaciones_fecha_creacion ON cotizaciones (fecha_creacion)'
);


-- =============================================================================
-- Re-habilita la verificacion de claves foraneas
-- =============================================================================
SET FOREIGN_KEY_CHECKS = 1;


-- =============================================================================
-- VERIFICACION PREVIA (ejecutar ANTES de SOURCE schema.sql)
-- =============================================================================
-- SELECT VERSION();
-- -- Confirmar que el resultado es >= 8.0.29 antes de continuar.
--
-- SHOW TABLES IN gcalls_db;
-- -- Esperado actual: solo 'usuarios'
--
-- SHOW INDEX FROM usuarios;
-- -- Esperado actual: PRIMARY, uq_usuarios_email
-- -- Confirmar ausencia de idx_usuarios_rol
-- =============================================================================

-- =============================================================================
-- VERIFICACION POSTERIOR (ejecutar DESPUES de SOURCE schema.sql)
-- =============================================================================
-- SHOW TABLES;
-- -- Esperado: usuarios, servicios, contactos_leads, cotizaciones
--
-- SHOW INDEX FROM usuarios;
-- -- Esperado: PRIMARY, uq_usuarios_email, idx_usuarios_rol
--
-- SHOW INDEX FROM servicios;
-- -- Esperado: PRIMARY, uq_servicios_slug, idx_servicios_activo, idx_servicios_titulo
--
-- SHOW INDEX FROM contactos_leads;
-- -- Esperado: PRIMARY, fk_leads_servicio (implicito InnoDB),
-- --           idx_leads_estado, idx_leads_servicio_interes,
-- --           idx_leads_fecha_registro, idx_leads_email
--
-- SHOW INDEX FROM cotizaciones;
-- -- Esperado: PRIMARY, uq_cotizaciones_codigo, fk_cotizaciones_lead (implicito),
-- --           idx_cotizaciones_lead_id, idx_cotizaciones_estado,
-- --           idx_cotizaciones_fecha_creacion
--
-- SELECT TABLE_NAME, CONSTRAINT_NAME, CONSTRAINT_TYPE
-- FROM information_schema.TABLE_CONSTRAINTS
-- WHERE TABLE_SCHEMA = 'gcalls_db'
-- ORDER BY TABLE_NAME, CONSTRAINT_TYPE;
-- -- Esperado FKs: fk_leads_servicio, fk_cotizaciones_lead
--
-- SHOW PROCEDURE STATUS WHERE Db = 'gcalls_db';
-- -- Esperado: gcalls_add_index presente (permanente, intencional)
-- =============================================================================

-- =============================================================================
-- FIN DEL SCRIPT -- G-Calls S.A.S. Fase 1 Backend
-- =============================================================================
