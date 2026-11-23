import type { MedioSubido, MedioSubidoResponse, UsoImagen } from "@/types/api";
import { ErrorApi } from "@/lib/api/admin-servicios";

const API_URL = "/api/admin/medios.php";

/** Formatos aceptados por el servidor (nunca SVG: puede llevar código). */
export const TIPOS_ACEPTADOS = ["image/jpeg", "image/png", "image/webp"];

/** Tamaño máximo que se envía por uso (el servidor vuelve a ajustar y regenerar). */
const LADO_MAXIMO: Record<UsoImagen, number> = { logo: 1600, favicon: 512, compartir: 2400, foto: 2400 };

/**
 * Peso por debajo del cual se envía el archivo tal cual. El hosting suele limitar las
 * subidas a 2 MB, así que todo lo que pase de aquí se reduce antes de enviar.
 */
const PESO_SIN_REDUCIR = 1.5 * 1024 * 1024;

/**
 * Reduce la imagen en el navegador si es muy grande (fotos del celular de 4–12 MB).
 * Logos e íconos se mantienen en PNG para conservar la transparencia; las fotos van en JPG.
 */
async function prepararImagen(archivo: File, uso: UsoImagen): Promise<Blob> {
  let imagen: ImageBitmap;
  try {
    imagen = await createImageBitmap(archivo);
  } catch {
    throw new ErrorApi("No se pudo leer la imagen. Prueba con otro archivo.", 400);
  }

  const lado = LADO_MAXIMO[uso];
  const escala = Math.min(1, lado / Math.max(imagen.width, imagen.height));
  if (escala === 1 && archivo.size <= PESO_SIN_REDUCIR) {
    imagen.close();
    return archivo;
  }

  const lienzo = document.createElement("canvas");
  lienzo.width = Math.max(1, Math.round(imagen.width * escala));
  lienzo.height = Math.max(1, Math.round(imagen.height * escala));
  const ctx = lienzo.getContext("2d");
  if (!ctx) {
    imagen.close();
    return archivo;
  }
  ctx.drawImage(imagen, 0, 0, lienzo.width, lienzo.height);
  imagen.close();

  const conTransparencia = uso === "logo" || uso === "favicon";
  const blob = await new Promise<Blob | null>((resolve) =>
    lienzo.toBlob(resolve, conTransparencia ? "image/png" : "image/jpeg", 0.88)
  );
  return blob ?? archivo;
}

/** Sube una imagen para el uso indicado y devuelve el nombre que se guarda en el contenido. */
export async function subirImagen(archivo: File, uso: UsoImagen, csrfToken: string): Promise<MedioSubido> {
  if (!TIPOS_ACEPTADOS.includes(archivo.type)) {
    throw new ErrorApi("Formato no permitido. Usa una imagen JPG, PNG o WebP.", 400);
  }

  const contenido = await prepararImagen(archivo, uso);
  const datos = new FormData();
  const extension = contenido.type === "image/png" ? "png" : contenido.type === "image/webp" ? "webp" : "jpg";
  datos.append("archivo", contenido, `imagen.${extension}`);
  datos.append("uso", uso);

  const respuesta = await fetch(API_URL, {
    method: "POST",
    credentials: "include",
    headers: { "X-CSRF-Token": csrfToken },
    body: datos,
  });
  let json: MedioSubidoResponse | null = null;
  try {
    json = (await respuesta.json()) as MedioSubidoResponse;
  } catch {
    /* respuesta sin JSON (por ejemplo, el servidor cortó una subida demasiado grande) */
  }
  if (!respuesta.ok || !json?.success || !json.data) {
    const detalle = json?.errors?.archivo ?? json?.errors?.uso;
    throw new ErrorApi(
      detalle || json?.message || `No se pudo subir la imagen (${respuesta.status}).`,
      respuesta.status,
      json?.errors
    );
  }
  return json.data;
}
