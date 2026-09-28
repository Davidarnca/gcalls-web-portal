<?php
/**
 * G-Calls S.A.S. — Endpoint: GET /api/admin/contactos
 *
 * Devuelve el listado de leads almacenados en contactos_leads,
 * ordenados por fecha de registro descendente (más recientes primero).
 *
 * Contrato de la API:
 * ──────────────────────────────────────────────────────────────────
 *  Método:  GET
 *  URL:     /api/admin/contactos.php
 *  Params:  (ninguno en v1)
 *
 *  Respuesta exitosa (200):
 *    { "success": true, "message": "...",
 *      "data": { "leads": [...], "total": N } }
 *
 *  Errores (400 / 405 / 500 / 503):
 *    { "success": false, "message": "..." }
 * ──────────────────────────────────────────────────────────────────
 *
 * ⚠️  SEGURIDAD — TODO: AUTENTICACIÓN REAL
 * Este endpoint NO implementa autenticación de producción.
 * Antes de desplegar en producción, agregar validación de token/sesión
 * real contra la base de datos. La autenticación simulada del frontend
 * (gcalls_admin_token) NO debe usarse como mecanismo de seguridad PHP.
 *
 * PHP 8.0+  |  Requiere PDO + pdo_mysql
 */

declare(strict_types=1);

// ── Bootstrap ─────────────────────────────────────────────────────────────────
require_once __DIR__ . '/../config/cors.php';  // Cabeceras CORS + preflight guard
require_once __DIR__ . '/../config/db.php';    // get_db_connection()

// ── Solo aceptamos GET ────────────────────────────────────────────────────────
if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    json_response_admin(false, 'Método no permitido. Usa GET.', httpCode: 405);
}

// ── TODO: AUTENTICACIÓN REAL ──────────────────────────────────────────────────
// Implementar aquí la verificación de token/sesión antes de producción.
// Ejemplo futuro:
//   $token = $_SERVER['HTTP_AUTHORIZATION'] ?? '';
//   if (!verify_admin_token($token)) {
//       json_response_admin(false, 'No autorizado.', httpCode: 401);
//   }
// ─────────────────────────────────────────────────────────────────────────────

// ── Consulta a base de datos ──────────────────────────────────────────────────
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

    // ── Casteo explícito de tipos numéricos ───────────────────────────────────
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

    json_response_admin(
        success:  true,
        message:  'Leads obtenidos correctamente.',
        data:     ['leads' => $leads, 'total' => count($leads)],
        httpCode: 200
    );

} catch (PDOException $e) {
    // Error de SQL (query mal formada, restricción, etc.) — capturado antes de RuntimeException
    error_log('[G-Calls Admin Contactos] PDOException: ' . $e->getMessage());
    json_response_admin(false, 'Error interno del servidor.', httpCode: 500);

} catch (RuntimeException) {
    // Fallo de conexión arrojado explícitamente como RuntimeException por get_db_connection()
    json_response_admin(false, 'No se pudo conectar con la base de datos.', httpCode: 503);
}


// =============================================================================
// FUNCIONES AUXILIARES
// =============================================================================

/**
 * Emite una respuesta JSON estandarizada y termina la ejecución.
 * Copia local de json_response() — extraer a config/helpers.php en fase futura.
 */
function json_response_admin(
    bool   $success,
    string $message,
    ?array $data     = null,
    int    $httpCode = 200
): never {
    http_response_code($httpCode);

    $body = [
        'success' => $success,
        'message' => $message,
    ];

    if ($data !== null) {
        $body['data'] = $data;
    }

    echo json_encode($body, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    exit;
}
