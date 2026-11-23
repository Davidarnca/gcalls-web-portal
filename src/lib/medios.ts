/**
 * Imágenes subidas desde el panel (ver public/api/config/medios.php).
 *
 * El contenido guarda solo el nombre del archivo (ej. "foto-<32 hex>.webp"); la imagen
 * se sirve desde /api/medio.php. Un nombre vacío significa "usar la imagen por defecto".
 */

const PATRON = /^(logo|favicon|compartir|foto|retrato)-[a-f0-9]{32}\.(webp|png|jpg)$/;

/** URL pública de una imagen subida, o null si el nombre está vacío o no es válido. */
export function urlMedio(nombre: string | null | undefined): string | null {
  if (!nombre || !PATRON.test(nombre)) return null;
  return `/api/medio.php?f=${encodeURIComponent(nombre)}`;
}

/** La imagen subida si existe; si no, la de respaldo. */
export const imagenO = (nombre: string | null | undefined, respaldo: string): string =>
  urlMedio(nombre) ?? respaldo;
