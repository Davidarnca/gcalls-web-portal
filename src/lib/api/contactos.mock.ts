import { ContactoPayload, ApiResponse } from "@/pages/Contactos";

export interface MockFetchResponse {
  status: number;
  ok: boolean;
  json: () => Promise<ApiResponse>;
}

export const mockFetchContacto = async (payload: ContactoPayload): Promise<MockFetchResponse> => {
  // Simular latencia de red (800ms)
  await new Promise((resolve) => setTimeout(resolve, 800));

  // Disparador trivial de error: si el email incluye la palabra "error"
  if (payload.email.toLowerCase().includes("error")) {
    return {
      status: 400,
      ok: false,
      json: async () => ({
        success: false,
        message: "Los datos enviados contienen errores. Por favor revísalos.",
        errors: {
          email: "El correo proporcionado es inválido o no permitido (Mock).",
        },
      }),
    };
  }

  // Respuesta de éxito simulada
  return {
    status: 200,
    ok: true,
    json: async () => ({
      success: true,
      message: "¡Gracias por contactarnos! Nos pondremos en contacto contigo pronto (Mock).",
      data: {
        id: 999,
        estado: "nuevo",
        fecha_registro: new Date().toISOString().slice(0, 19).replace('T', ' '),
      },
    }),
  };
};
