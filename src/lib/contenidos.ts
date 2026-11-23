import { useQuery } from "@tanstack/react-query";
import type {
  ContenidoGlobal,
  ContenidoInicio,
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

/**
 * Página de inicio: textos originales del sitio. Las tarjetas de especialidades
 * enlazan a servicios del catálogo por su slug.
 */
export const CONTENIDO_INICIO_DEFAULT: ContenidoInicio = {
  hero_antetitulo: "G-Calls S.A.S",
  hero_titulo: "Gestión Sostenible",
  hero_titulo_destacado: "Para el Futuro",
  hero_descripcion:
    "Expertos en cadena de abastecimiento, gestión ambiental, seguridad, salud ocupacional y responsabilidad social empresarial.",
  hero_boton_principal: "Conozca Más",
  hero_boton_secundario: "Contáctenos",
  especialidades_titulo: "Nuestras",
  especialidades_destacado: "Especialidades",
  especialidades_descripcion:
    "Soluciones integrales para transformar su empresa hacia la sostenibilidad y excelencia operacional.",
  especialidades: [
    {
      titulo: "Supply Chain Management",
      descripcion:
        "Soluciones integrales de clase mundial en la gestión estratégica de la cadena de abastecimiento, generando valor a nuestros clientes.",
      icono: "TrendingUp",
      servicio: "supply-chain-management",
    },
    {
      titulo: "Gestión Ambiental; Seguridad Industrial y Salud Ocupacional",
      descripcion:
        "Consultoría estratégica en servicios ambientales, seguridad industrial y salud ocupacional con soluciones completas y ejecutables.",
      icono: "Leaf",
      servicio: "gestion-ambiental-sostenibilidad",
    },
    {
      titulo: "Gestión del Talento Humano y Relaciones Industriales",
      descripcion:
        "Servicios integrales en la gestión del talento humano y relaciones industriales aplicando las mejores prácticas para su organización.",
      icono: "Users",
      servicio: "gestion-talento-humano",
    },
    {
      titulo: "Gestión Social y Responsabilidad Social Empresarial",
      descripcion:
        "Soluciones estratégicas en gestión social y RSE, acompañando a las organizaciones en sus áreas de influencia y partes interesadas.",
      icono: "Heart",
      servicio: "gestion-social-rse",
    },
    {
      titulo: "Gestión y Asesoría Legal en las líneas de Servicio Ofrecidas",
      descripcion:
        "Asesoría y orientación legal con calidad, ética y eficiencia en las líneas de servicio que ofrecemos siendo socialmente responsables.",
      icono: "Scale",
      servicio: "asesoria-legal",
    },
  ],
  cta_titulo: "¿Listo para Transformar su Empresa?",
  cta_descripcion:
    "Descubra cómo nuestras soluciones pueden impulsar la sostenibilidad y eficiencia de su organización.",
  cta_boton: "Solicite una Consulta",
};

/** Combina lo guardado con el respaldo, campo por campo (texto o listas). */
export function combinarConRespaldo<T extends object>(
  respaldo: T,
  datos: Partial<T> | undefined
): T {
  const resultado = { ...respaldo };
  if (!datos) return resultado;
  for (const clave of Object.keys(respaldo) as (keyof T)[]) {
    const valor = datos[clave];
    const esLista = Array.isArray(respaldo[clave]);
    if ((!esLista && typeof valor === "string") || (esLista && Array.isArray(valor) && valor.length > 0)) {
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
 * Contenido editable de una sección para el sitio público.
 * Siempre devuelve un objeto completo: si la API falla o falta un campo, usa el respaldo.
 */
export function useContenido<T extends object>(seccion: ContenidoSeccion, respaldo: T): T {
  const { data } = useQuery({
    queryKey: claveContenido(seccion),
    queryFn: () => obtenerContenido<T>(seccion),
    staleTime: 5 * 60 * 1000,
    retry: 1,
  });
  return combinarConRespaldo(respaldo, data);
}

/** Datos de contacto, horario, redes y WhatsApp. */
export const useContenidoGlobal = (): ContenidoGlobal =>
  useContenido("global", CONTENIDO_GLOBAL_DEFAULT);

/** Banner, especialidades y llamada final de la página de inicio. */
export const useContenidoInicio = (): ContenidoInicio =>
  useContenido("inicio", CONTENIDO_INICIO_DEFAULT);

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
