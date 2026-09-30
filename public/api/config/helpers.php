<?php
/**
 * G-Calls S.A.S. — Utilidades transversales de API
 *
 * Funciones auxiliares estandarizadas para respuestas JSON
 * y procesamiento de datos de entrada en endpoints REST.
 *
 * PHP 8.0+
 */

declare(strict_types=1);

/**
 * Emite una respuesta JSON estandarizada y termina la ejecución.
 *
 * Estructura de respuesta:
 *   { "success": bool, "message": string, "data": mixed }
 * o si contiene errores de validación:
 *   { "success": false, "message": string, "errors": array }
 *
 * @param bool        $success   Indica si la operación fue exitosa.
 * @param string      $message   Mensaje legible para el cliente.
 * @param array|null  $data      Datos adicionales o errores.
 * @param int         $httpCode  Código de estado HTTP.
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
 * Lee y decodifica el cuerpo de la solicitud JSON crudo (php://input).
 * Si no es un JSON válido o no es un arreglo asociativo, emite HTTP 400 y finaliza.
 *
 * @return array  Payload decodificado asociativo.
 */
function get_json_input(): array
{
    $raw_body = file_get_contents('php://input');

    if ($raw_body === false || trim($raw_body) === '') {
        json_response(false, 'El cuerpo de la solicitud no puede estar vacío.', httpCode: 400);
    }

    try {
        $payload = json_decode($raw_body, associative: true, flags: JSON_THROW_ON_ERROR);
    } catch (JsonException) {
        json_response(false, 'El cuerpo de la solicitud debe ser JSON válido.', httpCode: 400);
    }

    if (!is_array($payload)) {
        json_response(false, 'El JSON proporcionado debe ser un objeto válido.', httpCode: 400);
    }

    return $payload;
}
