<?php

declare(strict_types=1);

/**
 * GET /api/servicios.php
 *
 * Endpoint público: lista de servicios activos para el menú, el pie de página,
 * el selector del formulario y las páginas /servicios/:slug.
 * Los campos null (icono, tema, contenido) se completan en el frontend con los
 * valores de respaldo de cada servicio.
 *
 * 200 → { success, message, data: { servicios: [...] } }
 * 405 → método no permitido · 500/503 → error de BD
 */

require_once __DIR__ . '/config/cors.php';
require_once __DIR__ . '/config/db.php';
require_once __DIR__ . '/config/helpers.php';
require_once __DIR__ . '/config/servicios.php';

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    json_response(false, 'Método no permitido. Usa GET.', httpCode: 405);
}

header('Cache-Control: no-cache');

try {
    $stmt = get_db_connection()->prepare(
        'SELECT id, slug, titulo, icono, color_accent, activo, contenido_json
           FROM servicios
          WHERE activo = 1
          ORDER BY id'
    );
    $stmt->execute();

    $servicios = array_map(static function (array $fila): array {
        $s = servicio_desde_fila($fila);
        unset($s['activo']); // el público solo recibe activos
        return $s;
    }, $stmt->fetchAll(PDO::FETCH_ASSOC));

    json_response(true, 'Servicios obtenidos correctamente.', ['servicios' => $servicios]);
} catch (PDOException $e) {
    error_log('[G-Calls Servicios] PDOException: ' . $e->getMessage());
    json_response(false, 'Error interno del servidor.', httpCode: 500);
} catch (RuntimeException) {
    json_response(false, 'No se pudo conectar con la base de datos.', httpCode: 503);
}
