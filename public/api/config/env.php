<?php
/**
 * G-Calls S.A.S. — Cargador de variables de entorno desde .env
 *
 * Lee el archivo .env ubicado en la raiz del proyecto e inyecta las claves
 * en $_ENV, respetando la siguiente prioridad (de mayor a menor):
 *
 *   1. $_ENV      — variable ya definida en el proceso PHP
 *   2. $_SERVER   — variable inyectada por el servidor web (Apache/Nginx)
 *   3. getenv()   — variable definida en el entorno del sistema operativo
 *   4. .env       — valor de este archivo (solo si las fuentes anteriores no lo tienen)
 *
 * Una variable definida con valor vacio ('') en cualquiera de las tres fuentes
 * superiores se considera explicitamente configurada y NO sera sobrescrita.
 *
 * Formato admitido de .env:
 *   - Lineas KEY=VALUE  (sin espacios alrededor de '=')
 *   - Lineas vacias     (ignoradas)
 *   - Comentarios       (# debe ser el primer caracter no-espacio de la linea)
 *   - Comillas          (envolventes "..." o '...' se eliminan del valor;
 *                        el contenido interno no se procesa para escapes)
 *   - '=' en el valor   (solo se divide en la primera '='; el resto es parte del valor)
 *   - '#' en el valor   (preservado; solo el '#' inicial de linea es comentario)
 *
 * Lo que este parser NO hace:
 *   - No expande variables ($OTRA dentro de un valor queda literal)
 *   - No interpreta secuencias de escape (\n, \\, \")
 *   - No soporta 'export KEY=VALUE' ni sintaxis heredoc
 *
 * Comportamiento ante errores:
 *   - .env no existe   → continua sin error (caso produccion normal)
 *   - .env no legible  → error_log con mensaje generico; retorna sin asignar
 *
 * PHP 8.0+
 */

declare(strict_types=1);

(static function (): void {

    // ── Ruta al .env en la raiz del proyecto ─────────────────────────────────
    // __DIR__ = .../public/api/config  →  dirname x3 = raiz del proyecto
    $env_path = dirname(__DIR__, 3) . DIRECTORY_SEPARATOR . '.env';

    // ── Si no existe, no hay nada que cargar (produccion usa entorno del SO) ──
    if (!is_file($env_path)) {
        return;
    }

    // ── Abrir para lectura ────────────────────────────────────────────────────
    $handle = @fopen($env_path, 'r');

    if ($handle === false) {
        error_log(
            '[G-Calls env] No se pudo leer el archivo de configuracion local. ' .
            'Verifica los permisos del archivo .env.'
        );
        return;
    }

    // ── Parsear linea a linea ─────────────────────────────────────────────────
    while (($line = fgets($handle)) !== false) {

        $line = trim($line);

        // Ignorar lineas vacias
        if ($line === '') {
            continue;
        }

        // Ignorar comentarios (el '#' debe ser el primer caracter)
        if ($line[0] === '#') {
            continue;
        }

        // Ignorar lineas sin '='
        $eq_pos = strpos($line, '=');
        if ($eq_pos === false) {
            continue;
        }

        // Separar clave y valor en la primera '=' unicamente
        $key   = trim(substr($line, 0, $eq_pos));
        $value = trim(substr($line, $eq_pos + 1));

        // Ignorar claves vacias
        if ($key === '') {
            continue;
        }

        // Eliminar comillas envolventes si el primer y ultimo caracter coinciden
        $len = strlen($value);
        if ($len >= 2) {
            $first = $value[0];
            $last  = $value[$len - 1];
            if (($first === '"' && $last === '"') || ($first === "'" && $last === "'")) {
                $value = substr($value, 1, $len - 2);
            }
        }

        // ── Respetar prioridad: solo asignar si ninguna fuente superior lo tiene ──
        // Usa array_key_exists para detectar claves con valor vacio en $_ENV/$_SERVER,
        // y getenv() !== false para detectar variables del sistema operativo (vacias o no).
        if (array_key_exists($key, $_ENV)) {
            continue;
        }
        if (array_key_exists($key, $_SERVER)) {
            continue;
        }
        if (getenv($key) !== false) {
            continue;
        }

        $_ENV[$key] = $value;
    }

    fclose($handle);

})();
