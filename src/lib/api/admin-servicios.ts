import type {
  ServicioAdminApi,
  ServicioAdminResponse,
  ServicioPatch,
  ServiciosAdminResponse,
} from "@/types/api";

const API_URL = "/api/admin/servicios.php";

/** Error con el estado HTTP y los errores por campo que devolvió la API. */
export class ErrorApi extends Error {
  constructor(
    message: string,
    public readonly status: number,
    public readonly errors?: Record<string, string>
  ) {
    super(message);
  }
}

export async function listarServiciosAdmin(): Promise<ServicioAdminApi[]> {
  const respuesta = await fetch(API_URL, { credentials: "include" });
  let json: ServiciosAdminResponse | null = null;
  try {
    json = (await respuesta.json()) as ServiciosAdminResponse;
  } catch {
    /* respuesta sin JSON */
  }
  if (!respuesta.ok || !json?.success || !json.data) {
    throw new ErrorApi(json?.message || `Error del servidor (${respuesta.status}).`, respuesta.status);
  }
  return json.data.servicios;
}

export async function actualizarServicio(
  id: number,
  cambios: ServicioPatch,
  csrfToken: string
): Promise<ServicioAdminApi> {
  const respuesta = await fetch(`${API_URL}?id=${id}`, {
    method: "PATCH",
    credentials: "include",
    headers: { "Content-Type": "application/json", "X-CSRF-Token": csrfToken },
    body: JSON.stringify(cambios),
  });
  let json: ServicioAdminResponse | null = null;
  try {
    json = (await respuesta.json()) as ServicioAdminResponse;
  } catch {
    /* respuesta sin JSON */
  }
  if (!respuesta.ok || !json?.success || !json.data) {
    throw new ErrorApi(json?.message || `Error del servidor (${respuesta.status}).`, respuesta.status, json?.errors);
  }
  return json.data.servicio;
}
