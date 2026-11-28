<?php

declare(strict_types=1);

require_once __DIR__ . '/servicios.php'; // SERVICIOS_ICONOS
require_once __DIR__ . '/medios.php';    // imágenes subidas

/**
 * Definición y validación de las secciones editables del CMS.
 *
 * Cada sección declara sus campos permitidos y el tipo de cada uno. El panel solo
 * puede guardar estos campos; cualquier otro se rechaza. Salvo que un campo diga
 * 'requerido' => true, puede quedar vacío: un campo vacío significa "no mostrar".
 *
 * Tipos de texto:
 *   email      Correo electrónico válido.
 *   telefono   Dígitos, espacios, +, -, paréntesis y "ext". 7 a 30 caracteres.
 *   whatsapp   Número internacional sin "+": solo dígitos, 10 a 15. Se aceptan
 *              espacios, guiones y "+" al escribirlo; se guardan solo los dígitos.
 *   url        Dirección https:// completa.
 *   texto      Una línea de texto.
 *   multilinea Varias líneas (cada línea se muestra por separado en el sitio).
 *              Con 'max_lineas', limita el número de líneas con texto.
 *   icono      Nombre de ícono de la lista permitida (SERVICIOS_ICONOS).
 *   slug       Identificador de servicio (minúsculas, números y guiones).
 *   imagen     Nombre de una imagen subida con /api/admin/medios.php para el 'uso'
 *              indicado (logo, favicon, compartir, foto). Vacío = imagen por defecto.
 *              Si el archivo ya no existe, la API pública no lo devuelve.
 *
 * Tipo lista:
 *   lista      Lista de elementos con sus propios campos ('campos'), entre 'min' y 'max'.
 *              Los errores de un elemento se reportan con la clave "campo.indice.subcampo".
 *
 * Los valores por defecto (respaldo cuando no hay nada guardado) viven en el
 * frontend: src/lib/contenidos.ts.
 */

/**
 * @return array<string, array<string, array<string, mixed>>>
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
        'identidad' => [
            'logo'      => ['tipo' => 'imagen', 'uso' => 'logo',      'max' => 80, 'etiqueta' => 'Logo del menú'],
            'logo_pie'  => ['tipo' => 'imagen', 'uso' => 'logo',      'max' => 80, 'etiqueta' => 'Logo del pie de página'],
            'favicon'   => ['tipo' => 'imagen', 'uso' => 'favicon',   'max' => 80, 'etiqueta' => 'Ícono de la pestaña'],
            'compartir' => ['tipo' => 'imagen', 'uso' => 'compartir', 'max' => 80, 'etiqueta' => 'Imagen al compartir'],
        ],
        'equipo' => [
            'encabezado_antetitulo'  => ['tipo' => 'texto',      'max' => 40,  'etiqueta' => 'Etiqueta del encabezado'],
            'encabezado_titulo'      => ['tipo' => 'texto',      'max' => 80,  'etiqueta' => 'Título del encabezado'],
            'encabezado_destacado'   => ['tipo' => 'texto',      'max' => 80,  'etiqueta' => 'Título destacado del encabezado'],
            'encabezado_descripcion' => ['tipo' => 'multilinea', 'max' => 500, 'etiqueta' => 'Descripción del encabezado'],
            // Sin personas, el sitio oculta la cuadrícula (nunca se muestran personas de ejemplo)
            'miembros' => [
                'tipo' => 'lista', 'min' => 0, 'max' => 12, 'etiqueta' => 'Persona',
                'campos' => [
                    'nombre'         => ['tipo' => 'texto',      'max' => 80,  'etiqueta' => 'Nombre', 'requerido' => true],
                    'cargo'          => ['tipo' => 'texto',      'max' => 100, 'etiqueta' => 'Cargo'],
                    'descripcion'    => ['tipo' => 'multilinea', 'max' => 300, 'etiqueta' => 'Descripción'],
                    'especialidades' => ['tipo' => 'multilinea', 'max' => 400, 'etiqueta' => 'Especialidades', 'max_lineas' => 6],
                    'foto'           => ['tipo' => 'imagen',     'uso' => 'retrato', 'max' => 80, 'etiqueta' => 'Foto'],
                    'linkedin'       => ['tipo' => 'url',        'max' => 300, 'etiqueta' => 'LinkedIn'],
                    'email'          => ['tipo' => 'email',      'max' => 180, 'etiqueta' => 'Correo'],
                ],
            ],
            'valores_titulo'      => ['tipo' => 'texto', 'max' => 60,  'etiqueta' => 'Título de valores'],
            'valores_descripcion' => ['tipo' => 'texto', 'max' => 150, 'etiqueta' => 'Descripción de valores'],
            'valores' => [
                'tipo' => 'lista', 'min' => 1, 'max' => 6, 'etiqueta' => 'Valor',
                'campos' => [
                    'icono'       => ['tipo' => 'icono',      'max' => 40,  'etiqueta' => 'Ícono', 'requerido' => true],
                    'titulo'      => ['tipo' => 'texto',      'max' => 60,  'etiqueta' => 'Título', 'requerido' => true],
                    'descripcion' => ['tipo' => 'multilinea', 'max' => 250, 'etiqueta' => 'Descripción'],
                ],
            ],
            'cta_titulo'      => ['tipo' => 'texto',      'max' => 100, 'etiqueta' => 'Título de la llamada final'],
            'cta_descripcion' => ['tipo' => 'multilinea', 'max' => 300, 'etiqueta' => 'Descripción de la llamada final'],
            'cta_boton'       => ['tipo' => 'texto',      'max' => 40,  'etiqueta' => 'Botón de la llamada final'],
        ],
        'quienes_somos' => [
            'encabezado_titulo'      => ['tipo' => 'texto',      'max' => 80,  'etiqueta' => 'Título del encabezado'],
            'encabezado_descripcion' => ['tipo' => 'multilinea', 'max' => 600, 'etiqueta' => 'Descripción del encabezado'],
            'mision_titulo'          => ['tipo' => 'texto',      'max' => 60,  'etiqueta' => 'Título de la misión'],
            'mision'                 => ['tipo' => 'multilinea', 'max' => 800, 'etiqueta' => 'Misión'],
            'vision_titulo'          => ['tipo' => 'texto',      'max' => 60,  'etiqueta' => 'Título de la visión'],
            'vision'                 => ['tipo' => 'multilinea', 'max' => 800, 'etiqueta' => 'Visión'],
            'valor_titulo'           => ['tipo' => 'texto',      'max' => 60,  'etiqueta' => 'Título de cómo generamos valor'],
            'valor'                  => ['tipo' => 'multilinea', 'max' => 800, 'etiqueta' => 'Cómo generamos valor', 'max_lineas' => 10],
            'metodo_titulo'          => ['tipo' => 'texto',      'max' => 60,  'etiqueta' => 'Título de cómo lo hacemos'],
            // Pasos numerados automáticamente en el sitio (1., 2., 3.…)
            'pasos' => [
                'tipo' => 'lista', 'min' => 1, 'max' => 8, 'etiqueta' => 'Paso',
                'campos' => [
                    'titulo'      => ['tipo' => 'texto',      'max' => 100, 'etiqueta' => 'Título', 'requerido' => true],
                    'descripcion' => ['tipo' => 'multilinea', 'max' => 400, 'etiqueta' => 'Descripción'],
                ],
            ],
        ],
        'decalogo' => [
            'encabezado_titulo'      => ['tipo' => 'texto',      'max' => 80,  'etiqueta' => 'Título del encabezado'],
            'encabezado_destacado'   => ['tipo' => 'texto',      'max' => 60,  'etiqueta' => 'Título destacado del encabezado'],
            'encabezado_descripcion' => ['tipo' => 'multilinea', 'max' => 400, 'etiqueta' => 'Descripción del encabezado'],
            'principios' => [
                'tipo' => 'lista', 'min' => 1, 'max' => 12, 'etiqueta' => 'Principio',
                'campos' => [
                    'titulo'      => ['tipo' => 'texto',      'max' => 80,  'etiqueta' => 'Título', 'requerido' => true],
                    'descripcion' => ['tipo' => 'multilinea', 'max' => 250, 'etiqueta' => 'Descripción'],
                ],
            ],
            'boton_ver_todos'  => ['tipo' => 'texto',      'max' => 40,  'etiqueta' => 'Botón «Ver todos»'],
            'propuesta_titulo' => ['tipo' => 'texto',      'max' => 80,  'etiqueta' => 'Título de la propuesta de valor'],
            'propuesta_texto'  => ['tipo' => 'multilinea', 'max' => 800, 'etiqueta' => 'Texto de la propuesta de valor'],
        ],
        'inicio' => [
            'hero_imagen'              => ['tipo' => 'imagen',     'uso' => 'foto', 'max' => 80, 'etiqueta' => 'Foto de fondo del banner'],
            'hero_antetitulo'          => ['tipo' => 'texto',      'max' => 60,  'etiqueta' => 'Antetítulo del banner'],
            'hero_titulo'              => ['tipo' => 'texto',      'max' => 80,  'etiqueta' => 'Título del banner'],
            'hero_titulo_destacado'    => ['tipo' => 'texto',      'max' => 80,  'etiqueta' => 'Título destacado del banner'],
            'hero_descripcion'         => ['tipo' => 'multilinea', 'max' => 400, 'etiqueta' => 'Descripción del banner'],
            'hero_boton_principal'     => ['tipo' => 'texto',      'max' => 40,  'etiqueta' => 'Botón principal del banner'],
            'hero_boton_secundario'    => ['tipo' => 'texto',      'max' => 40,  'etiqueta' => 'Botón secundario del banner'],
            'especialidades_titulo'    => ['tipo' => 'texto',      'max' => 60,  'etiqueta' => 'Título de especialidades'],
            'especialidades_destacado' => ['tipo' => 'texto',      'max' => 60,  'etiqueta' => 'Título destacado de especialidades'],
            'especialidades_descripcion' => ['tipo' => 'multilinea', 'max' => 300, 'etiqueta' => 'Descripción de especialidades'],
            'especialidades' => [
                'tipo' => 'lista', 'min' => 1, 'max' => 8, 'etiqueta' => 'Tarjeta',
                'campos' => [
                    'titulo'      => ['tipo' => 'texto',      'max' => 120, 'etiqueta' => 'Título', 'requerido' => true],
                    'descripcion' => ['tipo' => 'multilinea', 'max' => 300, 'etiqueta' => 'Descripción'],
                    'icono'       => ['tipo' => 'icono',      'max' => 40,  'etiqueta' => 'Ícono', 'requerido' => true],
                    'servicio'    => ['tipo' => 'slug',       'max' => 100, 'etiqueta' => 'Servicio', 'requerido' => true],
                ],
            ],
            'cta_titulo'      => ['tipo' => 'texto',      'max' => 100, 'etiqueta' => 'Título de la llamada final'],
            'cta_descripcion' => ['tipo' => 'multilinea', 'max' => 300, 'etiqueta' => 'Descripción de la llamada final'],
            'cta_boton'       => ['tipo' => 'texto',      'max' => 40,  'etiqueta' => 'Botón de la llamada final'],
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
 * Los campos ausentes se guardan vacíos ("" o lista vacía), porque el guardado
 * reemplaza la sección completa.
 *
 * @param  array<mixed> $datos
 * @return array{0: array<string, mixed>, 1: array<string, string>}
 */
function validar_contenido(string $seccion, array $datos): array
{
    return validar_campos(contenidos_schema()[$seccion], $datos, '', '');
}

/**
 * Valida un conjunto de campos (sección completa o un elemento de lista).
 *
 * @param  array<string, array<string, mixed>> $campos
 * @param  array<mixed>                        $datos
 * @return array{0: array<string, mixed>, 1: array<string, string>}
 */
function validar_campos(array $campos, array $datos, string $prefijoClave, string $prefijoMensaje): array
{
    $limpios = [];
    $errores = [];

    $desconocidos = array_diff(array_map('strval', array_keys($datos)), array_keys($campos));
    if ($desconocidos !== []) {
        $errores[$prefijoClave . '_campos'] = $prefijoMensaje . 'Campos no permitidos: ' . implode(', ', $desconocidos) . '.';
    }

    foreach ($campos as $campo => $regla) {
        $clave = $prefijoClave . $campo;

        if ($regla['tipo'] === 'lista') {
            [$lista, $erroresLista] = validar_lista($regla, $datos[$campo] ?? [], $clave);
            $errores += $erroresLista;
            $limpios[$campo] = $lista;
            continue;
        }

        [$valor, $error] = validar_valor($regla, $datos[$campo] ?? '');
        if ($error !== null) {
            $errores[$clave] = $prefijoMensaje . $regla['etiqueta'] . ': ' . $error;
            continue;
        }
        $limpios[$campo] = $valor;
    }

    return [$limpios, $errores];
}

/**
 * @param  array<string, mixed> $regla
 * @return array{0: list<array<string, mixed>>, 1: array<string, string>}
 */
function validar_lista(array $regla, mixed $valor, string $clave): array
{
    $etiqueta = $regla['etiqueta'];

    if (!is_array($valor) || !array_is_list_compat($valor)) {
        return [[], [$clave => 'Las tarjetas deben enviarse como una lista.']];
    }
    if (count($valor) < $regla['min'] || count($valor) > $regla['max']) {
        return [[], [$clave => "Debe haber entre {$regla['min']} y {$regla['max']} elementos."]];
    }

    $limpios = [];
    $errores = [];
    foreach ($valor as $i => $elemento) {
        $n = $i + 1;
        if (!is_array($elemento)) {
            $errores["$clave.$i"] = "$etiqueta $n: formato no válido.";
            continue;
        }
        [$limpio, $erroresElemento] = validar_campos($regla['campos'], $elemento, "$clave.$i.", "$etiqueta $n · ");
        $errores += $erroresElemento;
        $limpios[] = $limpio;
    }

    return [$limpios, $errores];
}

/**
 * Valida un valor de texto según su regla.
 *
 * @param  array<string, mixed> $regla
 * @return array{0: string, 1: ?string}  [valor_limpio, mensaje_de_error|null]
 */
function validar_valor(array $regla, mixed $valor): array
{
    if (!is_string($valor)) {
        return ['', 'debe ser texto.'];
    }

    // Normaliza saltos de línea y espacios en los extremos
    $valor = trim(str_replace(["\r\n", "\r"], "\n", $valor));

    if ($valor === '') {
        return ['', !empty($regla['requerido']) ? 'es obligatorio.' : null];
    }

    if (mb_strlen($valor) > $regla['max']) {
        return ['', 'máximo ' . $regla['max'] . ' caracteres.'];
    }

    if ($regla['tipo'] !== 'multilinea' && str_contains($valor, "\n")) {
        return ['', 'debe ser una sola línea.'];
    }

    if (isset($regla['max_lineas'])) {
        $conTexto = array_filter(array_map('trim', explode("\n", $valor)), static fn($l) => $l !== '');
        if (count($conTexto) > $regla['max_lineas']) {
            return ['', 'máximo ' . $regla['max_lineas'] . ' líneas.'];
        }
    }

    switch ($regla['tipo']) {
        case 'email':
            if (filter_var($valor, FILTER_VALIDATE_EMAIL) === false) {
                return ['', 'no es un correo válido.'];
            }
            break;

        case 'telefono':
            if (!preg_match('/^\+?[0-9 ()\-]{7,30}( ?(ext\.?|extensión) ?[0-9]{1,6})?$/iu', $valor)) {
                return ['', 'usa solo números, espacios, +, - y paréntesis.'];
            }
            break;

        case 'whatsapp':
            $digitos = preg_replace('/[\s\-+()]/', '', $valor) ?? '';
            if (!preg_match('/^[0-9]{10,15}$/', $digitos)) {
                return ['', 'escribe el número con indicativo de país, ej. 57 320 123 4567.'];
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
                return ['', 'debe ser una dirección completa que empiece por https://'];
            }
            break;

        case 'icono':
            if (!in_array($valor, SERVICIOS_ICONOS, true)) {
                return ['', 'elige un ícono de la lista.'];
            }
            break;

        case 'slug':
            if (!preg_match('/^[a-z0-9]+(?:-[a-z0-9]+)*$/', $valor)) {
                return ['', 'elige un servicio de la lista.'];
            }
            break;

        case 'imagen':
            if (!medio_nombre_valido($valor, $regla['uso'])) {
                return ['', 'imagen no válida; súbela de nuevo.'];
            }
            if (medio_ruta($valor) === null) {
                return ['', 'la imagen ya no existe; súbela de nuevo.'];
            }
            break;
    }

    return [$valor, null];
}

/**
 * Filtra datos guardados para exponer solo los campos vigentes del esquema
 * (texto, o listas de elementos con sus subcampos de texto).
 *
 * @param  array<string, array<string, mixed>> $campos
 * @param  array<mixed>                        $datos
 * @return array<string, mixed>
 */
function filtrar_vigentes(array $campos, array $datos): array
{
    $vigentes = [];
    foreach ($campos as $campo => $regla) {
        if (!array_key_exists($campo, $datos)) {
            continue;
        }
        $valor = $datos[$campo];
        if ($regla['tipo'] === 'lista') {
            if (is_array($valor) && array_is_list_compat($valor)) {
                $vigentes[$campo] = array_values(array_map(
                    static fn($e) => is_array($e) ? filtrar_vigentes($regla['campos'], $e) : [],
                    $valor
                ));
            }
        } elseif ($regla['tipo'] === 'imagen') {
            // Una imagen borrada o con nombre ajeno no se expone: el sitio usa la de respaldo
            if (is_string($valor) && ($valor === '' || (medio_nombre_valido($valor, $regla['uso']) && medio_ruta($valor) !== null))) {
                $vigentes[$campo] = $valor;
            }
        } elseif (is_string($valor)) {
            $vigentes[$campo] = $valor;
        }
    }
    return $vigentes;
}

/**
 * Lee una sección guardada. Si nunca se ha guardado, devuelve datos vacíos
 * (el frontend completa con sus valores de respaldo).
 *
 * @return array{seccion: string, datos: array<string, mixed>, actualizado_en: ?string, actualizado_por: ?string}
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

    return [
        'seccion'         => $seccion,
        'datos'           => is_array($datos) ? filtrar_vigentes(contenidos_schema()[$seccion], $datos) : [],
        'actualizado_en'  => $fila['actualizado_en'],
        'actualizado_por' => $fila['actualizado_por'],
    ];
}
