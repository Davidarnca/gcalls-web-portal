<?php

declare(strict_types=1);

/**
 * /api/admin/contenidos.php?seccion=global
 *
 * GET → lee la sección para el editor del panel (admin, editor, viewer).
 * PUT → reemplaza la sección completa (admin, editor). Exige X-CSRF-Token.
 *       Cuerpo: { "datos": { campo: "valor", ... } }
 *
 * 200 → { success, message, data: { seccion, datos, actualizado_en, actualizado_por } }
 * 400 → validación (errors por campo) · 401/403 → sesión o rol · 404 → sección
 * 405 → método · 500/503 → error de BD
 */

require_once __DIR__ . '/../config/cors.php';
require_once __DIR__ . '/../config/db.php';
require_once __DIR__ . '/../config/helpers.php';
require_once __DIR__ . '/../config/auth.php';
require_once __DIR__ . '/../config/contenidos.php';

$metodo = $_SERVER['REQUEST_METHOD'];

if ($metodo !== 'GET' && $metodo !== 'PUT') {
    json_response(false, 'Método no permitido. Usa GET o PUT.', httpCode: 405);
}

// Autenticación y rol antes de cualquier acceso a datos
$usuario = $metodo === 'GET'
    ? require_auth(['admin', 'editor', 'viewer'])
    : require_auth(['admin', 'editor']);

$seccion = $_GET['seccion'] ?? '';

if (!is_string($seccion) || !contenido_seccion_valida($seccion)) {
    json_response(false, 'Sección no encontrada.', httpCode: 404);
}

if ($metodo === 'PUT') {
    if (!validate_csrf_token()) {
        json_response(false, 'Token CSRF inválido o ausente.', httpCode: 403);
    }

    $payload = get_json_input();

    // Un arreglo JSON ([...]) también llega como array de PHP: sus claves numéricas
    // se rechazan en validar_contenido() como campos no permitidos.
    if (!isset($payload['datos']) || !is_array($payload['datos'])) {
        json_response(false, 'El cuerpo debe incluir "datos" como objeto.', httpCode: 400);
    }

    [$limpios, $errores] = validar_contenido($seccion, $payload['datos']);

    if ($errores !== []) {
        json_response(false, 'Revisa los campos marcados.', ['errors' => $errores], 400);
    }
}

try {
    $pdo = get_db_connection();

    if ($metodo === 'PUT') {
        $json = json_encode($limpios, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES | JSON_THROW_ON_ERROR);

        // Upsert portable (MySQL y MariaDB): los valores se enlazan dos veces
        $stmt = $pdo->prepare(
            'INSERT INTO contenidos (seccion, datos, actualizado_por)
             VALUES (:seccion, :datos, :usuario)
             ON DUPLICATE KEY UPDATE
                 datos = :datos_upd,
                 actualizado_por = :usuario_upd,
                 actualizado_en = CURRENT_TIMESTAMP'
        );
        $stmt->execute([
            'seccion'     => $seccion,
            'datos'       => $json,
            'usuario'     => $usuario['id'],
            'datos_upd'   => $json,
            'usuario_upd' => $usuario['id'],
        ]);
    }

    $contenido = obtener_contenido($pdo, $seccion);
    $contenido['datos'] = (object) $contenido['datos'];

    json_response(
        true,
        $metodo === 'PUT' ? 'Cambios guardados.' : 'Contenido obtenido correctamente.',
        $contenido
    );
} catch (PDOException $e) {
    error_log('[G-Calls Admin Contenidos] PDOException: ' . $e->getMessage());
    json_response(false, 'Error interno del servidor.', httpCode: 500);
} catch (JsonException $e) {
    error_log('[G-Calls Admin Contenidos] JsonException: ' . $e->getMessage());
    json_response(false, 'Error interno del servidor.', httpCode: 500);
} catch (RuntimeException) {
    json_response(false, 'No se pudo conectar con la base de datos.', httpCode: 503);
}
