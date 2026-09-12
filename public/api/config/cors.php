<?php
/**
 * G-Calls S.A.S. — Cabeceras CORS
 *
 * Centraliza la politica de Cross-Origin Resource Sharing.
 * Incluye este archivo al inicio de cada endpoint de la API.
 *
 * Seguridad:
 *   - Solo permite origenes explicitamente listados en $allowed_origins.
 *   - Los metodos y cabeceras permitidos son los minimos necesarios.
 *   - Las solicitudes preflight (OPTIONS) se responden inmediatamente
 *     con 204 No Content para evitar llamadas innecesarias al backend.
 *
 * Uso:
 *   require_once __DIR__ . '/cors.php';
 *
 * PHP 8.0+
 */

declare(strict_types=1);

// ── Origenes permitidos ───────────────────────────────────────────────────────
// Agrega aqui los dominios de produccion y staging de G-Calls.
// Formato: 'https://dominio.com'  (sin barra final)
$allowed_origins = [
    'http://localhost:5173',   // Vite dev server (React/Vue)
    'http://localhost:3000',   // Node server local (server.js)
    'http://localhost:4173',   // Vite preview
    'https://gcalls.com.co',   // Produccion
    'https://www.gcalls.com.co',
];

// ── Validacion del origen de la solicitud ─────────────────────────────────────
$request_origin = $_SERVER['HTTP_ORIGIN'] ?? '';

if (in_array($request_origin, $allowed_origins, strict: true)) {
    // Origen autorizado: refleja el origen exacto (no '*') para soportar cookies
    header('Access-Control-Allow-Origin: ' . $request_origin);
    header('Vary: Origin');                         // Indica al cache que varie por origen
} else {
    // Origen no listado: no se envia cabecera Allow-Origin
    // El navegador bloqueara la solicitud por politica CORS
    // (Para APIs completamente publicas, sustituye por header('Access-Control-Allow-Origin: *'))
}

// ── Cabeceras de control CORS ─────────────────────────────────────────────────
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With');
header('Access-Control-Max-Age: 86400');            // Cache del preflight por 24 horas
header('Access-Control-Allow-Credentials: true');   // Permite envio de cookies / credenciales

// ── Tipo de contenido por defecto ─────────────────────────────────────────────
// Todos los endpoints de esta API responden JSON
header('Content-Type: application/json; charset=UTF-8');

// ── Manejo de solicitudes preflight (OPTIONS) ─────────────────────────────────
// El navegador envia OPTIONS antes de una solicitud real (POST, PUT, etc.)
// Respondemos inmediatamente con 204 y terminamos la ejecucion.
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);    // No Content
    exit;
}
