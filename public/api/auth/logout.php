<?php
/**
 * G-Calls S.A.S. — Endpoint: POST /api/auth/logout.php
 *
 * Cierra la sesión administrativa, limpia los datos en el servidor,
 * destruye la sesión y expira la cookie GCALLS_SESSID en el cliente.
 *
 * PHP 8.0+
 */

declare(strict_types=1);

require_once __DIR__ . '/../config/cors.php';
require_once __DIR__ . '/../config/helpers.php';
require_once __DIR__ . '/../config/auth.php';

// Solo aceptamos POST
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    json_response(false, 'Método no permitido. Usa POST.', httpCode: 405);
}

// 1. Validar token CSRF antes de modificar o destruir la sesión activa
// validate_csrf_token() inicializa internamente la sesión segura de forma idempotente
if (!validate_csrf_token()) {
    json_response(false, 'Token CSRF inválido o ausente.', httpCode: 403);
}

// 2. Limpiar variables, destruir la sesión en el servidor y expirar la cookie
destroy_session();

json_response(true, 'Sesión cerrada correctamente.', httpCode: 200);
