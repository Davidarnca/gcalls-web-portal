<?php
/**
 * G-Calls S.A.S. — Script CLI: Creación segura de usuario administrativo
 *
 * Uso en terminal:
 *   php scripts/create_admin.php <email> <password> [nombre] [rol]
 *
 * Ejemplo:
 *   php scripts/create_admin.php admin@gcalls.com "MiPasswordSegura123!" "Admin Principal" admin
 *
 * PHP 8.0+
 */

declare(strict_types=1);

// Protección estricta: Solo ejecutable desde línea de comandos (CLI)
if (php_sapi_name() !== 'cli') {
    http_response_code(403);
    echo "Acceso denegado. Este script solo puede ejecutarse mediante la línea de comandos (CLI).\n";
    exit(1);
}

require_once __DIR__ . '/../public/api/config/db.php';

// Validar argumentos
if ($argc < 3) {
    echo "Uso:\n";
    echo "  php scripts/create_admin.php <email> <password> [nombre] [rol]\n\n";
    echo "Parámetros:\n";
    echo "  email     (Obligatorio) Correo del usuario.\n";
    echo "  password  (Obligatorio) Contraseña en texto plano a hashear.\n";
    echo "  nombre    (Opcional) Nombre del usuario. Default: 'Administrador G-Calls'\n";
    echo "  rol       (Opcional) 'admin', 'editor' o 'viewer'. Default: 'admin'\n";
    exit(1);
}

$email    = trim((string) $argv[1]);
$password = (string) $argv[2];
$nombre   = isset($argv[3]) && trim((string) $argv[3]) !== '' ? trim((string) $argv[3]) : 'Administrador G-Calls';
$rol      = isset($argv[4]) && trim((string) $argv[4]) !== '' ? trim((string) $argv[4]) : 'admin';

// Validaciones básicas de formato
if (filter_var($email, FILTER_VALIDATE_EMAIL) === false) {
    echo "Error: El email '{$email}' no tiene un formato válido.\n";
    exit(1);
}

if (strlen($password) < 8) {
    echo "Error: La contraseña debe tener al menos 8 caracteres.\n";
    exit(1);
}

$roles_permitidos = ['admin', 'editor', 'viewer'];
if (!in_array($rol, $roles_permitidos, strict: true)) {
    echo "Error: El rol '{$rol}' no es válido. Opciones: " . implode(', ', $roles_permitidos) . "\n";
    exit(1);
}

try {
    $pdo = get_db_connection();

    // Regla obligatoria: NO sobrescribir silenciosamente si ya existe
    $check_stmt = $pdo->prepare('SELECT id FROM usuarios WHERE email = :email LIMIT 1');
    $check_stmt->execute([':email' => $email]);

    if ($check_stmt->fetchColumn() !== false) {
        echo "Error: El usuario con email '{$email}' ya existe. No se modificó el registro.\n";
        exit(1);
    }

    // Generar hash seguro utilizando PASSWORD_DEFAULT (Bcrypt en PHP 8+)
    $password_hash = password_hash($password, PASSWORD_DEFAULT);

    $insert_stmt = $pdo->prepare(
        'INSERT INTO usuarios (nombre, email, password_hash, rol, creado_en)
         VALUES (:nombre, :email, :password_hash, :rol, NOW())'
    );

    $insert_stmt->execute([
        ':nombre'        => $nombre,
        ':email'         => $email,
        ':password_hash' => $password_hash,
        ':rol'           => $rol,
    ]);

    $new_id = (int) $pdo->lastInsertId();

    echo "==================================================\n";
    echo "✓ Usuario creado exitosamente\n";
    echo "==================================================\n";
    echo "ID:     {$new_id}\n";
    echo "Email:  {$email}\n";
    echo "Nombre: {$nombre}\n";
    echo "Rol:    {$rol}\n";
    echo "Algoritmo: PASSWORD_DEFAULT (Bcrypt)\n";
    echo "==================================================\n";
    exit(0);

} catch (PDOException $e) {
    echo "Error de base de datos: " . $e->getMessage() . "\n";
    exit(1);
} catch (RuntimeException $e) {
    echo "Error de conexión: " . $e->getMessage() . "\n";
    exit(1);
}
