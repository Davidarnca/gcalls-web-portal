<?php

declare(strict_types=1);

/**
 * Definición y validación de las secciones editables del CMS.
 *
 * Cada sección declara sus campos permitidos y el tipo de cada uno. El panel solo
 * puede guardar estos campos; cualquier otro se rechaza. Todos los campos son texto
 * y pueden quedar vacíos: un campo vacío significa "no mostrar" en el sitio.
 *
 * Tipos:
 *   email      Correo electrónico válido.
 *   telefono   Dígitos, espacios, +, -, paréntesis y "ext". 7 a 30 caracteres.
 *   whatsapp   Número internacional sin "+": solo dígitos, 10 a 15. Se aceptan
 *              espacios, guiones y "+" al escribirlo; se guardan solo los dígitos.
 *   url        Dirección https:// completa.
 *   texto      Una línea de texto.
 *   multilinea Varias líneas (cada línea se muestra por separado en el sitio).
 *
 * Los valores por defecto (respaldo cuando no hay nada guardado) viven en el
 * frontend: src/lib/contenidos.ts.
 */

/**
 * @return array<string, array<string, array{tipo: string, max: int, etiqueta: string}>>
 */
function contenidos_schema(): array
{
    return [
        'global' => [
            'email'               => ['tipo' => 'email',      'max' => 180, 'etiqueta' => 'Correo de contacto'],
            'telefono'            => ['tipo' => 'telefono',   'max' => 30,  'etiqueta' => 'Teléfono principal'],
            'telefono_secundario' => ['tipo' => 'telefono',   'max' => 30,  'etiqueta' => 'Teléfono secundario'],
            'whatsapp'            => ['tipo' => 'whatsapp',   'max' => 20,  'etiqueta' => 'WhatsApp'],
            'direccion'           => ['tipo' => 'texto',      'max' => 200, 'etiqueta' => 'Dirección'],
            'ciudad'              => ['tipo' => 'texto',      'max' => 100, 'etiqueta' => 'Ciudad'],
            'horario'             => ['tipo' => 'multilinea', 'max' => 500, 'etiqueta' => 'Horario de atención'],
            'linkedin'            => ['tipo' => 'url',        'max' => 300, 'etiqueta' => 'LinkedIn'],
            'facebook'            => ['tipo' => 'url',        'max' => 300, 'etiqueta' => 'Facebook'],
            'instagram'           => ['tipo' => 'url',        'max' => 300, 'etiqueta' => 'Instagram'],
        ],
    ];
}

/**
 * Indica si la sección existe en el esquema.
 */
function contenido_seccion_valida(string $seccion): bool
{
    return array_key_exists($seccion, contenidos_schema());
}

/**
 * Valida y normaliza los datos de una sección.
 *
 * Devuelve [datos_limpios, errores]. Si hay errores, datos_limpios no debe guardarse.
 * Los campos ausentes se guardan como cadena vacía, porque el guardado reemplaza
 * la sección completa.
 *
 * @param  array<mixed> $datos
 * @return array{0: array<string, string>, 1: array<string, string>}
 */
function validar_contenido(string $seccion, array $datos): array
{
    $campos  = contenidos_schema()[$seccion];
    $limpios = [];
    $errores = [];

    $desconocidos = array_diff(array_map('strval', array_keys($datos)), array_keys($campos));
    if ($desconocidos !== []) {
        $errores['_campos'] = 'Campos no permitidos: ' . implode(', ', $desconocidos) . '.';
    }

    foreach ($campos as $campo => $regla) {
        $valor = $datos[$campo] ?? '';

        if (!is_string($valor)) {
            $errores[$campo] = $regla['etiqueta'] . ': debe ser texto.';
            continue;
        }

        // Normaliza saltos de línea y espacios en los extremos
        $valor = trim(str_replace(["\r\n", "\r"], "\n", $valor));

        if ($valor === '') {
            $limpios[$campo] = '';
            continue;
        }

        if (mb_strlen($valor) > $regla['max']) {
            $errores[$campo] = $regla['etiqueta'] . ': máximo ' . $regla['max'] . ' caracteres.';
            continue;
        }

        if ($regla['tipo'] !== 'multilinea' && str_contains($valor, "\n")) {
            $errores[$campo] = $regla['etiqueta'] . ': debe ser una sola línea.';
            continue;
        }

        switch ($regla['tipo']) {
            case 'email':
                if (filter_var($valor, FILTER_VALIDATE_EMAIL) === false) {
                    $errores[$campo] = $regla['etiqueta'] . ': no es un correo válido.';
                    continue 2;
                }
                break;

            case 'telefono':
                if (!preg_match('/^\+?[0-9 ()\-]{7,30}( ?(ext\.?|extensión) ?[0-9]{1,6})?$/iu', $valor)) {
                    $errores[$campo] = $regla['etiqueta'] . ': usa solo números, espacios, +, - y paréntesis.';
                    continue 2;
                }
                break;

            case 'whatsapp':
                $digitos = preg_replace('/[\s\-+()]/', '', $valor) ?? '';
                if (!preg_match('/^[0-9]{10,15}$/', $digitos)) {
                    $errores[$campo] = $regla['etiqueta'] . ': escribe el número con indicativo de país, ej. 57 320 123 4567.';
                    continue 2;
                }
                $valor = $digitos;
                break;

            case 'url':
                $partes = parse_url($valor);
                if (
                    filter_var($valor, FILTER_VALIDATE_URL) === false
                    || !is_array($partes)
                    || strtolower($partes['scheme'] ?? '') !== 'https'
                    || empty($partes['host'])
                ) {
                    $errores[$campo] = $regla['etiqueta'] . ': debe ser una dirección completa que empiece por https://';
                    continue 2;
                }
                break;
        }

        $limpios[$campo] = $valor;
    }

    return [$limpios, $errores];
}

/**
 * Lee una sección guardada. Si nunca se ha guardado, devuelve datos vacíos
 * (el frontend completa con sus valores de respaldo).
 *
 * @return array{seccion: string, datos: array<string, string>, actualizado_en: ?string, actualizado_por: ?string}
 */
function obtener_contenido(PDO $pdo, string $seccion): array
{
    $stmt = $pdo->prepare(
        'SELECT c.datos, c.actualizado_en, u.nombre AS actualizado_por
           FROM contenidos c
           LEFT JOIN usuarios u ON u.id = c.actualizado_por
          WHERE c.seccion = :seccion'
    );
    $stmt->execute(['seccion' => $seccion]);
    $fila = $stmt->fetch(PDO::FETCH_ASSOC);

    if ($fila === false) {
        return ['seccion' => $seccion, 'datos' => [], 'actualizado_en' => null, 'actualizado_por' => null];
    }

    $datos = json_decode((string) $fila['datos'], true);

    // Solo se exponen los campos vigentes del esquema, como texto
    $vigentes = [];
    foreach (array_keys(contenidos_schema()[$seccion]) as $campo) {
        if (is_array($datos) && array_key_exists($campo, $datos) && is_string($datos[$campo])) {
            $vigentes[$campo] = $datos[$campo];
        }
    }

    return [
        'seccion'         => $seccion,
        'datos'           => $vigentes,
        'actualizado_en'  => $fila['actualizado_en'],
        'actualizado_por' => $fila['actualizado_por'],
    ];
}
