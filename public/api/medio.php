<?php

declare(strict_types=1);

/**
 * /api/medio.php?f=foto-<32 hex>.webp
 *
 * Entrega una imagen subida desde el panel. Público y sin base de datos.
 * Solo acepta nombres generados por el servidor (ver config/medios.php): nada de
 * rutas, puntos ni otras extensiones. Como cada nombre es único, se cachea un año.
 */

require_once __DIR__ . '/config/medios.php';

if ($_SERVER['REQUEST_METHOD'] !== 'GET' && $_SERVER['REQUEST_METHOD'] !== 'HEAD') {
    http_response_code(405);
    header('Allow: GET, HEAD');
    exit;
}

$nombre = $_GET['f'] ?? '';
$ruta = is_string($nombre) ? medio_ruta($nombre) : null;

if ($ruta === null) {
    http_response_code(404);
    header('Content-Type: text/plain; charset=UTF-8');
    header('X-Content-Type-Options: nosniff');
    header('Cache-Control: no-store');
    echo 'Imagen no encontrada.';
    exit;
}

medio_enviar($ruta, medio_content_type($nombre), 31536000, true);
