<?php
declare(strict_types=1);

/**
 * scripts/seed_servicios.php
 *
 * Carga inicial idempotente del catálogo de servicios de G-Calls.
 *
 * Uso: php scripts/seed_servicios.php
 *
 * Flujo:
 *   1. Guardia CLI
 *   2. Verificación de motor InnoDB
 *   3. Inspección previa (fuera de TX): detecta títulos incompatibles y servicios inactivos
 *   4. Transacción atómica con SELECT … FOR UPDATE + revalidación + INSERT
 *   5. Verificación pre-COMMIT y reporte
 */

// ---------------------------------------------------------------------------
// 1. Guardia CLI
// ---------------------------------------------------------------------------
if (PHP_SAPI !== 'cli') {
    http_response_code(403);
    exit('Este script solo puede ejecutarse por CLI.');
}

// ---------------------------------------------------------------------------
// Dependencias
// ---------------------------------------------------------------------------
require_once __DIR__ . '/../public/api/config/db.php';

// ---------------------------------------------------------------------------
// Catálogo aprobado
// ---------------------------------------------------------------------------
$servicios_aprobados = [
    [
        'slug'              => 'supply-chain-management',
        'titulo'            => 'Cadena de Abastecimiento Inteligente',
        'descripcion_corta' => '',
        'color_accent'      => '#0057B7',
        'icono'             => '',
        'activo'            => 1,
    ],
    [
        'slug'              => 'gestion-ambiental-sostenibilidad',
        'titulo'            => 'Gestión Ambiental y Sostenibilidad (ESG)',
        'descripcion_corta' => '',
        'color_accent'      => '#0057B7',
        'icono'             => '',
        'activo'            => 1,
    ],
    [
        'slug'              => 'seguridad-salud-trabajo',
        'titulo'            => 'Seguridad y Salud en el Trabajo (SST)',
        'descripcion_corta' => '',
        'color_accent'      => '#0057B7',
        'icono'             => '',
        'activo'            => 1,
    ],
    [
        'slug'              => 'gestion-talento-humano',
        'titulo'            => 'Gestión del Talento y Relaciones Laborales',
        'descripcion_corta' => '',
        'color_accent'      => '#0057B7',
        'icono'             => '',
        'activo'            => 1,
    ],
    [
        'slug'              => 'gestion-social-rse',
        'titulo'            => 'Gestión Social y Sostenibilidad (ESG)',
        'descripcion_corta' => '',
        'color_accent'      => '#0057B7',
        'icono'             => '',
        'activo'            => 1,
    ],
    [
        'slug'              => 'asesoria-legal',
        'titulo'            => 'Gobernanza y Gestión Legal',
        'descripcion_corta' => '',
        'color_accent'      => '#0057B7',
        'icono'             => '',
        'activo'            => 1,
    ],
];

$slugs_aprobados = array_column($servicios_aprobados, null, 'slug');

// ---------------------------------------------------------------------------
// Helper: salida de error a STDERR
// ---------------------------------------------------------------------------
function abort(string $mensaje, int $codigo = 1): never
{
    fwrite(STDERR, "[ERROR] " . $mensaje . PHP_EOL);
    exit($codigo);
}

// ---------------------------------------------------------------------------
// Conexión
// ---------------------------------------------------------------------------
try {
    $pdo = get_db_connection();
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
} catch (Throwable $e) {
    abort('No se pudo obtener la conexión a la base de datos: ' . $e->getMessage());
}

// ---------------------------------------------------------------------------
// 2. Verificar motor InnoDB
// ---------------------------------------------------------------------------
$stmt = $pdo->query(
    "SELECT ENGINE FROM information_schema.TABLES
     WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'servicios'"
);
$row = $stmt->fetch(PDO::FETCH_ASSOC);

if ($row === false) {
    abort('La tabla servicios no existe en la base de datos actual.');
}
if (strtoupper((string) $row['ENGINE']) !== 'INNODB') {
    abort('La tabla servicios no usa InnoDB (motor detectado: ' . $row['ENGINE'] . '). No se puede garantizar atomicidad.');
}
echo '[OK] Motor InnoDB verificado.' . PHP_EOL;

// ---------------------------------------------------------------------------
// 3. Inspección previa (fuera de TX)
// ---------------------------------------------------------------------------
$slugs_lista = implode(', ', array_fill(0, count($slugs_aprobados), '?'));
$stmt = $pdo->prepare(
    "SELECT slug, titulo, activo FROM servicios WHERE slug IN ($slugs_lista)"
);
$stmt->execute(array_keys($slugs_aprobados));
$existentes = $stmt->fetchAll(PDO::FETCH_ASSOC);

$existentes_por_slug = [];
foreach ($existentes as $fila) {
    $existentes_por_slug[$fila['slug']] = $fila;
}

// Validar cada existente antes de abrir la transacción
foreach ($existentes_por_slug as $slug => $fila) {
    $aprobado = $slugs_aprobados[$slug];

    if ($fila['titulo'] !== $aprobado['titulo']) {
        abort(
            "El slug '$slug' ya existe con un título diferente.\n" .
            "  Título en BD:      {$fila['titulo']}\n" .
            "  Título aprobado:   {$aprobado['titulo']}\n" .
            "Se requiere revisión manual. No se realizará ninguna inserción."
        );
    }

    if ((int) $fila['activo'] !== 1) {
        abort(
            "El slug '$slug' existe con activo = {$fila['activo']}. " .
            "Solo se admiten registros activos. Se requiere revisión manual."
        );
    }
}

// Determinar qué slugs hay que insertar
$slugs_faltantes = array_keys(array_diff_key($slugs_aprobados, $existentes_por_slug));

if (empty($slugs_faltantes)) {
    echo '[INFO] Todos los servicios ya existen y están activos. No se realizarán inserciones.' . PHP_EOL;
    // Continuar para hacer la verificación final
}

// ---------------------------------------------------------------------------
// 4. Transacción atómica
// ---------------------------------------------------------------------------
try {
    $pdo->beginTransaction();

    // 4a. Re-validación con FOR UPDATE (bloquea filas existentes)
    if (!empty($existentes_por_slug)) {
        $slugs_existentes_lista = implode(', ', array_fill(0, count($existentes_por_slug), '?'));
        $stmt_lock = $pdo->prepare(
            "SELECT slug, titulo, activo FROM servicios
             WHERE slug IN ($slugs_existentes_lista) FOR UPDATE"
        );
        $stmt_lock->execute(array_keys($existentes_por_slug));
        $filas_bloqueadas = $stmt_lock->fetchAll(PDO::FETCH_ASSOC);

        foreach ($filas_bloqueadas as $fila) {
            $slug    = $fila['slug'];
            $aprobado = $slugs_aprobados[$slug];

            if ($fila['titulo'] !== $aprobado['titulo']) {
                if ($pdo->inTransaction()) {
                    $pdo->rollBack();
                }
                abort(
                    "Discrepancia concurrente detectada en slug '$slug'.\n" .
                    "  Título en BD:    {$fila['titulo']}\n" .
                    "  Título aprobado: {$aprobado['titulo']}\n" .
                    "Transacción cancelada."
                );
            }

            if ((int) $fila['activo'] !== 1) {
                if ($pdo->inTransaction()) {
                    $pdo->rollBack();
                }
                abort(
                    "Discrepancia concurrente: slug '$slug' ahora tiene activo = {$fila['activo']}. " .
                    "Transacción cancelada."
                );
            }
        }
    }

    // 4b. Insertar únicamente los servicios faltantes
    $stmt_insert = $pdo->prepare(
        "INSERT INTO servicios (slug, titulo, descripcion_corta, color_accent, icono, activo)
         VALUES (:slug, :titulo, :descripcion_corta, :color_accent, :icono, :activo)"
    );

    $insertados = [];
    foreach ($slugs_faltantes as $slug) {
        $s = $slugs_aprobados[$slug];
        $stmt_insert->execute([
            ':slug'              => $s['slug'],
            ':titulo'            => $s['titulo'],
            ':descripcion_corta' => $s['descripcion_corta'],
            ':color_accent'      => $s['color_accent'],
            ':icono'             => $s['icono'],
            ':activo'            => $s['activo'],
        ]);
        $insertados[] = $slug;
    }

    // 4c. Verificación pre-COMMIT: leer los seis registros dentro de la TX
    $stmt_verify = $pdo->prepare(
        "SELECT slug, titulo, activo FROM servicios WHERE slug IN ($slugs_lista)"
    );
    $stmt_verify->execute(array_keys($slugs_aprobados));
    $filas_finales = $stmt_verify->fetchAll(PDO::FETCH_ASSOC);
    $finales_por_slug = array_column($filas_finales, null, 'slug');

    $errores_verificacion = [];
    foreach ($slugs_aprobados as $slug => $aprobado) {
        if (!isset($finales_por_slug[$slug])) {
            $errores_verificacion[] = "Slug '$slug' no encontrado tras las inserciones.";
            continue;
        }
        $f = $finales_por_slug[$slug];
        if ($f['titulo'] !== $aprobado['titulo']) {
            $errores_verificacion[] = "Título incorrecto para '$slug': '{$f['titulo']}' (esperado: '{$aprobado['titulo']}').";
        }
        if ((int) $f['activo'] !== 1) {
            $errores_verificacion[] = "Servicio '$slug' está inactivo (activo = {$f['activo']}).";
        }
    }

    if (!empty($errores_verificacion)) {
        if ($pdo->inTransaction()) {
            $pdo->rollBack();
        }
        abort(
            "Verificación pre-COMMIT fallida. ROLLBACK ejecutado.\n" .
            implode("\n", $errores_verificacion)
        );
    }

    // 4d. COMMIT
    $pdo->commit();

} catch (PDOException $e) {
    if ($pdo->inTransaction()) {
        $pdo->rollBack();
    }
    abort('Error PDO durante la transacción (ROLLBACK ejecutado): ' . $e->getMessage());
} catch (Throwable $e) {
    if ($pdo->inTransaction()) {
        $pdo->rollBack();
    }
    abort('Error inesperado durante la transacción (ROLLBACK ejecutado): ' . $e->getMessage());
}

// ---------------------------------------------------------------------------
// 5. Reporte final
// ---------------------------------------------------------------------------
echo PHP_EOL;
echo '=====================================================' . PHP_EOL;
echo '  Carga inicial de servicios — Resultado'            . PHP_EOL;
echo '=====================================================' . PHP_EOL;
printf("%-45s %-12s %s\n", 'Slug', 'Estado', 'Título');
echo str_repeat('-', 90) . PHP_EOL;

foreach ($slugs_aprobados as $slug => $aprobado) {
    $estado = in_array($slug, $insertados ?? [], true) ? 'INSERTADO' : 'YA EXISTÍA';
    printf("%-45s %-12s %s\n", $slug, $estado, $aprobado['titulo']);
}

echo str_repeat('-', 90) . PHP_EOL;
$total_insertados = count($insertados ?? []);
$total_existentes = count($existentes_por_slug);
echo "Insertados: $total_insertados | Ya existían: $total_existentes | Total verificados: " . count($slugs_aprobados) . PHP_EOL;
echo PHP_EOL . '[OK] Carga completada y verificada exitosamente.' . PHP_EOL;

exit(0);
