<?php

declare(strict_types=1);

/**
 * /api/admin/servicios.php
 *
 * GET              → todos los servicios, activos e inactivos (admin, editor, viewer).
 * PATCH ?id=N      → cambio parcial de un servicio (admin, editor). Exige X-CSRF-Token.
 *                    Cuerpo: cualquier subconjunto de
 *                    { activo, titulo, icono, tema, contenido: { descripcion, tarjetas } }
 *
 * 200 → { success, message, data: { servicios: [...] } | { servicio: {...} } }
 * 400 → validación (errors por campo) · 401/403 → sesión, rol o CSRF · 404 → servicio
 * 405 → método · 500/503 → error de BD
 */

require_once __DIR__ . '/../config/cors.php';
require_once __DIR__ . '/../config/db.php';
require_once __DIR__ . '/../config/helpers.php';
require_once __DIR__ . '/../config/auth.php';
require_once __DIR__ . '/../config/servicios.php';

$metodo = $_SERVER['REQUEST_METHOD'];

if ($metodo !== 'GET' && $metodo !== 'PATCH') {
    json_response(false, 'Método no permitido. Usa GET o PATCH.', httpCode: 405);
}

// Autenticación y rol antes de cualquier acceso a datos
$metodo === 'GET'
    ? require_auth(['admin', 'editor', 'viewer'])
    : require_auth(['admin', 'editor']);

const SQL_SERVICIO = 'SELECT id, slug, titulo, icono, color_accent, activo, contenido_json FROM servicios';

try {
    if ($metodo === 'GET') {
        $stmt = get_db_connection()->prepare(SQL_SERVICIO . ' ORDER BY id');
        $stmt->execute();
        $servicios = array_map('servicio_desde_fila', $stmt->fetchAll(PDO::FETCH_ASSOC));
        json_response(true, 'Servicios obtenidos correctamente.', ['servicios' => $servicios]);
    }

    // ── PATCH ────────────────────────────────────────────────────────────────
    if (!validate_csrf_token()) {
        json_response(false, 'Token CSRF inválido o ausente.', httpCode: 403);
    }

    $id = filter_var($_GET['id'] ?? null, FILTER_VALIDATE_INT, ['options' => ['min_range' => 1]]);
    if ($id === false || $id === null) {
        json_response(false, 'Servicio no encontrado.', httpCode: 404);
    }

    $payload = get_json_input();
    [$cambios, $errores] = validar_servicio_patch($payload);

    if ($errores !== []) {
        json_response(false, 'Revisa los campos marcados.', ['errors' => $errores], 400);
    }

    $pdo = get_db_connection();

    $existe = $pdo->prepare('SELECT 1 FROM servicios WHERE id = :id');
    $existe->execute(['id' => $id]);
    if ($existe->fetchColumn() === false) {
        json_response(false, 'Servicio no encontrado.', httpCode: 404);
    }

    // Columnas fijas: los nombres nunca vienen del usuario
    $columnas = [
        'activo'    => 'activo',
        'titulo'    => 'titulo',
        'icono'     => 'icono',
        'tema'      => 'color_accent',
        'contenido' => 'contenido_json',
    ];
    $sets   = [];
    $params = ['id' => $id];
    foreach ($cambios as $campo => $valor) {
        $sets[] = $columnas[$campo] . ' = :' . $campo;
        $params[$campo] = match ($campo) {
            'activo'    => $valor ? 1 : 0,
            'contenido' => json_encode($valor, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES | JSON_THROW_ON_ERROR),
            default     => $valor,
        };
    }

    $pdo->prepare('UPDATE servicios SET ' . implode(', ', $sets) . ' WHERE id = :id')->execute($params);

    $stmt = $pdo->prepare(SQL_SERVICIO . ' WHERE id = :id');
    $stmt->execute(['id' => $id]);

    json_response(true, 'Cambios guardados.', ['servicio' => servicio_desde_fila($stmt->fetch(PDO::FETCH_ASSOC))]);
} catch (PDOException $e) {
    error_log('[G-Calls Admin Servicios] PDOException: ' . $e->getMessage());
    json_response(false, 'Error interno del servidor.', httpCode: 500);
} catch (JsonException $e) {
    error_log('[G-Calls Admin Servicios] JsonException: ' . $e->getMessage());
    json_response(false, 'Error interno del servidor.', httpCode: 500);
} catch (RuntimeException) {
    json_response(false, 'No se pudo conectar con la base de datos.', httpCode: 503);
}
