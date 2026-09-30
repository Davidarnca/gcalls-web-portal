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

start_secure_session();

// 1. Limpiar variables de sesión
$_SESSION = [];

// 2. Destruir sesión en servidor si está activa
if (session_status() === PHP_SESSION_ACTIVE) {
    session_destroy();
}

// 3. Expirar la cookie en el cliente
$is_https = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off')
    || (isset($_SERVER['SERVER_PORT']) && (int) $_SERVER['SERVER_PORT'] === 443)
    || (isset($_SERVER['HTTP_X_FORWARDED_PROTO']) && strtolower($_SERVER['HTTP_X_FORWARDED_PROTO']) === 'https');

setcookie('GCALLS_SESSID', '', [
    'expires'  => time() - 3600,
    'path'     => '/',
    'domain'   => '',
    'secure'   => $is_https,
    'httponly' => true,
    'samesite' => 'Lax',
]);

json_response(true, 'Sesión cerrada correctamente.', httpCode: 200);
