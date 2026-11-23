<?php

declare(strict_types=1);

require_once __DIR__ . '/db.php'; // env()

/**
 * Imágenes subidas desde el panel ("medios").
 *
 * Seguridad:
 *  - Solo JPG, PNG y WebP (detectados por contenido, no por extensión). Nunca SVG:
 *    puede llevar código.
 *  - Cada imagen se vuelve a generar con GD: se descartan metadatos (EXIF, GPS) y
 *    cualquier contenido escondido en el archivo original.
 *  - Nombre aleatorio con el uso como prefijo: "foto-<32 hex>.webp". El nombre nunca
 *    viene del usuario.
 *  - Se guardan FUERA de public_html (igual que el .env) y se entregan con
 *    /api/medio.php, que solo acepta nombres con el formato anterior. Así nada subido
 *    se puede ejecutar y el despliegue por FTP nunca los borra.
 *
 * Carpeta: MEDIOS_DIR del .env o, por defecto, <raíz del proyecto>/storage/medios.
 * En el hosting, la "raíz" es la carpeta que contiene public_html.
 */

/** Usos permitidos: tamaño máximo de salida, formato y si se recorta. */
const MEDIOS_USOS = [
    // Logos: conservan transparencia.
    'logo'      => ['ancho' => 1200, 'alto' => 600,  'formato' => 'webp', 'recorte' => false],
    // Ícono de la pestaña: cuadrado con fondo transparente.
    'favicon'   => ['ancho' => 192,  'alto' => 192,  'formato' => 'png',  'recorte' => false, 'cuadrado' => true],
    // Vista previa al compartir (WhatsApp, LinkedIn, Facebook): 1200 x 630, JPG.
    'compartir' => ['ancho' => 1200, 'alto' => 630,  'formato' => 'jpg',  'recorte' => true],
    // Fotos de fondo (banner, servicios) y futuras fotos de equipo.
    'foto'      => ['ancho' => 2400, 'alto' => 2400, 'formato' => 'webp', 'recorte' => false],
];

const MEDIOS_MAX_BYTES       = 5 * 1024 * 1024;  // tamaño del archivo recibido
const MEDIOS_MAX_LADO        = 8000;              // píxeles por lado del original
const MEDIOS_MAX_MEGAPIXELES = 40;                // evita "bombas" de descompresión
const MEDIOS_MIME            = ['image/jpeg', 'image/png', 'image/webp'];
const MEDIOS_PATRON          = '/^(logo|favicon|compartir|foto)-[a-f0-9]{32}\.(webp|png|jpg)$/';
const MEDIOS_CONTENT_TYPE    = ['webp' => 'image/webp', 'png' => 'image/png', 'jpg' => 'image/jpeg'];

/** Bytes de una directiva de php.ini ("2M", "512K", "8388608"). */
function medios_ini_bytes(string $directiva): int
{
    $v = trim((string) ini_get($directiva));
    if ($v === '' || $v === '0' || $v === '-1') {
        return PHP_INT_MAX;
    }
    $n = (int) $v;
    return match (strtolower(substr($v, -1))) {
        'g' => $n * 1024 ** 3,
        'm' => $n * 1024 ** 2,
        'k' => $n * 1024,
        default => $n,
    };
}

/** Límite real de subida: el menor entre el de la app y los del servidor PHP. */
function medios_limite_bytes(): int
{
    return min(MEDIOS_MAX_BYTES, medios_ini_bytes('upload_max_filesize'), medios_ini_bytes('post_max_size'));
}

/** Mensaje de "pesa demasiado" con el límite efectivo. */
function medios_mensaje_peso(): string
{
    $mb = medios_limite_bytes() / (1024 * 1024);
    return 'La imagen pesa demasiado. Máximo ' . rtrim(rtrim(number_format($mb, 1, ',', ''), '0'), ',') . ' MB.';
}

function medios_dir(): string
{
    $dir = env('MEDIOS_DIR');
    return rtrim($dir !== '' ? $dir : dirname(__DIR__, 3) . '/storage/medios', '/\\');
}

/** Indica si el nombre tiene el formato de un medio (no comprueba que exista). */
function medio_nombre_valido(string $nombre, ?string $uso = null): bool
{
    if (!preg_match(MEDIOS_PATRON, $nombre, $m)) {
        return false;
    }
    return $uso === null || $m[1] === $uso;
}

/** Ruta del archivo si el nombre es válido y existe; si no, null. */
function medio_ruta(string $nombre): ?string
{
    if (!medio_nombre_valido($nombre)) {
        return null;
    }
    $ruta = medios_dir() . DIRECTORY_SEPARATOR . $nombre;
    return is_file($ruta) ? $ruta : null;
}

/** Content-Type según la extensión de un nombre válido. */
function medio_content_type(string $nombre): string
{
    return MEDIOS_CONTENT_TYPE[pathinfo($nombre, PATHINFO_EXTENSION)] ?? 'application/octet-stream';
}

/**
 * Envía un archivo de imagen y termina. Cabeceras pensadas para que el navegador
 * nunca lo interprete como otra cosa.
 */
function medio_enviar(string $ruta, string $contentType, int $cacheSegundos, bool $inmutable): never
{
    header_remove('Access-Control-Allow-Origin');
    header('Content-Type: ' . $contentType);
    header('Content-Length: ' . (string) filesize($ruta));
    header('X-Content-Type-Options: nosniff');
    header("Content-Security-Policy: default-src 'none'; sandbox");
    header('Cross-Origin-Resource-Policy: same-site');
    header('Cache-Control: public, max-age=' . $cacheSegundos . ($inmutable ? ', immutable' : ''));
    readfile($ruta);
    exit;
}

/**
 * Valida, regenera y guarda una imagen subida.
 *
 * @param  array<string, mixed> $archivo  Elemento de $_FILES
 * @return array{0: ?array{archivo: string, ancho: int, alto: int, bytes: int}, 1: ?string}  [resultado, error]
 */
function medio_guardar_subida(array $archivo, string $uso): array
{
    if (!array_key_exists($uso, MEDIOS_USOS)) {
        return [null, 'Uso de imagen no válido.'];
    }
    if (!extension_loaded('gd')) {
        error_log('[medios] La extensión GD de PHP no está activa.');
        return [null, 'El servidor no puede procesar imágenes en este momento.'];
    }

    $codigo = $archivo['error'] ?? UPLOAD_ERR_NO_FILE;
    if ($codigo === UPLOAD_ERR_INI_SIZE || $codigo === UPLOAD_ERR_FORM_SIZE) {
        return [null, medios_mensaje_peso()];
    }
    if ($codigo !== UPLOAD_ERR_OK || !is_string($archivo['tmp_name'] ?? null) || !is_uploaded_file($archivo['tmp_name'])) {
        return [null, 'No se recibió ninguna imagen.'];
    }

    $tmp = $archivo['tmp_name'];
    $bytes = (int) filesize($tmp);
    if ($bytes <= 0 || $bytes > medios_limite_bytes()) {
        return [null, medios_mensaje_peso()];
    }

    // Tipo real según el contenido del archivo
    $mime = (new finfo(FILEINFO_MIME_TYPE))->file($tmp);
    if (!in_array($mime, MEDIOS_MIME, true)) {
        return [null, 'Formato no permitido. Usa una imagen JPG, PNG o WebP.'];
    }

    // Dimensiones antes de decodificar (protege la memoria del servidor)
    $info = @getimagesize($tmp);
    if ($info === false || $info['mime'] !== $mime) {
        return [null, 'El archivo no es una imagen válida.'];
    }
    [$ancho, $alto] = $info;
    if ($ancho < 1 || $alto < 1 || $ancho > MEDIOS_MAX_LADO || $alto > MEDIOS_MAX_LADO
        || $ancho * $alto > MEDIOS_MAX_MEGAPIXELES * 1_000_000) {
        return [null, 'La imagen es demasiado grande. Máximo ' . MEDIOS_MAX_LADO . ' píxeles por lado.'];
    }

    $origen = match ($mime) {
        'image/jpeg' => @imagecreatefromjpeg($tmp),
        'image/png'  => @imagecreatefrompng($tmp),
        'image/webp' => function_exists('imagecreatefromwebp') ? @imagecreatefromwebp($tmp) : false,
    };
    if ($origen === false) {
        return [null, 'No se pudo leer la imagen. Prueba con otro archivo.'];
    }

    if ($mime === 'image/jpeg') {
        $origen = medio_corregir_orientacion($origen, $tmp);
    }

    $destino = medio_redimensionar($origen, MEDIOS_USOS[$uso]);
    imagedestroy($origen);

    return medio_escribir($destino, $uso);
}

/** Aplica la orientación EXIF de las fotos de celular (si PHP tiene exif). */
function medio_corregir_orientacion(GdImage $img, string $ruta): GdImage
{
    if (!function_exists('exif_read_data')) {
        return $img;
    }
    $exif = @exif_read_data($ruta);
    $angulo = match ((int) ($exif['Orientation'] ?? 1)) {
        3 => 180,
        6 => -90,
        8 => 90,
        default => 0,
    };
    if ($angulo === 0) {
        return $img;
    }
    $rotada = imagerotate($img, $angulo, 0);
    if ($rotada === false) {
        return $img;
    }
    imagedestroy($img);
    return $rotada;
}

/**
 * Ajusta la imagen al uso: reduce sin agrandar, recorta (cover) o la centra en un
 * cuadrado transparente.
 *
 * @param array<string, mixed> $u
 */
function medio_redimensionar(GdImage $img, array $u): GdImage
{
    $w = imagesx($img);
    $h = imagesy($img);

    if (!empty($u['recorte'])) {
        // Cubre exactamente ancho x alto, recortando lo que sobra (centrado)
        $escala = max($u['ancho'] / $w, $u['alto'] / $h);
        $srcW = (int) round($u['ancho'] / $escala);
        $srcH = (int) round($u['alto'] / $escala);
        $lienzo = medio_lienzo($u['ancho'], $u['alto'], false);
        imagecopyresampled($lienzo, $img, 0, 0, (int) (($w - $srcW) / 2), (int) (($h - $srcH) / 2),
            $u['ancho'], $u['alto'], $srcW, $srcH);
        return $lienzo;
    }

    $escala = min(1, $u['ancho'] / $w, $u['alto'] / $h);
    $nw = max(1, (int) round($w * $escala));
    $nh = max(1, (int) round($h * $escala));

    if (!empty($u['cuadrado'])) {
        $lado = max($nw, $nh);
        $lienzo = medio_lienzo($lado, $lado, true);
        imagecopyresampled($lienzo, $img, (int) (($lado - $nw) / 2), (int) (($lado - $nh) / 2), 0, 0, $nw, $nh, $w, $h);
        return $lienzo;
    }

    $lienzo = medio_lienzo($nw, $nh, true);
    imagecopyresampled($lienzo, $img, 0, 0, 0, 0, $nw, $nh, $w, $h);
    return $lienzo;
}

function medio_lienzo(int $w, int $h, bool $transparente): GdImage
{
    $lienzo = imagecreatetruecolor($w, $h);
    if ($transparente) {
        imagealphablending($lienzo, false);
        imagesavealpha($lienzo, true);
        // Sin mezcla: la copia conserva el canal alfa del original tal cual
        imagefill($lienzo, 0, 0, imagecolorallocatealpha($lienzo, 0, 0, 0, 127));
    } else {
        imagefill($lienzo, 0, 0, imagecolorallocate($lienzo, 255, 255, 255));
    }
    return $lienzo;
}

/**
 * @return array{0: ?array{archivo: string, ancho: int, alto: int, bytes: int}, 1: ?string}
 */
function medio_escribir(GdImage $img, string $uso): array
{
    $formato = MEDIOS_USOS[$uso]['formato'];
    if ($formato === 'webp' && !function_exists('imagewebp')) {
        $formato = 'png'; // hosting sin soporte WebP: PNG conserva la transparencia
    }

    $dir = medios_dir();
    if (!is_dir($dir) && !@mkdir($dir, 0755, true) && !is_dir($dir)) {
        error_log('[medios] No se pudo crear la carpeta ' . $dir);
        imagedestroy($img);
        return [null, 'No se pudo guardar la imagen.'];
    }

    $nombre = $uso . '-' . bin2hex(random_bytes(16)) . '.' . $formato;
    $ruta = $dir . DIRECTORY_SEPARATOR . $nombre;

    imagesavealpha($img, true);
    $ok = match ($formato) {
        'webp' => imagewebp($img, $ruta, 82),
        'png'  => imagepng($img, $ruta, 9),
        'jpg'  => imagejpeg($img, $ruta, 85),
    };
    $ancho = imagesx($img);
    $alto = imagesy($img);
    imagedestroy($img);

    if (!$ok || !is_file($ruta)) {
        error_log('[medios] No se pudo escribir ' . $ruta);
        return [null, 'No se pudo guardar la imagen.'];
    }

    return [['archivo' => $nombre, 'ancho' => $ancho, 'alto' => $alto, 'bytes' => (int) filesize($ruta)], null];
}
