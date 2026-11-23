<?php

declare(strict_types=1);

/**
 * GET /api/contenidos.php?seccion=global
 *
 * Endpoint público de solo lectura: entrega el contenido editable de una sección
 * para que el sitio lo muestre. Si la sección nunca se ha guardado, `datos` llega
 * vacío y el frontend usa sus valores de respaldo.
 *
 * 200 → { success, message, data: { seccion, datos, actualizado_en } }
 * 404 → sección inexistente · 405 → método no permitido · 500/503 → error de BD
 */

require_once __DIR__ . '/config/cors.php';
require_once __DIR__ . '/config/db.php';
require_once __DIR__ . '/config/helpers.php';
require_once __DIR__ . '/config/contenidos.php';

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    json_response(false, 'Método no permitido. Usa GET.', httpCode: 405);
}

$seccion = $_GET['seccion'] ?? '';

if (!is_string($seccion) || !contenido_seccion_valida($seccion)) {
    json_response(false, 'Sección no encontrada.', httpCode: 404);
}

// El contenido cambia poco, pero una edición debe verse de inmediato:
// el navegador puede guardar copia, pero debe revalidarla en cada visita.
header('Cache-Control: no-cache');

try {
    $contenido = obtener_contenido(get_db_connection(), $seccion);

    json_response(true, 'Contenido obtenido correctamente.', [
        'seccion'        => $contenido['seccion'],
        'datos'          => (object) $contenido['datos'],
        'actualizado_en' => $contenido['actualizado_en'],
    ]);
} catch (PDOException $e) {
    error_log('[G-Calls Contenidos] PDOException: ' . $e->getMessage());
    json_response(false, 'Error interno del servidor.', httpCode: 500);
} catch (RuntimeException) {
    json_response(false, 'No se pudo conectar con la base de datos.', httpCode: 503);
}
