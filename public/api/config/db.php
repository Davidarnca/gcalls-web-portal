<?php
/**
 * G-Calls S.A.S. — Conexion PDO a MySQL
 *
 * Proporciona una conexion PDO reutilizable como Singleton.
 * Lee las credenciales desde variables de entorno (produccion)
 * o desde constantes de fallback (desarrollo local).
 *
 * Uso:
 *   require_once __DIR__ . '/db.php';
 *   $pdo = get_db_connection();
 *
 * PHP 8.0+  |  Requiere extension PDO + pdo_mysql
 */

declare(strict_types=1);

// Carga variables del archivo .env local antes de que env() sea invocada.
// En produccion, si las variables ya estan en el entorno del proceso, env.php
// las respeta y no las sobrescribe. Ver: public/api/config/env.php
require_once __DIR__ . '/env.php';

/**
 * Lee una variable de entorno y devuelve su valor o un default.
 *
 * Prioridad (de mayor a menor):
 *   1. $_ENV      — variable definida en el proceso PHP
 *   2. $_SERVER   — variable inyectada por el servidor web
 *   3. getenv()   — variable del sistema operativo
 *   4. $default   — valor de respaldo
 *
 * Una variable definida con valor vacio ('') en cualquiera de las tres fuentes
 * anteriores se considera explicitamente configurada y tiene prioridad sobre $default.
 * Se usa array_key_exists (no isset) para distinguir clave ausente de valor vacio.
 */
function env(string $key, string $default = ''): string
{
    if (array_key_exists($key, $_ENV))    return (string) $_ENV[$key];
    if (array_key_exists($key, $_SERVER)) return (string) $_SERVER[$key];
    $env_val = getenv($key);
    return $env_val !== false ? (string) $env_val : $default;
}

/**
 * Devuelve la conexion PDO compartida (patron Singleton).
 * Lanza una RuntimeException si la conexion falla —
 * capturala en el endpoint con un try/catch apropiado.
 *
 * @throws RuntimeException  Si la conexion a MySQL no puede establecerse.
 * @return PDO               Instancia PDO lista para consultas.
 */
function get_db_connection(): PDO
{
    // Variable estatica: solo se crea la conexion una vez por ciclo de vida PHP
    static $pdo = null;

    if ($pdo !== null) {
        return $pdo;
    }

    // ── Credenciales ─────────────────────────────────────────────────────────
    // Prioridad: variable de entorno > valor por defecto (solo desarrollo local)
    $host    = env('DB_HOST',    'localhost');
    $port    = env('DB_PORT',    '3306');
    $dbname  = env('DB_NAME',    'gcalls_db');
    $user    = env('DB_USER',    'root');
    $pass    = env('DB_PASS',    '');
    $charset = env('DB_CHARSET', 'utf8mb4');

    // ── Diagnóstico previo de credenciales ───────────────────────────────────
    if ($pass === '') {
        error_log(
            '[G-Calls DB] Advertencia: DB_PASS esta vacio. ' .
            'Si MySQL requiere contrasena, la conexion fallara con error 1045. ' .
            'Verifica que DB_PASS este definido en .env o en el entorno del proceso.'
        );
    }

    // ── DSN ──────────────────────────────────────────────────────────────────
    $dsn = "mysql:host={$host};port={$port};dbname={$dbname};charset={$charset}";

    // ── Opciones PDO ─────────────────────────────────────────────────────────
    $options = [
        // Lanza PDOException en cada error — facilita el manejo con try/catch
        PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,

        // Devuelve filas como arrays asociativos por defecto
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,

        // Desactiva emulacion de prepared statements — mayor seguridad
        PDO::ATTR_EMULATE_PREPARES   => false,

        // Codificacion UTF-8 en la conexion (redundante con charset en DSN,
        // pero garantia adicional para MySQL < 5.5.3)
        PDO::MYSQL_ATTR_INIT_COMMAND => "SET NAMES {$charset} COLLATE utf8mb4_unicode_ci",
    ];

    try {
        $pdo = new PDO($dsn, $user, $pass, $options);
    } catch (PDOException $e) {
        // No exponemos detalles internos al cliente — solo logueamos en servidor
        error_log('[G-Calls DB] Fallo al conectar con MySQL: ' . $e->getMessage());

        throw new RuntimeException(
            'No se pudo establecer la conexion con la base de datos.',
            500,
            $e   // Encadena la excepcion original para el log interno
        );
    }

    return $pdo;
}
