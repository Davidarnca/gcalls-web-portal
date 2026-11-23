<?php

declare(strict_types=1);

/**
 * /api/admin/medios.php
 *
 * POST (multipart/form-data) → sube una imagen (admin, editor). Exige X-CSRF-Token.
 *   archivo  la imagen (JPG, PNG o WebP; máximo 5 MB o el límite del PHP del hosting si es menor)
 *   uso      logo | favicon | compartir | foto
 *
 * La imagen se regenera y se guarda fuera de public_html; la respuesta trae el nombre
 * que el panel guarda luego en el contenido (sección o servicio).
 *
 * 201 → { success, message, data: { archivo, ancho, alto, bytes } }
 * 400 → { errors: { archivo | uso } } · 401/403 → sesión, rol o CSRF · 405 → método
 */

require_once __DIR__ . '/../config/cors.php';
require_once __DIR__ . '/../config/helpers.php';
require_once __DIR__ . '/../config/auth.php';
require_once __DIR__ . '/../config/medios.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    json_response(false, 'Método no permitido. Usa POST.', httpCode: 405);
}

require_auth(['admin', 'editor']);

if (!validate_csrf_token()) {
    json_response(false, 'Token CSRF inválido o ausente.', httpCode: 403);
}

// Si el cuerpo supera post_max_size, PHP descarta $_POST y $_FILES por completo
if ($_POST === [] && $_FILES === [] && (int) ($_SERVER['CONTENT_LENGTH'] ?? 0) > 0) {
    json_response(false, medios_mensaje_peso(), ['errors' => ['archivo' => medios_mensaje_peso()]], 400);
}

$uso = $_POST['uso'] ?? '';
if (!is_string($uso) || !array_key_exists($uso, MEDIOS_USOS)) {
    json_response(false, 'Uso de imagen no válido.', ['errors' => ['uso' => 'Uso de imagen no válido.']], 400);
}

$archivo = $_FILES['archivo'] ?? null;
if (!is_array($archivo) || is_array($archivo['name'] ?? null)) {
    json_response(false, 'No se recibió ninguna imagen.', ['errors' => ['archivo' => 'No se recibió ninguna imagen.']], 400);
}

[$resultado, $error] = medio_guardar_subida($archivo, $uso);

if ($error !== null) {
    json_response(false, $error, ['errors' => ['archivo' => $error]], 400);
}

json_response(true, 'Imagen subida.', $resultado, 201);
