<?php
/**
 * G-Calls S.A.S. â€” Endpoint: GET /api/admin/contactos
 *
 * Devuelve el listado de leads almacenados en contactos_leads,
 * ordenados por fecha de registro descendente (mÃ¡s recientes primero).
 *
 * Contrato de la API:
 * â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
 *  MÃ©todo:  GET
 *  URL:     /api/admin/contactos.php
 *  Params:  (ninguno en v1)
 *
 *  Respuesta exitosa (200):
 *    { "success": true, "message": "...",
 *      "data": { "leads": [...], "total": N } }
 *
 *  Errores (400 / 405 / 500 / 503):
 *    { "success": false, "message": "..." }
 * â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
 *
 * âš ï¸  SEGURIDAD â€” TODO: AUTENTICACIÃ“N REAL
 * Este endpoint NO implementa autenticaciÃ³n de producciÃ³n.
 * Antes de desplegar en producciÃ³n, agregar validaciÃ³n de token/sesiÃ³n
 * real contra la base de datos. La autenticaciÃ³n simulada del frontend
 * (gcalls_admin_token) NO debe usarse como mecanismo de seguridad PHP.
 *
 * PHP 8.0+  |  Requiere PDO + pdo_mysql
 */

declare(strict_types=1);

// â”€â”€ Bootstrap â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
require_once __DIR__ . '/../config/cors.php';     // Cabeceras CORS + preflight guard
require_once __DIR__ . '/../config/db.php';       // get_db_connection()
require_once __DIR__ . '/../config/helpers.php';  // json_response()
require_once __DIR__ . '/../config/auth.php';     // require_auth()

// â”€â”€ Solo aceptamos GET â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    json_response(false, 'MÃ©todo no permitido. Usa GET.', httpCode: 405);
}

// â”€â”€ VerificaciÃ³n obligatoria de autenticaciÃ³n y rol â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
// Sin sesiÃ³n vÃ¡lida -> HTTP 401
// SesiÃ³n vÃ¡lida pero rol no autorizado (ej. viewer) -> HTTP 403
require_auth(['admin', 'editor']);

// â”€â”€ Consulta a base de datos â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
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

    // â”€â”€ Casteo explÃ­cito de tipos numÃ©ricos â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
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
    // Error de SQL (query mal formada, restricciÃ³n, etc.) â€” capturado antes de RuntimeException
    error_log('[G-Calls Admin Contactos] PDOException: ' . $e->getMessage());
    json_response(false, 'Error interno del servidor.', httpCode: 500);

} catch (RuntimeException) {
    // Fallo de conexiÃ³n arrojado explÃ­citamente como RuntimeException por get_db_connection()
    json_response(false, 'No se pudo conectar con la base de datos.', httpCode: 503);
}
