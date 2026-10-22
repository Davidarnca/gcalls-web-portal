<?php
/**
 * G-Calls S.A.S. — Middleware de Autenticación y Sesiones
 *
 * Configuración de sesiones seguras nativas de PHP,
 * control de acceso basado en roles y validación de tokens CSRF.
 *
 * PHP 8.0+
 */

declare(strict_types=1);

require_once __DIR__ . '/helpers.php';

/**
 * Inicializa de forma centralizada y segura la sesión PHP.
 * Establece directivas de seguridad estrictas antes de invocar session_start().
 */
function start_secure_session(): void
{
    if (session_status() === PHP_SESSION_ACTIVE) {
        return;
    }

    ini_set('session.use_strict_mode', '1');
    ini_set('session.use_only_cookies', '1');
    ini_set('session.cookie_httponly', '1');

    $is_https = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off')
        || (isset($_SERVER['SERVER_PORT']) && (int) $_SERVER['SERVER_PORT'] === 443)
        || (isset($_SERVER['HTTP_X_FORWARDED_PROTO']) && strtolower($_SERVER['HTTP_X_FORWARDED_PROTO']) === 'https');

    session_name('GCALLS_SESSID');

    session_set_cookie_params([
        'lifetime' => 28800,        // 8 horas de vida de la cookie en el cliente
        'path'     => '/',
        'domain'   => '',           // Dominio actual
        'secure'   => $is_https,    // True bajo HTTPS (producción); False en HTTP (desarrollo local)
        'httponly' => true,         // Inaccesible desde JavaScript (mitigación XSS)
        'samesite' => 'Lax',        // Mitigación base para navegación cross-site
    ]);

    session_start();
}

/**
 * Comprueba si existe una sesión autenticada válida y activa.
 * Evalúa el timeout por inactividad de 2 horas (7200 segundos).
 *
 * @return array|null  Datos del usuario autenticado o null si no hay sesión válida.
 */
function check_auth(): ?array
{
    start_secure_session();

    if (empty($_SESSION['user_id'])) {
        return null;
    }

    // Timeout por inactividad: 2 horas (7200 segundos)
    $idle_timeout = 7200;
    $now = time();

    if (isset($_SESSION['last_activity']) && ($now - (int) $_SESSION['last_activity'] > $idle_timeout)) {
        // Sesión expirada por inactividad
        $_SESSION = [];
        if (session_status() === PHP_SESSION_ACTIVE) {
            session_destroy();
        }
        return null;
    }

    // Renovar marca de tiempo de última actividad
    $_SESSION['last_activity'] = $now;

    return [
        'id'         => (int) $_SESSION['user_id'],
        'email'      => (string) ($_SESSION['user_email'] ?? ''),
        'nombre'     => (string) ($_SESSION['user_nombre'] ?? ''),
        'rol'        => (string) ($_SESSION['user_rol'] ?? 'viewer'),
        'csrf_token' => (string) ($_SESSION['csrf_token'] ?? ''),
    ];
}

/**
 * Exige autenticación y autorización por rol para acceder a un recurso protegido.
 * Si no está autenticado, emite HTTP 401 y corta la ejecución.
 * Si está autenticado pero el rol no está autorizado, emite HTTP 403 y corta la ejecución.
 *
 * @param array $allowed_roles  Lista de roles con permiso (ej. ['admin', 'editor']).
 * @return array                Datos del usuario autenticado.
 */
function require_auth(array $allowed_roles = ['admin']): array
{
    $user = check_auth();

    if ($user === null) {
        json_response(false, 'No autenticado. Sesión inválida o expirada.', httpCode: 401);
    }

    if (!in_array($user['rol'], $allowed_roles, strict: true)) {
        json_response(false, 'Acceso denegado. Permisos insuficientes.', httpCode: 403);
    }

    return $user;
}

/**
 * Valida el token CSRF recibido en la cabecera HTTP X-CSRF-Token
 * contra el token almacenado en la sesión activa.
 *
 * @return bool  True si el token coincide exactamente; False en caso contrario.
 */
function validate_csrf_token(): bool
{
    start_secure_session();

    $header_token = $_SERVER['HTTP_X_CSRF_TOKEN'] ?? '';
    $session_token = $_SESSION['csrf_token'] ?? '';

    if ($header_token === '' || $session_token === '') {
        return false;
    }

    return hash_equals($session_token, $header_token);
}
