<?php
/**
 * G-Calls S.A.S. — Endpoint: POST /api/contactos
 *
 * Recibe solicitudes de contacto/lead desde el portal web,
 * valida y sanitiza los datos, y los persiste en `contactos_leads`.
 *
 * Contrato de la API:
 * ──────────────────────────────────────────────────────────────────
 *  Metodo:   POST
 *  URL:      /api/contactos.php
 *  Body:     JSON  { nombre, email, empresa?, telefono?, servicio_interes?, mensaje? }
 *
 *  Respuestas exitosas (200):
 *    { "success": true,  "message": "...", "data": { "id": 42, "codigo": "..." } }
 *
 *  Errores de validacion (400):
 *    { "success": false, "message": "...", "errors": { "campo": "descripcion" } }
 *
 *  Errores de servidor (500):
 *    { "success": false, "message": "Error interno del servidor." }
 * ──────────────────────────────────────────────────────────────────
 *
 * PHP 8.0+  |  Requiere PDO + pdo_mysql
 */

declare(strict_types=1);

// ── Bootstrap ─────────────────────────────────────────────────────────────────
require_once __DIR__ . '/config/cors.php';   // Cabeceras CORS + preflight guard
require_once __DIR__ . '/config/db.php';     // get_db_connection()

// ── Solo aceptamos POST ───────────────────────────────────────────────────────
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    json_response(false, 'Metodo no permitido. Usa POST.', httpCode: 405);
}

// ── Lectura del body JSON ─────────────────────────────────────────────────────
$raw_body = file_get_contents('php://input');
$payload  = json_decode($raw_body, associative: true);

if (!is_array($payload)) {
    json_response(false, 'El cuerpo de la solicitud debe ser JSON valido.', httpCode: 400);
}

// ── Validacion y sanitizacion ─────────────────────────────────────────────────
$errors = [];

// --- nombre (obligatorio) ---
$nombre = sanitize_string($payload['nombre'] ?? '');
if ($nombre === '') {
    $errors['nombre'] = 'El nombre es obligatorio.';
} elseif (mb_strlen($nombre) > 120) {
    $errors['nombre'] = 'El nombre no puede superar los 120 caracteres.';
}

// --- email (obligatorio, formato valido) ---
$email_raw = trim($payload['email'] ?? '');
$email     = filter_var($email_raw, FILTER_VALIDATE_EMAIL);
if ($email === false || $email === '') {
    $errors['email'] = 'Debes proporcionar un email valido.';
} elseif (mb_strlen($email) > 180) {
    $errors['email'] = 'El email no puede superar los 180 caracteres.';
}

// --- empresa (opcional) ---
$empresa = sanitize_string($payload['empresa'] ?? '');
$empresa = $empresa !== '' ? $empresa : null;
if ($empresa !== null && mb_strlen($empresa) > 180) {
    $errors['empresa'] = 'El nombre de la empresa no puede superar los 180 caracteres.';
}

// --- telefono (opcional, solo digitos, +, espacios y guiones) ---
$telefono = sanitize_string($payload['telefono'] ?? '');
$telefono = $telefono !== '' ? $telefono : null;
if ($telefono !== null) {
    if (!preg_match('/^[+\d\s\-().]{6,30}$/', $telefono)) {
        $errors['telefono'] = 'El telefono tiene un formato invalido.';
    }
}

// --- servicio_interes (opcional, entero positivo) ---
$servicio_raw     = $payload['servicio_interes'] ?? null;
$servicio_interes = null;
if ($servicio_raw !== null && $servicio_raw !== '') {
    $servicio_interes = filter_var($servicio_raw, FILTER_VALIDATE_INT, [
        'options' => ['min_range' => 1],
    ]);
    if ($servicio_interes === false) {
        $errors['servicio_interes'] = 'El servicio de interes debe ser un ID entero positivo.';
    }
}

// --- mensaje (opcional) ---
$mensaje = sanitize_string($payload['mensaje'] ?? '');
$mensaje = $mensaje !== '' ? $mensaje : null;
// Sin limite de longitud estricto — TEXT en BD, pero prevenimos abusos
if ($mensaje !== null && mb_strlen($mensaje) > 5000) {
    $errors['mensaje'] = 'El mensaje no puede superar los 5000 caracteres.';
}

// ── Respuesta temprana si hay errores de validacion ───────────────────────────
if (!empty($errors)) {
    json_response(
        success: false,
        message: 'Los datos enviados contienen errores. Por favor revisalos.',
        data:    ['errors' => $errors],
        httpCode: 400
    );
}

// ── Verificacion de servicio existente (si se envio) ─────────────────────────
if ($servicio_interes !== null) {
    try {
        $pdo  = get_db_connection();
        $stmt = $pdo->prepare(
            'SELECT id FROM servicios WHERE id = :id AND activo = 1 LIMIT 1'
        );
        $stmt->execute([':id' => $servicio_interes]);

        if ($stmt->fetchColumn() === false) {
            // Servicio no existe o esta inactivo — no bloqueamos el lead,
            // simplemente ignoramos el servicio para no perder el contacto
            $servicio_interes = null;
        }
    } catch (RuntimeException) {
        // Si la BD falla en esta verificacion auxiliar, continuamos sin FK
        $servicio_interes = null;
    }
}

// ── Insercion en base de datos ────────────────────────────────────────────────
try {
    $pdo = get_db_connection();

    $sql = <<<SQL
        INSERT INTO contactos_leads
            (nombre, empresa, email, telefono, servicio_interes, mensaje, estado, fecha_registro)
        VALUES
            (:nombre, :empresa, :email, :telefono, :servicio_interes, :mensaje, 'nuevo', NOW())
    SQL;

    $stmt = $pdo->prepare($sql);
    $stmt->execute([
        ':nombre'           => $nombre,
        ':empresa'          => $empresa,
        ':email'            => $email,
        ':telefono'         => $telefono,
        ':servicio_interes' => $servicio_interes,
        ':mensaje'          => $mensaje,
    ]);

    $new_id = (int) $pdo->lastInsertId();

    // Loguea el nuevo lead (util en desarrollo y para auditoria basica)
    error_log("[G-Calls] Nuevo lead registrado — ID: {$new_id}, Email: {$email}");

    json_response(
        success:  true,
        message:  '¡Gracias por contactarnos! Nos pondremos en contacto contigo pronto.',
        data:     [
            'id'             => $new_id,
            'estado'         => 'nuevo',
            'fecha_registro' => date('Y-m-d H:i:s'),
        ],
        httpCode: 200
    );

} catch (RuntimeException $e) {
    // Error de conexion — ya logueado en db.php
    json_response(false, 'No se pudo procesar tu solicitud. Intentalo de nuevo.', httpCode: 503);

} catch (PDOException $e) {
    // Error de SQL (restriccion de BD, query mal formada, etc.)
    error_log('[G-Calls Contactos] PDOException: ' . $e->getMessage());
    json_response(false, 'Error interno del servidor.', httpCode: 500);
}


// =============================================================================
// FUNCIONES AUXILIARES
// =============================================================================

/**
 * Emite una respuesta JSON estandarizada y termina la ejecucion.
 *
 * Estructura de respuesta:
 *   { "success": bool, "message": string, "data": mixed }
 *
 * @param bool        $success   Indica si la operacion fue exitosa.
 * @param string      $message   Mensaje legible para el cliente.
 * @param array|null  $data      Datos adicionales (errores, IDs, etc.).
 * @param int         $httpCode  Codigo de estado HTTP a enviar.
 */
function json_response(
    bool   $success,
    string $message,
    ?array $data     = null,
    int    $httpCode = 200
): never {
    http_response_code($httpCode);

    $body = [
        'success' => $success,
        'message' => $message,
    ];

    if ($data !== null) {
        // Si data contiene 'errors', lo anidamos directamente para mayor claridad
        if (isset($data['errors'])) {
            $body['errors'] = $data['errors'];
        } else {
            $body['data'] = $data;
        }
    }

    echo json_encode($body, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    exit;
}

/**
 * Sanitiza un string eliminando espacios extremos y etiquetas HTML.
 * Usa htmlspecialchars para prevenir XSS si el valor se refleja en HTML.
 *
 * @param mixed $value  Valor a sanitizar (se convierte a string internamente).
 * @return string       String limpio y seguro.
 */
function sanitize_string(mixed $value): string
{
    $str = trim((string) $value);
    // strip_tags elimina HTML/PHP; htmlspecialchars escapa caracteres especiales
    return htmlspecialchars(strip_tags($str), ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8');
}
