-- =============================================================================
-- G-Calls S.A.S. — Migración H1a: tabla `contenidos` (CMS por secciones)
-- Fecha: 2026-11-22
-- =============================================================================
-- Qué hace:
--   Crea la tabla `contenidos`, donde el panel administrativo guarda el contenido
--   editable del sitio, un registro por sección (ej. 'global' = datos de contacto,
--   horario, redes y WhatsApp).
--
-- Seguridad de ejecución:
--   - Solo CREATE TABLE IF NOT EXISTS: no borra ni modifica tablas existentes.
--   - Idempotente: ejecutarla dos veces no produce errores ni duplicados.
--   - No inserta datos: mientras una sección no se guarde desde el panel, el sitio
--     muestra sus valores de respaldo (definidos en src/lib/contenidos.ts).
--
-- Cómo ejecutarla (local, PowerShell, desde la raíz del repo):
--   mysql -u root -p gcalls_db -e "source migrations/2026-11-22_h1a_contenidos.sql"
-- En producción: phpMyAdmin → base de datos → pestaña SQL → pegar y ejecutar.
-- =============================================================================

CREATE TABLE IF NOT EXISTS contenidos (
  seccion         VARCHAR(50)   NOT NULL                COMMENT 'Clave de la seccion editable -- ej: global',
  datos           JSON          NOT NULL                COMMENT 'Contenido validado de la seccion (campos definidos en public/api/config/contenidos.php)',
  actualizado_en  DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
                                                        COMMENT 'Fecha y hora de la ultima edicion',
  actualizado_por INT UNSIGNED  NULL DEFAULT NULL       COMMENT 'Usuario que hizo la ultima edicion (FK a usuarios.id)',

  PRIMARY KEY (seccion),

  -- Si se elimina el usuario, se conserva el contenido y se pierde solo la autoría
  CONSTRAINT fk_contenidos_usuario
    FOREIGN KEY (actualizado_por)
    REFERENCES usuarios (id)
    ON DELETE SET NULL
    ON UPDATE CASCADE

) ENGINE=InnoDB
  DEFAULT CHARSET=utf8mb4
  COLLATE=utf8mb4_unicode_ci
  COMMENT='Contenido editable del sitio publico, una fila por seccion';
