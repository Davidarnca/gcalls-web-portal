<?php
/**
 * G-Calls S.A.S. — Endpoint: POST /api/auth/login.php
 *
 * Autentica usuarios administrativos contra MySQL, regenera la sesión
 * para prevenir Session Fixation y establece la cookie segura GCALLS_SESSID.
 *
 * PHP 8.0+
 */

declare(strict_types=1);

require_once __DIR__ . '/../config/cors.php';
require_once __DIR__ . '/../config/db.php';
require_once __DIR__ . '/../config/helpers.php';
require_once __DIR__ . '/../config/auth.php';

// Solo aceptamos POST
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    json_response(false, 'Método no permitido. Usa POST.', httpCode: 405);
}

$payload = get_json_input();

$email = trim((string) ($payload['email'] ?? ''));
$password = (string) ($payload['password'] ?? '');

// Validación básica de entrada
if ($email === '' || $password === '' || filter_var($email, FILTER_VALIDATE_EMAIL) === false) {
    json_response(false, 'Debes proporcionar un email válido y una contraseña.', httpCode: 400);
}

try {
    $pdo = get_db_connection();

    $stmt = $pdo->prepare(
        'SELECT id, nombre, email, password_hash, rol FROM usuarios WHERE email = :email LIMIT 1'
    );
    $stmt->execute([':email' => $email]);
    $user = $stmt->fetch(PDO::FETCH_ASSOC);

    // Mensaje uniforme para prevenir enumeración de usuarios
    if (!$user || !password_verify($password, (string) $user['password_hash'])) {
        json_response(false, 'Credenciales inválidas.', httpCode: 401);
    }

    // 1. Iniciar contexto de sesión seguro
    start_secure_session();

    // 2. Regenerar ID de sesión ANTES de guardar la identidad (previene Session Fixation)
    session_regenerate_id(true);

    // 3. Generar token CSRF criptográficamente seguro
    $csrf_token = bin2hex(random_bytes(32));
    $now = time();

    // 4. Guardar únicamente datos estrictamente necesarios en la sesión
    $_SESSION['user_id']          = (int) $user['id'];
    $_SESSION['user_email']       = (string) $user['email'];
    $_SESSION['user_nombre']      = (string) $user['nombre'];
    $_SESSION['user_rol']         = (string) $user['rol'];
    $_SESSION['authenticated_at'] = $now;
    $_SESSION['last_activity']    = $now;
    $_SESSION['csrf_token']       = $csrf_token;

    // 5. Responder al cliente (NUNCA incluir password_hash)
    json_response(
        true,
        'Inicio de sesión exitoso.',
        [
            'user' => [
                'id'     => (int) $user['id'],
                'nombre' => (string) $user['nombre'],
                'email'  => (string) $user['email'],
                'rol'    => (string) $user['rol'],
            ],
            'csrf_token' => $csrf_token,
        ],
        httpCode: 200
    );

} catch (PDOException $e) {
    error_log('[G-Calls Login] PDOException: ' . $e->getMessage());
    json_response(false, 'Error interno del servidor.', httpCode: 500);
} catch (RuntimeException $e) {
    error_log('[G-Calls Login] RuntimeException: ' . $e->getMessage());
    json_response(false, 'No se pudo conectar con la base de datos.', httpCode: 503);
}
