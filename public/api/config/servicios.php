<?php

declare(strict_types=1);

require_once __DIR__ . '/medios.php'; // fotos de fondo

/**
 * Catálogo de servicios: listas permitidas, normalización y validación.
 *
 * El diseño visual de cada servicio no es libre: el panel solo puede elegir un
 * ícono y un tema de color de estas listas. Las mismas listas existen en el
 * frontend (src/lib/iconos.ts y src/lib/servicios.ts) y deben mantenerse iguales.
 *
 * Columnas usadas de `servicios`:
 *   titulo        → nombre visible
 *   icono         → ícono principal (nombre de la lista SERVICIOS_ICONOS)
 *   color_accent  → tema de color (clave de SERVICIOS_TEMAS)
 *   contenido_json→ { descripcion: string, tarjetas: [{ titulo, icono, items: string[] }], imagen?: string }
 *                   imagen: foto de fondo subida con uso 'foto' (opcional; vacía = sin foto)
 *   activo        → 1 visible en el sitio / 0 oculto
 *
 * Si un servicio no tiene ícono, tema o contenido válidos guardados, el frontend usa
 * sus valores de respaldo (src/lib/servicios.ts), por eso aquí se devuelven como null.
 */

const SERVICIOS_ICONOS = [
    'Activity', 'Award', 'BarChart3', 'BrainCircuit', 'Briefcase', 'Building2', 'CheckCircle2',
    'ClipboardCheck', 'Container', 'Factory', 'FileCheck', 'Gavel', 'Globe', 'Handshake', 'HardHat',
    'Heart', 'HeartHandshake', 'Landmark', 'Leaf', 'Lightbulb', 'LineChart', 'Recycle', 'Scale', 'Settings',
    'ShieldAlert', 'ShieldCheck', 'Sprout', 'Stethoscope', 'Target', 'TreePine', 'TrendingUp',
    'Truck', 'UserCheck', 'Users', 'Users2',
];

const SERVICIOS_TEMAS = ['marca', 'esmeralda', 'naranja', 'cian', 'violeta', 'azul'];

const SERVICIOS_LIMITES = [
    'titulo'           => 200,
    'descripcion'      => 1500,
    'tarjetas_min'     => 1,
    'tarjetas_max'     => 6,
    'tarjeta_titulo'   => 100,
    'items_min'        => 1,
    'items_max'        => 15,
    'item'             => 300,
];

/**
 * Convierte una fila de la BD al formato de la API.
 *
 * @param  array<string, mixed> $fila
 * @return array<string, mixed>
 */
function servicio_desde_fila(array $fila): array
{
    $contenido = null;
    if ($fila['contenido_json'] !== null) {
        $decodificado = json_decode((string) $fila['contenido_json'], true);
        $contenido = is_array($decodificado) ? $decodificado : null;
    }

    // Una foto borrada o con nombre ajeno no se expone (el sitio la omite)
    if (is_array($contenido) && array_key_exists('imagen', $contenido)) {
        $imagen = $contenido['imagen'];
        if (!is_string($imagen) || $imagen === '' || !medio_nombre_valido($imagen, 'foto') || medio_ruta($imagen) === null) {
            unset($contenido['imagen']);
        }
    }

    $icono = (string) $fila['icono'];
    $tema  = (string) $fila['color_accent'];

    return [
        'id'        => (int) $fila['id'],
        'slug'      => (string) $fila['slug'],
        'titulo'    => (string) $fila['titulo'],
        'icono'     => in_array($icono, SERVICIOS_ICONOS, true) ? $icono : null,
        'tema'      => in_array($tema, SERVICIOS_TEMAS, true) ? $tema : null,
        'activo'    => (bool) $fila['activo'],
        'contenido' => $contenido,
    ];
}

/**
 * Valida un cambio parcial de servicio (PATCH). Solo se validan los campos enviados.
 *
 * Campos aceptados: activo (bool), titulo (string), icono (string), tema (string),
 * contenido ({ descripcion: string, tarjetas: [...] }).
 *
 * @param  array<mixed> $datos
 * @return array{0: array<string, mixed>, 1: array<string, string>}  [cambios, errores]
 */
function validar_servicio_patch(array $datos): array
{
    $L        = SERVICIOS_LIMITES;
    $cambios  = [];
    $errores  = [];
    $permitidos = ['activo', 'titulo', 'icono', 'tema', 'contenido'];

    $desconocidos = array_diff(array_map('strval', array_keys($datos)), $permitidos);
    if ($desconocidos !== []) {
        $errores['_campos'] = 'Campos no permitidos: ' . implode(', ', $desconocidos) . '.';
    }

    if ($datos === []) {
        $errores['_campos'] = 'No se envió ningún cambio.';
    }

    if (array_key_exists('activo', $datos)) {
        if (!is_bool($datos['activo'])) {
            $errores['activo'] = 'Debe ser verdadero o falso.';
        } else {
            $cambios['activo'] = $datos['activo'];
        }
    }

    if (array_key_exists('titulo', $datos)) {
        $titulo = is_string($datos['titulo']) ? trim($datos['titulo']) : null;
        if ($titulo === null || mb_strlen($titulo) < 3) {
            $errores['titulo'] = 'El título debe tener al menos 3 caracteres.';
        } elseif (mb_strlen($titulo) > $L['titulo']) {
            $errores['titulo'] = 'El título admite máximo ' . $L['titulo'] . ' caracteres.';
        } elseif (str_contains($titulo, "\n")) {
            $errores['titulo'] = 'El título debe ser una sola línea.';
        } else {
            $cambios['titulo'] = $titulo;
        }
    }

    if (array_key_exists('icono', $datos)) {
        if (!is_string($datos['icono']) || !in_array($datos['icono'], SERVICIOS_ICONOS, true)) {
            $errores['icono'] = 'Elige un ícono de la lista.';
        } else {
            $cambios['icono'] = $datos['icono'];
        }
    }

    if (array_key_exists('tema', $datos)) {
        if (!is_string($datos['tema']) || !in_array($datos['tema'], SERVICIOS_TEMAS, true)) {
            $errores['tema'] = 'Elige un tema de color de la lista.';
        } else {
            $cambios['tema'] = $datos['tema'];
        }
    }

    if (array_key_exists('contenido', $datos)) {
        [$contenido, $erroresContenido] = validar_contenido_servicio($datos['contenido']);
        $errores += $erroresContenido;
        if ($erroresContenido === []) {
            $cambios['contenido'] = $contenido;
        }
    }

    return [$cambios, $errores];
}

/**
 * @param  mixed $c
 * @return array{0: array<string, mixed>, 1: array<string, string>}
 */
function validar_contenido_servicio(mixed $c): array
{
    $L = SERVICIOS_LIMITES;
    $errores = [];

    if (!is_array($c) || array_diff(array_map('strval', array_keys($c)), ['descripcion', 'tarjetas', 'imagen']) !== []) {
        return [[], ['contenido' => 'El contenido solo admite "descripcion", "tarjetas" e "imagen".']];
    }

    // Foto de fondo opcional: nombre de una imagen subida con uso 'foto'
    $imagen = $c['imagen'] ?? '';
    if (!is_string($imagen)) {
        $errores['imagen'] = 'La foto de fondo no es válida; súbela de nuevo.';
        $imagen = '';
    } elseif ($imagen !== '' && !medio_nombre_valido($imagen, 'foto')) {
        $errores['imagen'] = 'La foto de fondo no es válida; súbela de nuevo.';
    } elseif ($imagen !== '' && medio_ruta($imagen) === null) {
        $errores['imagen'] = 'La foto de fondo ya no existe; súbela de nuevo.';
    }

    $descripcion = $c['descripcion'] ?? '';
    if (!is_string($descripcion)) {
        $errores['descripcion'] = 'La descripción debe ser texto.';
    } else {
        $descripcion = trim(str_replace(["\r\n", "\r"], "\n", $descripcion));
        if ($descripcion === '') {
            $errores['descripcion'] = 'La descripción no puede quedar vacía.';
        } elseif (mb_strlen($descripcion) > $L['descripcion']) {
            $errores['descripcion'] = 'La descripción admite máximo ' . $L['descripcion'] . ' caracteres.';
        }
    }

    $tarjetas = $c['tarjetas'] ?? null;
    $limpias  = [];
    if (!is_array($tarjetas) || !array_is_list_compat($tarjetas)) {
        $errores['tarjetas'] = 'Las tarjetas deben ser una lista.';
    } elseif (count($tarjetas) < $L['tarjetas_min'] || count($tarjetas) > $L['tarjetas_max']) {
        $errores['tarjetas'] = 'Debe haber entre ' . $L['tarjetas_min'] . ' y ' . $L['tarjetas_max'] . ' tarjetas.';
    } else {
        foreach ($tarjetas as $i => $t) {
            $n = $i + 1;
            $clave = "tarjetas.$i";
            if (!is_array($t) || array_diff(array_map('strval', array_keys($t)), ['titulo', 'icono', 'items']) !== []) {
                $errores[$clave] = "Tarjeta $n: formato no válido.";
                continue;
            }
            $titulo = is_string($t['titulo'] ?? null) ? trim($t['titulo']) : '';
            if ($titulo === '' || mb_strlen($titulo) > $L['tarjeta_titulo'] || str_contains($titulo, "\n")) {
                $errores["$clave.titulo"] = "Tarjeta $n: el título es obligatorio (una línea, máximo {$L['tarjeta_titulo']} caracteres).";
            }
            $icono = $t['icono'] ?? null;
            if (!is_string($icono) || !in_array($icono, SERVICIOS_ICONOS, true)) {
                $errores["$clave.icono"] = "Tarjeta $n: elige un ícono de la lista.";
            }
            $items = $t['items'] ?? null;
            $itemsLimpios = [];
            if (!is_array($items) || !array_is_list_compat($items)) {
                $errores["$clave.items"] = "Tarjeta $n: los puntos deben ser una lista.";
            } else {
                foreach ($items as $item) {
                    if (!is_string($item)) {
                        $errores["$clave.items"] = "Tarjeta $n: cada punto debe ser texto.";
                        break;
                    }
                    $item = trim($item);
                    if ($item === '') {
                        continue;
                    }
                    if (mb_strlen($item) > $L['item'] || str_contains($item, "\n")) {
                        $errores["$clave.items"] = "Tarjeta $n: cada punto es una línea de máximo {$L['item']} caracteres.";
                        break;
                    }
                    $itemsLimpios[] = $item;
                }
                if (!isset($errores["$clave.items"]) && (count($itemsLimpios) < $L['items_min'] || count($itemsLimpios) > $L['items_max'])) {
                    $errores["$clave.items"] = "Tarjeta $n: debe tener entre {$L['items_min']} y {$L['items_max']} puntos.";
                }
            }
            $limpias[] = ['titulo' => $titulo, 'icono' => $icono, 'items' => $itemsLimpios];
        }
    }

    $limpio = ['descripcion' => $descripcion, 'tarjetas' => $limpias];
    if ($imagen !== '') {
        $limpio['imagen'] = $imagen;
    }
    return [$limpio, $errores];
}

/**
 * array_is_list() existe desde PHP 8.1; se reimplementa para no depender de ello
 * en validaciones y dejar explícito el criterio (claves 0..n-1 en orden).
 *
 * @param array<mixed> $a
 */
function array_is_list_compat(array $a): bool
{
    return $a === [] || array_keys($a) === range(0, count($a) - 1);
}
