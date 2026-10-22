<?php
/**
 * G-Calls S.A.S. — Endpoint: GET /api/auth/me.php
 *
 * Devuelve la identidad pública y token CSRF del usuario actualmente autenticado,
 * o emite HTTP 401 si la sesión no existe o ha expirado.
 *
 * PHP 8.0+
 */

declare(strict_types=1);

require_once __DIR__ . '/../config/cors.php';
require_once __DIR__ . '/../config/helpers.php';
require_once __DIR__ . '/../config/auth.php';

// Solo aceptamos GET
if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    json_response(false, 'Método no permitido. Usa GET.', httpCode: 405);
}

$user = check_auth();

if ($user === null) {
    json_response(false, 'No autenticado. Sesión inválida o expirada.', httpCode: 401);
}

// NUNCA exponer password_hash
json_response(
    true,
    'Usuario autenticado.',
    [
        'user' => [
            'id'     => $user['id'],
            'nombre' => $user['nombre'],
            'email'  => $user['email'],
            'rol'    => $user['rol'],
        ],
        'csrf_token' => $user['csrf_token'],
    ],
    httpCode: 200
);
