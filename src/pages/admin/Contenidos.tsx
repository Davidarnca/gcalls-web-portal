import React, { useCallback, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useQueryClient } from "@tanstack/react-query";
import { AlertCircle, ExternalLink, Info, Lock, RefreshCw, Save } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import {
  CONTENIDO_GLOBAL_DEFAULT,
  claveContenido,
  combinarConRespaldo,
} from "@/lib/contenidos";
import type { ContenidoAdminResponse, ContenidoGlobal } from "@/types/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/components/ui/sonner";

const API_URL = "/api/admin/contenidos.php?seccion=global";

// ── Validación en el navegador ───────────────────────────────────────────────
// Refleja las reglas de public/api/config/contenidos.php para avisar antes de enviar.
// La validación definitiva la hace siempre el servidor.

const opcional = (regla: z.ZodTypeAny) => z.union([z.literal(""), regla]);
const urlHttps = opcional(
  z.string().max(300, "Máximo 300 caracteres.").regex(/^https:\/\/[^\s/]+\.[^\s]+$/i, "Debe empezar por https:// y ser una dirección completa.")
);
const telefono = opcional(
  z.string().regex(/^\+?[0-9 ()-]{7,30}( ?(ext\.?|extensión) ?[0-9]{1,6})?$/i, "Usa solo números, espacios, +, - y paréntesis.")
);

const esquema = z.object({
  email: opcional(z.string().max(180, "Máximo 180 caracteres.").email("No es un correo válido.")),
  telefono,
  telefono_secundario: telefono,
  whatsapp: opcional(
    z.string().refine((v) => /^[0-9]{10,15}$/.test(v.replace(/[\s\-+()]/g, "")), "Escribe el número con indicativo de país, ej. 57 320 123 4567.")
  ),
  direccion: z.string().max(200, "Máximo 200 caracteres."),
  ciudad: z.string().max(100, "Máximo 100 caracteres."),
  horario: z.string().max(500, "Máximo 500 caracteres."),
  linkedin: urlHttps,
  facebook: urlHttps,
  instagram: urlHttps,
});

type Campo = keyof ContenidoGlobal;

interface DefCampo {
  nombre: Campo;
  etiqueta: string;
  ayuda?: string;
  placeholder?: string;
  multilinea?: boolean;
  tipo?: string;
}

const GRUPOS: { titulo: string; descripcion: string; campos: DefCampo[] }[] = [
  {
    titulo: "Contacto",
    descripcion: "Aparece en el pie de página y en la página de Contactos.",
    campos: [
      { nombre: "email", etiqueta: "Correo de contacto", tipo: "email", placeholder: "Ej. contacto@gcallssas.com" },
      { nombre: "telefono", etiqueta: "Teléfono principal", tipo: "tel", placeholder: "Ej. +57 601 123 4567" },
      { nombre: "telefono_secundario", etiqueta: "Teléfono secundario", tipo: "tel", placeholder: "Ej. +57 320 123 4567" },
      {
        nombre: "whatsapp",
        etiqueta: "WhatsApp (botón flotante)",
        tipo: "tel",
        placeholder: "Ej. 57 320 123 4567",
        ayuda: "Con indicativo de país. Si lo dejas vacío, el botón de WhatsApp no aparece.",
      },
    ],
  },
  {
    titulo: "Ubicación y horario",
    descripcion: "La dirección enlaza a Google Maps.",
    campos: [
      { nombre: "direccion", etiqueta: "Dirección", placeholder: "Ej. Calle 100 # 10-20, Oficina 501" },
      { nombre: "ciudad", etiqueta: "Ciudad", placeholder: "Ej. Bogotá, Colombia" },
      {
        nombre: "horario",
        etiqueta: "Horario de atención",
        multilinea: true,
        placeholder: "Ej. Lunes a viernes: 8:00 a. m. - 5:00 p. m.",
        ayuda: "Escribe un renglón por línea.",
      },
    ],
  },
  {
    titulo: "Redes sociales",
    descripcion: "Solo se muestran los íconos de las redes que tengan enlace.",
    campos: [
      { nombre: "linkedin", etiqueta: "LinkedIn", tipo: "url", placeholder: "Ej. https://www.linkedin.com/company/..." },
      { nombre: "facebook", etiqueta: "Facebook", tipo: "url", placeholder: "Ej. https://www.facebook.com/..." },
      { nombre: "instagram", etiqueta: "Instagram", tipo: "url", placeholder: "Ej. https://www.instagram.com/..." },
    ],
  },
];

const formatearFecha = (fecha: string) =>
  new Date(fecha.replace(" ", "T")).toLocaleString("es-CO", {
    dateStyle: "medium",
    timeStyle: "short",
  });

const AdminContenidos: React.FC = () => {
  const { user, csrfToken, checkSession } = useAuth();
  const queryClient = useQueryClient();
  const puedeEditar = user?.rol === "admin" || user?.rol === "editor";

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [meta, setMeta] = useState<{ actualizadoEn: string | null; actualizadoPor: string | null }>({
    actualizadoEn: null,
    actualizadoPor: null,
  });

  const form = useForm<ContenidoGlobal>({
    resolver: zodResolver(esquema),
    defaultValues: CONTENIDO_GLOBAL_DEFAULT,
    // Valida al salir del campo y, una vez tocado, en cada cambio: el error
    // desaparece apenas el usuario lo corrige.
    mode: "onTouched",
  });
  const { register, handleSubmit, reset, setError: setFieldError, formState } = form;

  const aplicarRespuesta = useCallback(
    (data: NonNullable<ContenidoAdminResponse<ContenidoGlobal>["data"]>) => {
      reset(combinarConRespaldo(CONTENIDO_GLOBAL_DEFAULT, data.datos));
      setMeta({ actualizadoEn: data.actualizado_en, actualizadoPor: data.actualizado_por });
    },
    [reset]
  );

  const cargar = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const respuesta = await fetch(API_URL, { credentials: "include" });
      if (respuesta.status === 401) {
        toast.error("Tu sesión expiró", { description: "Inicia sesión nuevamente para continuar." });
        await checkSession();
        return;
      }
      const json = (await respuesta.json()) as ContenidoAdminResponse<ContenidoGlobal>;
      if (!respuesta.ok || !json.success || !json.data) {
        throw new Error(json.message || `Error del servidor (${respuesta.status}).`);
      }
      aplicarRespuesta(json.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo conectar con el servidor.");
    } finally {
      setIsLoading(false);
    }
  }, [aplicarRespuesta, checkSession]);

  useEffect(() => {
    cargar();
  }, [cargar]);

  const guardar = async (valores: ContenidoGlobal) => {
    if (!csrfToken) {
      toast.error("No se pudo validar tu sesión", { description: "Recarga la página e intenta de nuevo." });
      return;
    }
    setIsSaving(true);
    try {
      const respuesta = await fetch(API_URL, {
        method: "PUT",
        credentials: "include",
        headers: { "Content-Type": "application/json", "X-CSRF-Token": csrfToken },
        body: JSON.stringify({ datos: valores }),
      });

      if (respuesta.status === 401) {
        toast.error("Tu sesión expiró", { description: "Inicia sesión nuevamente para continuar." });
        await checkSession();
        return;
      }

      const json = (await respuesta.json()) as ContenidoAdminResponse<ContenidoGlobal>;

      if (respuesta.status === 400 && json.errors) {
        for (const [campo, mensaje] of Object.entries(json.errors)) {
          if (campo in CONTENIDO_GLOBAL_DEFAULT) {
            setFieldError(campo as Campo, { type: "server", message: mensaje.replace(/^[^:]+: /, "") });
          }
        }
        toast.error("Revisa los campos marcados");
        return;
      }

      if (!respuesta.ok || !json.success || !json.data) {
        throw new Error(json.message || `Error del servidor (${respuesta.status}).`);
      }

      aplicarRespuesta(json.data);
      await queryClient.invalidateQueries({ queryKey: claveContenido("global") });
      toast.success("Cambios guardados", { description: "Ya se ven en el sitio." });
    } catch (err) {
      toast.error("No se pudieron guardar los cambios", {
        description: err instanceof Error ? err.message : "Intenta de nuevo.",
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="p-4 md:p-8 space-y-6 max-w-5xl mx-auto">
      {/* Encabezado */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-lg shadow-sm border">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-[#2b358e]">Datos de contacto y redes</h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Lo que guardes aquí se ve en el pie de página, la página de Contactos y el botón de WhatsApp.
          </p>
        </div>
        <Button asChild variant="outline" size="sm" className="border-[#0e7734] text-[#0e7734] hover:bg-[#0e7734]/10">
          <a href="/contactos" target="_blank" rel="noopener noreferrer">
            <ExternalLink className="h-4 w-4 mr-2" />
            Ver en el sitio
          </a>
        </Button>
      </div>

      {/* Estado: CARGA */}
      {isLoading && (
        <div className="bg-white rounded-lg border shadow-sm p-6 space-y-6">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="space-y-3">
              <Skeleton className="h-5 w-40" />
              <div className="grid md:grid-cols-2 gap-4">
                <Skeleton className="h-10" />
                <Skeleton className="h-10" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Estado: ERROR */}
      {!isLoading && error && (
        <div className="bg-white rounded-lg border border-destructive/30 p-8 shadow-sm text-center max-w-lg mx-auto space-y-4">
          <div className="w-12 h-12 rounded-full bg-destructive/10 text-destructive flex items-center justify-center mx-auto">
            <AlertCircle className="h-6 w-6" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-slate-800">No se pudo cargar el contenido</h2>
            <p className="text-sm text-muted-foreground mt-1">{error}</p>
          </div>
          <Button onClick={cargar} className="bg-[#2b358e] hover:bg-[#2b358e]/90 text-white">
            <RefreshCw className="h-4 w-4 mr-2" />
            Reintentar
          </Button>
        </div>
      )}

      {/* Formulario */}
      {!isLoading && !error && (
        <form onSubmit={handleSubmit(guardar)} noValidate className="space-y-6">
          {!puedeEditar && (
            <div className="flex items-start gap-3 rounded-lg border border-amber-300 bg-amber-50 p-4 text-sm text-amber-900">
              <Lock className="h-4 w-4 mt-0.5 flex-shrink-0" />
              Tu rol solo permite consultar este contenido. Para editarlo, pide a un administrador el rol de editor.
            </div>
          )}

          {!meta.actualizadoEn && (
            <div className="flex items-start gap-3 rounded-lg border border-blue-200 bg-blue-50 p-4 text-sm text-blue-900">
              <Info className="h-4 w-4 mt-0.5 flex-shrink-0" />
              Este contenido aún no se ha guardado: el sitio muestra los valores de respaldo que ves abajo.
            </div>
          )}

          <fieldset disabled={!puedeEditar || isSaving} className="space-y-6">
            {GRUPOS.map((grupo) => (
              <section key={grupo.titulo} className="bg-white rounded-lg border shadow-sm p-6">
                <h2 className="text-lg font-semibold text-slate-800">{grupo.titulo}</h2>
                <p className="text-sm text-muted-foreground mb-5">{grupo.descripcion}</p>
                <div className="grid md:grid-cols-2 gap-x-6 gap-y-5">
                  {grupo.campos.map((campo) => {
                    const mensaje = formState.errors[campo.nombre]?.message;
                    const idAyuda = `${campo.nombre}-ayuda`;
                    return (
                      <div key={campo.nombre} className={campo.multilinea ? "md:col-span-2 space-y-2" : "space-y-2"}>
                        <Label htmlFor={campo.nombre}>{campo.etiqueta}</Label>
                        {campo.multilinea ? (
                          <Textarea
                            id={campo.nombre}
                            rows={4}
                            placeholder={campo.placeholder}
                            aria-invalid={Boolean(mensaje)}
                            aria-describedby={idAyuda}
                            {...register(campo.nombre)}
                          />
                        ) : (
                          <Input
                            id={campo.nombre}
                            type={campo.tipo ?? "text"}
                            placeholder={campo.placeholder}
                            aria-invalid={Boolean(mensaje)}
                            aria-describedby={idAyuda}
                            {...register(campo.nombre)}
                          />
                        )}
                        <p id={idAyuda} className={`text-xs ${mensaje ? "text-destructive font-medium" : "text-muted-foreground"}`}>
                          {mensaje ?? campo.ayuda ?? "Déjalo vacío para no mostrarlo en el sitio."}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </section>
            ))}
          </fieldset>

          <div className="sticky bottom-0 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white/95 backdrop-blur border rounded-lg shadow-sm p-4">
            <p className="text-xs text-muted-foreground">
              {meta.actualizadoEn
                ? `Última actualización: ${formatearFecha(meta.actualizadoEn)}${meta.actualizadoPor ? ` por ${meta.actualizadoPor}` : ""}`
                : "Sin cambios guardados todavía."}
            </p>
            {puedeEditar && (
              <Button
                type="submit"
                disabled={isSaving || (!formState.isDirty && Boolean(meta.actualizadoEn))}
                className="bg-[#0e7734] hover:bg-[#0e7734]/90 text-white"
              >
                <Save className={`h-4 w-4 mr-2 ${isSaving ? "animate-pulse" : ""}`} />
                {isSaving ? "Guardando..." : "Guardar cambios"}
              </Button>
            )}
          </div>
        </form>
      )}
    </div>
  );
};

export default AdminContenidos;
