<?php
/**
 * G-Calls S.A.S. - Endpoint: GET /api/admin/contactos
 *
 * Devuelve el listado de leads almacenados en contactos_leads,
 * ordenados por fecha de registro descendente (más recientes primero).
 *
 * Contrato de la API:
 * ----------------------------------------------------------------
 *  Método:  GET
 *  URL:     /api/admin/contactos.php
 *  Params:  (ninguno en v1)
 *
 *  Respuesta exitosa (200):
 *    { "success": true, "message": "...",
 *      "data": { "leads": [...], "total": N } }
 *
 *  Errores (400 / 401 / 403 / 405 / 500 / 503):
 *    { "success": false, "message": "..." }
 * ----------------------------------------------------------------
 *
 * Seguridad:
 *  El acceso está protegido por la autenticación de sesión PHP
 *  y los roles permitidos admin y editor, según auth.php.
 *
 * PHP 8.1+ | Requiere PDO + pdo_mysql
 */

declare(strict_types=1);

// --- Bootstrap --------------------------------------------------------------
require_once __DIR__ . '/../config/cors.php';     // Cabeceras CORS + preflight guard
require_once __DIR__ . '/../config/db.php';       // get_db_connection()
require_once __DIR__ . '/../config/helpers.php';  // json_response()
require_once __DIR__ . '/../config/auth.php';     // require_auth()

// --- Solo aceptamos GET -----------------------------------------------------
if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    json_response(false, 'Método no permitido. Usa GET.', httpCode: 405);
}

// --- Verificación obligatoria de autenticación y rol ------------------------
// Sesión válida -> HTTP 401
// Sesión válida pero rol no autorizado (ej. viewer) -> HTTP 403
require_auth(['admin', 'editor']);

// --- Consulta a base de datos ------------------------------------------------
try {
    $pdo = get_db_connection();

    $sql = <<<SQL
        SELECT
            id,
            nombre,
            empresa,
            email,
            telefono,
            servicio_interes,
            mensaje,
            estado,
            fecha_registro
        FROM contactos_leads
        ORDER BY fecha_registro DESC
        LIMIT 200
    SQL;

    $stmt = $pdo->prepare($sql);
    $stmt->execute();

    $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // ----- Casteo explícito de tipos numéricos -------------------------------------
    // PDO::FETCH_ASSOC devuelve todos los valores como strings.
    // Casteamos id (siempre entero) y servicio_interes (entero o null).
    $leads = array_map(function (array $row): array {
        return [
            'id'               => (int) $row['id'],
            'nombre'           => $row['nombre'],
            'empresa'          => $row['empresa'],           // string|null
            'email'            => $row['email'],
            'telefono'         => $row['telefono'],          // string|null
            'servicio_interes' => $row['servicio_interes'] !== null
                                    ? (int) $row['servicio_interes']
                                    : null,                  // int|null
            'mensaje'          => $row['mensaje'],           // string|null
            'estado'           => $row['estado'],
            'fecha_registro'   => $row['fecha_registro'],    // 'YYYY-MM-DD HH:MM:SS'
        ];
    }, $rows);

    json_response(
        success:  true,
        message:  'Leads obtenidos correctamente.',
        data:     ['leads' => $leads, 'total' => count($leads)],
        httpCode: 200
    );

} catch (PDOException $e) {
    // Error de SQL (consulta mal formada, restricción, etc.).
    error_log('[G-Calls Admin Contactos] PDOException: ' . $e->getMessage());
    json_response(false, 'Error interno del servidor.', httpCode: 500);

} catch (RuntimeException) {
    // Fallo de conexión arrojado explícitamente como RuntimeException por get_db_connection()
    json_response(false, 'No se pudo conectar con la base de datos.', httpCode: 503);
}
