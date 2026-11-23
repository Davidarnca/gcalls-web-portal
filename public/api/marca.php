<?php

declare(strict_types=1);

/**
 * /api/marca.php?tipo=favicon | compartir
 *
 * Ícono de la pestaña y vista previa al compartir el sitio (WhatsApp, LinkedIn, etc.).
 * index.html apunta aquí porque esos lectores no ejecutan JavaScript: la imagen
 * configurada en el panel (Contenidos → Identidad) tiene que salir del servidor.
 *
 * Si no hay imagen configurada, o la base de datos no responde, entrega la imagen por
 * defecto de la carpeta pública (/favicon.png, /og-image.jpg). Nunca falla con error.
 */

require_once __DIR__ . '/config/db.php';
require_once __DIR__ . '/config/contenidos.php';
require_once __DIR__ . '/config/medios.php';

const MARCA_TIPOS = [
    'favicon'   => ['campo' => 'favicon',   'defecto' => 'favicon.png',  'tipo' => 'image/png'],
    'compartir' => ['campo' => 'compartir', 'defecto' => 'og-image.jpg', 'tipo' => 'image/jpeg'],
];

$tipo = $_GET['tipo'] ?? '';
if (!is_string($tipo) || !array_key_exists($tipo, MARCA_TIPOS)) {
    http_response_code(404);
    header('Content-Type: text/plain; charset=UTF-8');
    echo 'No encontrado.';
    exit;
}
$conf = MARCA_TIPOS[$tipo];

try {
    $identidad = obtener_contenido(get_db_connection(), 'identidad')['datos'];
    $nombre = $identidad[$conf['campo']] ?? '';
    $ruta = is_string($nombre) && $nombre !== '' ? medio_ruta($nombre) : null;
    if ($ruta !== null) {
        // Cache corta: si el cliente cambia la imagen, se nota en una hora como máximo
        medio_enviar($ruta, medio_content_type($nombre), 3600, false);
    }
} catch (Throwable $e) {
    error_log('[marca] ' . $e->getMessage());
}

$defecto = dirname(__DIR__) . DIRECTORY_SEPARATOR . $conf['defecto'];
if (!is_file($defecto)) {
    http_response_code(404);
    header('Content-Type: text/plain; charset=UTF-8');
    echo 'No encontrado.';
    exit;
}
medio_enviar($defecto, $conf['tipo'], 3600, false);
