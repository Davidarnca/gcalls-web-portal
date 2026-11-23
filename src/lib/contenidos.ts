import { useQuery } from "@tanstack/react-query";
import type {
  ContenidoGlobal,
  ContenidoPublicoResponse,
  ContenidoSeccion,
} from "@/types/api";

/**
 * Valores de respaldo del contenido editable.
 *
 * Se usan mientras carga la API, si la API falla, o para cualquier campo que nunca
 * se haya guardado desde el panel. Así el sitio nunca queda en blanco.
 * Un campo vacío ("") significa "no mostrar".
 *
 * Datos verificados: correo (pantalla de mantenimiento) y WhatsApp (botón flotante).
 * El horario es el que mostraba la página de Contactos: pendiente de confirmar con el cliente.
 */
export const CONTENIDO_GLOBAL_DEFAULT: ContenidoGlobal = {
  email: "contacto@gcallssas.com",
  telefono: "",
  telefono_secundario: "",
  whatsapp: "573208693786",
  direccion: "",
  ciudad: "",
  horario: "Lunes a viernes: 8:00 a. m. - 6:00 p. m.\nSábados: 9:00 a. m. - 1:00 p. m.\nDomingos: cerrado",
  linkedin: "",
  facebook: "",
  instagram: "",
};

/** Combina lo guardado con el respaldo, campo por campo. */
export function combinarConRespaldo<T extends object>(
  respaldo: T,
  datos: Partial<T> | undefined
): T {
  const resultado = { ...respaldo };
  if (!datos) return resultado;
  for (const clave of Object.keys(respaldo) as (keyof T)[]) {
    const valor = datos[clave];
    if (typeof valor === "string") {
      resultado[clave] = valor as T[keyof T];
    }
  }
  return resultado;
}

async function obtenerContenido<T>(seccion: ContenidoSeccion): Promise<Partial<T>> {
  const respuesta = await fetch(`/api/contenidos.php?seccion=${seccion}`);
  if (!respuesta.ok) {
    throw new Error(`No se pudo cargar el contenido (${respuesta.status}).`);
  }
  const json = (await respuesta.json()) as ContenidoPublicoResponse<T>;
  if (!json.success || !json.data) {
    throw new Error(json.message || "Respuesta inválida del servidor.");
  }
  return json.data.datos;
}

/** Clave de caché compartida entre el sitio público y el panel (para invalidar al guardar). */
export const claveContenido = (seccion: ContenidoSeccion) => ["contenido", seccion] as const;

/**
 * Datos de contacto, horario, redes y WhatsApp para el sitio público.
 * Siempre devuelve un objeto completo: si la API falla, usa el respaldo.
 */
export function useContenidoGlobal(): ContenidoGlobal {
  const { data } = useQuery({
    queryKey: claveContenido("global"),
    queryFn: () => obtenerContenido<ContenidoGlobal>("global"),
    staleTime: 5 * 60 * 1000,
    retry: 1,
  });
  return combinarConRespaldo(CONTENIDO_GLOBAL_DEFAULT, data);
}

// ── Utilidades de presentación ───────────────────────────────────────────────

/** Separa un texto multilínea en renglones no vacíos. */
export const lineas = (texto: string): string[] =>
  texto
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);

/** Enlace tel: con solo dígitos y "+". */
export const enlaceTelefono = (telefono: string): string =>
  `tel:${telefono.replace(/(ext\.?|extensión).*$/i, "").replace(/[^\d+]/g, "")}`;

/** Enlace de WhatsApp a partir de los dígitos guardados. */
export const enlaceWhatsapp = (numero: string): string => `https://wa.me/${numero}`;

/** Dirección y ciudad en una sola línea. */
export const ubicacion = (c: Pick<ContenidoGlobal, "direccion" | "ciudad">): string =>
  [c.direccion, c.ciudad].filter(Boolean).join(", ");

/** Búsqueda de la dirección en Google Maps. */
export const enlaceMapa = (texto: string): string =>
  `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(texto)}`;
