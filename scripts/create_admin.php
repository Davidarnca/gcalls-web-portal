<?php
/**
 * G-Calls S.A.S. — Script CLI: Creación segura de usuario administrativo
 *
 * Uso en terminal:
 *   php scripts/create_admin.php <email> [nombre] [rol]
 *
 * Ejemplo:
 *   php scripts/create_admin.php admin@gcalls.com "Admin Principal" admin
 *
 * Nota de seguridad:
 *   La contraseña se solicita de forma interactiva y oculta (sin eco en pantalla)
 *   durante la ejecución del script. Nunca se debe pasar como argumento CLI.
 *   La contraseña existe temporalmente en memoria como texto plano antes de ser
 *   entregada a password_hash(); la protección consiste en suprimir el eco visual
 *   y evitar la exposición en $argv o en el historial del shell.
 *
 * PHP 8.0+
 */

declare(strict_types=1);

// Protección estricta: Solo ejecutable desde línea de comandos (CLI)
if (php_sapi_name() !== 'cli') {
    http_response_code(403);
    echo "Acceso denegado. Este script solo puede ejecutarse mediante la línea de comandos (CLI).\n";
    exit(1);
}

require_once __DIR__ . '/../public/api/config/db.php';

// ---------------------------------------------------------------------------
// Detección defensiva del algoritmo efectivo de PASSWORD_DEFAULT
// Debe ejecutarse antes de cualquier interacción con el usuario o la BD.
// ---------------------------------------------------------------------------
try {
    $probe_hash = password_hash('', PASSWORD_DEFAULT);
} catch (Throwable $e) {
    fwrite(STDERR, "Error crítico: Fallo en el subsistema criptográfico: " . $e->getMessage() . "\n");
    exit(1);
}

if (!is_string($probe_hash) || $probe_hash === '') {
    fwrite(STDERR, "Error crítico: password_hash() no devolvió un hash válido para PASSWORD_DEFAULT.\n");
    exit(1);
}

$algo_info = password_get_info($probe_hash);

if (
    !is_array($algo_info)
    || empty($algo_info['algo'])
    || !isset($algo_info['algoName'])
    || !is_string($algo_info['algoName'])
    || $algo_info['algoName'] === ''
    || strtolower($algo_info['algoName']) === 'unknown'
) {
    fwrite(STDERR, "Error crítico: No fue posible identificar inequívocamente el algoritmo de PASSWORD_DEFAULT.\n");
    exit(1);
}

$algo_id     = $algo_info['algo'];
$algo_nombre = $algo_info['algoName'];

// El límite de 72 bytes aplica únicamente si el algoritmo efectivo es Bcrypt.
// Si en futuras versiones de PHP PASSWORD_DEFAULT cambia a otro algoritmo,
// $es_bcrypt será false y la restricción de 72 bytes no se impondrá.
$es_bcrypt = ($algo_id === PASSWORD_BCRYPT || strtolower($algo_nombre) === 'bcrypt');

// ---------------------------------------------------------------------------
// Validar argumentos CLI
// ---------------------------------------------------------------------------
if ($argc < 2) {
    echo "Uso:\n";
    echo "  php scripts/create_admin.php <email> [nombre] [rol]\n\n";
    echo "Parámetros:\n";
    echo "  email     (Obligatorio) Correo del usuario.\n";
    echo "  nombre    (Opcional) Nombre del usuario. Default: 'Administrador G-Calls'\n";
    echo "  rol       (Opcional) 'admin', 'editor' o 'viewer'. Default: 'admin'\n\n";
    echo "Nota: La contraseña se solicitará interactivamente sin mostrarse en pantalla.\n";
    exit(1);
}

if ($argc > 4) {
    fwrite(STDERR, "Error: Se proporcionaron demasiados argumentos.\n");
    fwrite(STDERR, "Por seguridad, la contraseña NO debe pasarse como argumento de línea de comandos.\n");
    fwrite(STDERR, "Uso: php scripts/create_admin.php <email> [nombre] [rol]\n");
    exit(1);
}

$email  = trim((string) $argv[1]);
$nombre = isset($argv[2]) && trim((string) $argv[2]) !== '' ? trim((string) $argv[2]) : 'Administrador G-Calls';
$rol    = isset($argv[3]) && trim((string) $argv[3]) !== '' ? trim((string) $argv[3]) : 'admin';

// Validaciones básicas de formato
if (filter_var($email, FILTER_VALIDATE_EMAIL) === false) {
    fwrite(STDERR, "Error: El email '{$email}' no tiene un formato válido.\n");
    exit(1);
}

$roles_permitidos = ['admin', 'editor', 'viewer'];
if (!in_array($rol, $roles_permitidos, strict: true)) {
    fwrite(STDERR, "Error: El rol '{$rol}' no es válido. Opciones: " . implode(', ', $roles_permitidos) . "\n");
    exit(1);
}

/**
 * Solicita una contraseña en la consola suprimiendo el eco visual.
 *
 * En Windows:
 *   Ejecuta PowerShell con -NoProfile para suprimir perfiles de inicio.
 *   Read-Host -AsSecureString captura la entrada sin imprimirla en pantalla.
 *   Para garantizar que no se pierdan espacios en blanco finales (dado que exec()
 *   en PHP elimina espacios finales de cada línea en su implementación interna),
 *   PowerShell codifica la contraseña capturada en Base64 sobre bytes UTF-8.
 *   La SecureString se convierte temporalmente a BSTR, se extrae en memoria,
 *   se codifica a Base64, se libera la SecureString con Dispose() y se pone a cero
 *   el BSTR con ZeroFreeBSTR().
 *   El descriptor de error (stderr) se redirige a NUL para aislar stdout:
 *   cualquier advertencia o error de PowerShell se descarta y nunca contamina
 *   la salida Base64. Si PowerShell falla, lo comunica mediante su código de salida.
 *   PHP valida el formato Base64 estricto y decodifica con base64_decode($valor, true),
 *   preservando exactamente todos los espacios iniciales, intermedios y finales.
 *
 *   Las contraseñas quedan estrictamente limitadas a una sola línea: la primera
 *   pulsación de Enter cierra la captura de Read-Host. Si se recibe más de una línea
 *   o un formato distinto al Base64 esperado, la captura se rechaza de inmediato.
 *
 *   exec() gestiona el ciclo de vida del subproceso internamente en C, liberando
 *   los handles del kernel al terminar. No se utilizan proc_open() ni proc_close()
 *   a fin de evitar los riesgos de bloqueo indefinido en WaitForSingleObject y
 *   la posibilidad de procesos huérfanos en Windows CLI.
 *
 *   Nota sobre Ctrl+C: al pertenecer PHP y el subproceso PowerShell al mismo
 *   Console Process Group de Windows, la señal CTRL_C_EVENT se propaga a ambos.
 *   Esto aplica en terminales Windows nativas; en emuladores de terceros el
 *   comportamiento puede variar.
 *
 * En POSIX (Linux/macOS):
 *   Utiliza 'stty -echo' respaldando la configuración original y restaurándola
 *   incondicionalmente mediante try/finally, incluso ante interrupciones.
 *   fgets(STDIN) se bloquea de forma nativa esperando la tecla Enter.
 *   Las contraseñas quedan también limitadas a una sola línea por este mecanismo.
 */
function prompt_silent_password(string $prompt): string
{
    echo $prompt;

    if (PHP_OS_FAMILY === 'Windows') {
        // PowerShell con -NoProfile. Se omite -NonInteractive para que
        // Read-Host pueda solicitar la contraseña de forma interactiva.
        // La contraseña se codifica en Base64 antes de emitirse a stdout para
        // evitar que PHP exec() recorte espacios en blanco finales.
        // En el bloque finally se liberan la SecureString (Dispose) y el BSTR (ZeroFreeBSTR).
        // stderr se redirige a NUL para aislar stdout de errores de PowerShell.
        $ps_cmd = 'powershell.exe -NoProfile -Command "'
            . '$p = Read-Host -AsSecureString; '
            . 'if ($p -ne $null) { '
            . '$b = [System.Runtime.InteropServices.Marshal]::SecureStringToBSTR($p); '
            . 'try { '
            . '$plain = [System.Runtime.InteropServices.Marshal]::PtrToStringBSTR($b); '
            . '$bytes = [System.Text.Encoding]::UTF8.GetBytes($plain); '
            . '[System.Convert]::ToBase64String($bytes) '
            . '} finally { '
            . '[System.Runtime.InteropServices.Marshal]::ZeroFreeBSTR($b); '
            . '$p.Dispose() '
            . '} }" 2>NUL';

        $output      = [];
        $result_code = 1;

        // exec() ejecuta de forma síncrona y libera los handles del proceso en C.
        // No se invoca proc_open() ni proc_close() para evitar bloqueos en Windows.
        exec($ps_cmd, $output, $result_code);

        echo "\n";

        if ($result_code !== 0) {
            fwrite(STDERR, "Error: No se pudo capturar la contraseña de forma segura (código: {$result_code}). Operación cancelada.\n");
            exit(1);
        }

        // Verificar cardinalidad: la captura debe producir exactamente una línea.
        // Cero líneas = cancelación o captura vacía; más de una = salida inesperada.
        if (count($output) === 0) {
            fwrite(STDERR, "Error: No se recibió entrada del proceso de captura. Operación cancelada.\n");
            exit(1);
        }

        if (count($output) !== 1) {
            fwrite(STDERR, "Error: Formato de captura inesperado (se recibieron " . count($output) . " líneas). Operación cancelada.\n");
            exit(1);
        }

        $b64_output = (string) $output[0];

        // Si la salida está vacía (por ejemplo, pulsar Enter sin ingresar caracteres)
        if ($b64_output === '') {
            return '';
        }

        // Validar formato Base64 estricto (alfanuméricos, +, /, y hasta dos =)
        if (!preg_match('/^[A-Za-z0-9+\/]+={0,2}$/', $b64_output)) {
            fwrite(STDERR, "Error: Formato de codificación inválido en la captura de contraseña. Operación cancelada.\n");
            exit(1);
        }

        // Decodificación estricta en Base64 y verificación canónica
        $decoded = base64_decode($b64_output, true);
        if ($decoded === false) {
            fwrite(STDERR, "Error: No se pudo decodificar la contraseña capturada. Operación cancelada.\n");
            exit(1);
        }

        if (base64_encode($decoded) !== $b64_output) {
            fwrite(STDERR, "Error: No se pudo decodificar la contraseña capturada. Operación cancelada.\n");
            exit(1);
        }

        return $decoded;

    } else {
        // Entornos POSIX (Linux, macOS)
        $orig_stty    = null;
        $check_output = [];
        $check_code   = 0;
        exec('stty -g 2>/dev/null', $check_output, $check_code);

        if ($check_code !== 0 || empty($check_output[0])) {
            fwrite(STDERR, "\nError: No se pudo verificar la configuración de la terminal para captura segura.\n");
            exit(1);
        }

        $orig_stty    = trim($check_output[0]);
        $disable_code = 0;
        exec('stty -echo 2>/dev/null', $check_output, $disable_code);

        if ($disable_code !== 0) {
            fwrite(STDERR, "\nError: No fue posible deshabilitar el eco de la terminal.\n");
            exit(1);
        }

        $raw_input = false;

        try {
            $raw_input = fgets(STDIN);
        } finally {
            $restore_code = 0;
            exec('stty ' . escapeshellarg($orig_stty) . ' 2>/dev/null', $check_output, $restore_code);
            if ($restore_code !== 0) {
                fwrite(STDERR, "\nAdvertencia: No se pudo restaurar automáticamente la configuración de la terminal.\n");
            }
        }

        echo "\n";

        if ($raw_input === false || $raw_input === null) {
            fwrite(STDERR, "Error: No se pudo leer la entrada de la consola. Operación cancelada.\n");
            exit(1);
        }

        // Eliminar exclusivamente el terminador de línea final (\r\n o \n)
        // introducido por la tecla Enter. Los espacios al inicio, en medio
        // y al final de la contraseña se preservan sin alteración.
        return preg_replace('/\r?\n$/D', '', (string) $raw_input) ?? '';
    }
}

try {
    $pdo = get_db_connection();

    // 1. Regla obligatoria: Comprobar existencia ANTES de solicitar la contraseña
    $check_stmt = $pdo->prepare('SELECT id FROM usuarios WHERE email = :email LIMIT 1');
    $check_stmt->execute([':email' => $email]);

    if ($check_stmt->fetchColumn() !== false) {
        fwrite(STDERR, "Error: El usuario con email '{$email}' ya existe. No se modificó el registro.\n");
        exit(1);
    }

    // 2. Captura interactiva y oculta de la contraseña
    $password = prompt_silent_password('Introduce la contraseña: ');

    if ($password === '') {
        fwrite(STDERR, "Error: La contraseña no puede estar vacía.\n");
        exit(1);
    }

    if (strlen($password) < 8) {
        fwrite(STDERR, "Error: La contraseña debe tener al menos 8 bytes.\n");
        exit(1);
    }

    // Límite máximo de 72 bytes, aplicado exclusivamente cuando el algoritmo
    // efectivo resuelto por PASSWORD_DEFAULT es Bcrypt. Bcrypt trunca silenciosamente
    // cualquier entrada que supere 72 bytes; este control previene ese truncamiento
    // sin alterar la contraseña. Si PASSWORD_DEFAULT cambia en futuras versiones de
    // PHP a un algoritmo sin esta restricción, el límite no se aplica.
    // En ningún caso se trunca la contraseña: si no cumple, se aborta.
    if ($es_bcrypt && strlen($password) > 72) {
        fwrite(STDERR, "Error: El algoritmo de hash efectivo ({$algo_nombre}) no admite contraseñas mayores a 72 bytes.\n");
        fwrite(STDERR, "Por favor utilice una contraseña de hasta 72 bytes para evitar truncamientos silenciosos del algoritmo.\n");
        exit(1);
    }

    // 3. Captura interactiva y oculta de la confirmación
    $password_confirm = prompt_silent_password('Confirma la contraseña: ');

    if ($password !== $password_confirm) {
        fwrite(STDERR, "Error: Las contraseñas no coinciden. No se modificó el registro.\n");
        exit(1);
    }

    // 4. Generar hash seguro utilizando PASSWORD_DEFAULT.
    //    PASSWORD_DEFAULT se apoya en el algoritmo predeterminado del runtime de PHP
    //    en ejecución; actualmente resuelve a Bcrypt en PHP 8.x, pero puede evolucionar
    //    en futuras versiones. El algoritmo efectivo se detecta dinámicamente al inicio.
    $password_hash = password_hash($password, PASSWORD_DEFAULT);

    if (!is_string($password_hash) || $password_hash === '') {
        fwrite(STDERR, "Error crítico: No se pudo generar el hash de la contraseña. Operación cancelada.\n");
        exit(1);
    }

    // 5. Inserción preparada (únicamente se ejecuta tras superar TODAS las validaciones)
    $insert_stmt = $pdo->prepare(
        'INSERT INTO usuarios (nombre, email, password_hash, rol, creado_en)
         VALUES (:nombre, :email, :password_hash, :rol, NOW())'
    );

    $insert_stmt->execute([
        ':nombre'        => $nombre,
        ':email'         => $email,
        ':password_hash' => $password_hash,
        ':rol'           => $rol,
    ]);

    $new_id = (int) $pdo->lastInsertId();

    // 6. Detección dinámica del algoritmo real utilizado para el reporte final
    $hash_info  = password_get_info($password_hash);
    $algo_final = (is_array($hash_info) && isset($hash_info['algoName']) && $hash_info['algoName'] !== '')
        ? $hash_info['algoName']
        : $algo_nombre;

    // 7. Salida limpia y segura (NUNCA imprimir la contraseña ni el hash completo)
    echo "==================================================\n";
    echo "✓ Usuario creado exitosamente\n";
    echo "==================================================\n";
    echo "ID:        {$new_id}\n";
    echo "Email:     {$email}\n";
    echo "Nombre:    {$nombre}\n";
    echo "Rol:       {$rol}\n";
    echo "Algoritmo: PASSWORD_DEFAULT ({$algo_final})\n";
    echo "==================================================\n";
    exit(0);

} catch (PDOException $e) {
    error_log('[G-Calls create_admin] PDOException: ' . $e->getMessage());
    fwrite(STDERR, "Error de base de datos: No se pudo completar el registro del usuario.\n");
    exit(1);
} catch (RuntimeException $e) {
    error_log('[G-Calls create_admin] RuntimeException: ' . $e->getMessage());
    fwrite(STDERR, "Error de conexión: No se pudo establecer la conexión con la base de datos.\n");
    exit(1);
}
