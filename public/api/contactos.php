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

// ── Bootstrap ────────────────────────────────────────────────────────────────
require_once __DIR__ . '/config/cors.php';   // Cabeceras CORS + preflight guard
require_once __DIR__ . '/config/db.php';     // get_db_connection()
require_once __DIR__ . '/config/helpers.php'; // json_response() y utilidades común

// ── Solo aceptamos POST ──────────────────────────────────────────────────────
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    json_response(false, 'Metodo no permitido. Usa POST.', httpCode: 405);
}

// ── Lectura del body JSON ────────────────────────────────────────────────────
$raw_body = file_get_contents('php://input');

// Comprobar que la raíz del JSON sea un objeto {} y no una lista [] u otro tipo
$raw_decoded = json_decode($raw_body);
if (!is_object($raw_decoded)) {
    json_response(false, 'El cuerpo de la solicitud debe ser un objeto JSON valido.', httpCode: 400);
}

$payload = json_decode($raw_body, associative: true);

if (!is_array($payload)) {
    json_response(false, 'El cuerpo de la solicitud debe ser JSON valido.', httpCode: 400);
}

// ── Validacion y sanitizacion ────────────────────────────────────────────────
$errors = [];

// --- nombre (obligatorio, string) ---
if (!array_key_exists('nombre', $payload) || $payload['nombre'] === null) {
    $errors['nombre'] = 'El nombre es obligatorio.';
} elseif (!is_string($payload['nombre'])) {
    $errors['nombre'] = 'El nombre debe ser una cadena de texto.';
} else {
    $nombre = sanitize_string($payload['nombre']);
    if ($nombre === '') {
        $errors['nombre'] = 'El nombre es obligatorio.';
    } elseif (mb_strlen($nombre) > 120) {
        $errors['nombre'] = 'El nombre no puede superar los 120 caracteres.';
    }
}

// --- email (obligatorio, string, formato valido) ---
if (!array_key_exists('email', $payload) || $payload['email'] === null) {
    $errors['email'] = 'Debes proporcionar un email valido.';
} elseif (!is_string($payload['email'])) {
    $errors['email'] = 'El email debe ser una cadena de texto.';
} else {
    $email_raw = trim($payload['email']);
    $email     = filter_var($email_raw, FILTER_VALIDATE_EMAIL);
    if ($email === false || $email === '') {
        $errors['email'] = 'Debes proporcionar un email valido.';
    } elseif (mb_strlen($email) > 180) {
        $errors['email'] = 'El email no puede superar los 180 caracteres.';
    }
}

// --- empresa (opcional, string|null) ---
$empresa = null;
if (array_key_exists('empresa', $payload) && $payload['empresa'] !== null) {
    if (!is_string($payload['empresa'])) {
        $errors['empresa'] = 'El nombre de la empresa debe ser una cadena de texto.';
    } else {
        $empresa_sanitized = sanitize_string($payload['empresa']);
        $empresa = $empresa_sanitized !== '' ? $empresa_sanitized : null;
        if ($empresa !== null && mb_strlen($empresa) > 180) {
            $errors['empresa'] = 'El nombre de la empresa no puede superar los 180 caracteres.';
        }
    }
}

// --- telefono (opcional, string|null) ---
$telefono = null;
if (array_key_exists('telefono', $payload) && $payload['telefono'] !== null) {
    if (!is_string($payload['telefono'])) {
        $errors['telefono'] = 'El telefono debe ser una cadena de texto.';
    } else {
        $telefono_sanitized = sanitize_string($payload['telefono']);
        $telefono = $telefono_sanitized !== '' ? $telefono_sanitized : null;
        if ($telefono !== null) {
            if (!preg_match('/^[+\d\s\-().]{6,30}$/', $telefono)) {
                $errors['telefono'] = 'El telefono tiene un formato invalido.';
            }
        }
    }
}

// --- servicio_interes (opcional, entero positivo >= 1 y <= 4294967295) ---
$servicio_interes = null;
if (array_key_exists('servicio_interes', $payload) && $payload['servicio_interes'] !== null && $payload['servicio_interes'] !== '') {
    $raw_servicio = $payload['servicio_interes'];
    $es_valido     = false;
    $id_candidato  = null;

    if (is_int($raw_servicio)) {
        if ($raw_servicio >= 1 && $raw_servicio <= 4294967295) {
            $es_valido    = true;
            $id_candidato = $raw_servicio;
        }
    } elseif (is_string($raw_servicio)) {
        // Valida cadena puramente canonica: primer digito 1-9, sin ceros iniciales ni caracteres no numericos
        if (preg_match('/^[1-9]\d*$/', $raw_servicio)) {
            $len = strlen($raw_servicio);
            // 4294967295 tiene 10 digitos. Si tiene < 10 digitos esta en rango.
            // Si tiene 10 digitos, se verifica que no supere '4294967295' antes de convertir a int.
            if ($len < 10 || ($len === 10 && strcmp($raw_servicio, '4294967295') <= 0)) {
                $es_valido    = true;
                $id_candidato = (int) $raw_servicio;
            }
        }
    }

    if (!$es_valido || $id_candidato === null) {
        $errors['servicio_interes'] = 'El servicio de interes debe ser un ID entero positivo.';
    } else {
        $servicio_interes = $id_candidato;
    }
}

// --- mensaje (opcional, string|null) ---
$mensaje = null;
if (array_key_exists('mensaje', $payload) && $payload['mensaje'] !== null) {
    if (!is_string($payload['mensaje'])) {
        $errors['mensaje'] = 'El mensaje debe ser una cadena de texto.';
    } else {
        $mensaje_sanitized = sanitize_string($payload['mensaje']);
        $mensaje = $mensaje_sanitized !== '' ? $mensaje_sanitized : null;
        if ($mensaje !== null && mb_strlen($mensaje) > 5000) {
            $errors['mensaje'] = 'El mensaje no puede superar los 5000 caracteres.';
        }
    }
}

// ── Respuesta temprana si hay errores de validacion ──────────────────────────
if (!empty($errors)) {
    json_response(
        success: false,
        message: 'Los datos enviados contienen errores. Por favor revisalos.',
        data:    ['errors' => $errors],
        httpCode: 400
    );
}

// ── Operaciones en base de datos ─────────────────────────────────────────────
try {
    $pdo = get_db_connection();

    // Verificación de servicio existente (si se envió)
    if ($servicio_interes !== null) {
        $stmtServicio = $pdo->prepare(
            'SELECT id FROM servicios WHERE id = :id AND activo = 1 LIMIT 1'
        );
        $stmtServicio->execute([':id' => $servicio_interes]);

        if ($stmtServicio->fetchColumn() === false) {
            // Servicio no existe o está inactivo — no bloqueamos el lead,
            // simplemente ignoramos el servicio para no perder el contacto
            $servicio_interes = null;
        }
    }

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

    $stmtFecha = $pdo->prepare(
        'SELECT fecha_registro FROM contactos_leads WHERE id = :id'
    );
    $stmtFecha->execute([':id' => $new_id]);
    $fechaRegistro = $stmtFecha->fetchColumn();

    // Loguea el nuevo lead (util en desarrollo y para auditoria basica)
    error_log("[G-Calls] Nuevo lead registrado — ID: {$new_id}, Email: {$email}");

    json_response(
        success:  true,
        message:  '¡Gracias por contactarnos! Nos pondremos en contacto contigo pronto.',
        data:     [
            'id'             => $new_id,
            'estado'         => 'nuevo',
            'fecha_registro' => $fechaRegistro,
        ],
        httpCode: 200
    );

} catch (PDOException $e) {
    // Error de SQL (restriccion de BD, query mal formada, fallo técnico en MySQL, etc.)
    error_log('[G-Calls Contactos] PDOException: ' . $e->getMessage());
    json_response(false, 'Error interno del servidor.', httpCode: 500);

} catch (RuntimeException $e) {
    // Error de conexion lanzado por get_db_connection() — ya logueado en db.php
    json_response(false, 'No se pudo procesar tu solicitud. Intentalo de nuevo.', httpCode: 503);
}


// =============================================================================
// FUNCIONES AUXILIARES ESPECÍFICAS
// =============================================================================

/**
 * Sanitiza un string para su almacenamiento seguro.
 * Elimina espacios en blanco al inicio y al final, conservando los
 * caracteres legítimos originales sin transformarlos a entidades HTML.
 * El escapado contra XSS se delega a la capa de presentación HTML.
 *
 * @param string $value  Cadena a sanitizar.
 * @return string        String con trim exterior y caracteres originales preservados.
 */
function sanitize_string(string $value): string
{
    return trim($value);
}
