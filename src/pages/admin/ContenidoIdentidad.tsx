import React, { useCallback, useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { useQueryClient } from "@tanstack/react-query";
import { AlertCircle, ExternalLink, Info, Lock, RefreshCw, Save } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { CONTENIDO_IDENTIDAD_DEFAULT, claveContenido, combinarConRespaldo } from "@/lib/contenidos";
import type { ContenidoAdminResponse, ContenidoIdentidad, UsoImagen } from "@/types/api";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "@/components/ui/sonner";
import ContenidosTabs from "@/components/admin/ContenidosTabs";
import CampoImagen from "@/components/admin/CampoImagen";
import logoOriginal from "@/assets/logo.svg";
import logoPieOriginal from "@/assets/footer-logo.png";

const API_URL = "/api/admin/contenidos.php?seccion=identidad";

type Campo = keyof ContenidoIdentidad;

interface DefImagen {
  nombre: Campo;
  etiqueta: string;
  uso: UsoImagen;
  respaldo: string;
  ayuda: string;
  fondoOscuro?: boolean;
}

const GRUPOS: { titulo: string; descripcion: string; campos: DefImagen[] }[] = [
  {
    titulo: "Logos",
    descripcion: "Si no subes ninguno, el sitio usa el logo original.",
    campos: [
      {
        nombre: "logo",
        etiqueta: "Logo del menú",
        uso: "logo",
        respaldo: logoOriginal,
        ayuda: "Aparece arriba en todas las páginas y en la pantalla de mantenimiento.",
      },
      {
        nombre: "logo_pie",
        etiqueta: "Logo del pie de página",
        uso: "logo",
        respaldo: logoPieOriginal,
        ayuda: "Va sobre fondo azul oscuro: usa una versión que se vea bien en fondo oscuro.",
        fondoOscuro: true,
      },
    ],
  },
  {
    titulo: "Navegador y redes",
    descripcion: "Imágenes que ven quienes abren o comparten el sitio. Los cambios pueden tardar en verse por la caché de cada servicio.",
    campos: [
      {
        nombre: "favicon",
        etiqueta: "Ícono de la pestaña",
        uso: "favicon",
        respaldo: "/favicon.png",
        ayuda: "El ícono pequeño junto al nombre del sitio en la pestaña del navegador.",
      },
      {
        nombre: "compartir",
        etiqueta: "Imagen al compartir",
        uso: "compartir",
        respaldo: "/og-image.jpg",
        ayuda: "La vista previa cuando alguien pega gcallssas.com en WhatsApp, LinkedIn o Facebook.",
      },
    ],
  },
];

const formatearFecha = (fecha: string) =>
  new Date(fecha.replace(" ", "T")).toLocaleString("es-CO", { dateStyle: "medium", timeStyle: "short" });

const AdminContenidoIdentidad: React.FC = () => {
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

  const form = useForm<ContenidoIdentidad>({ defaultValues: CONTENIDO_IDENTIDAD_DEFAULT });
  const { control, handleSubmit, reset, setError: setFieldError, formState } = form;

  const aplicarRespuesta = useCallback(
    (data: NonNullable<ContenidoAdminResponse<ContenidoIdentidad>["data"]>) => {
      reset(combinarConRespaldo(CONTENIDO_IDENTIDAD_DEFAULT, data.datos));
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
      const json = (await respuesta.json()) as ContenidoAdminResponse<ContenidoIdentidad>;
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

  const guardar = async (valores: ContenidoIdentidad) => {
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
      const json = (await respuesta.json()) as ContenidoAdminResponse<ContenidoIdentidad>;
      if (respuesta.status === 400 && json.errors) {
        for (const [campo, mensaje] of Object.entries(json.errors)) {
          if (campo in CONTENIDO_IDENTIDAD_DEFAULT) {
            setFieldError(campo as Campo, { type: "server", message: mensaje.replace(/^[^:]+: /, "") });
          }
        }
        toast.error("Revisa las imágenes marcadas");
        return;
      }
      if (!respuesta.ok || !json.success || !json.data) {
        throw new Error(json.message || `Error del servidor (${respuesta.status}).`);
      }
      aplicarRespuesta(json.data);
      await queryClient.invalidateQueries({ queryKey: claveContenido("identidad") });
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
      <ContenidosTabs />

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-lg shadow-sm border">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-[#2b358e]">Identidad</h1>
          <p className="text-muted-foreground mt-1 text-sm">Logos, ícono de la pestaña e imagen para compartir el sitio.</p>
        </div>
        <Button asChild variant="outline" size="sm" className="border-[#0e7734] text-[#0e7734] hover:bg-[#0e7734]/10">
          <a href="/" target="_blank" rel="noopener noreferrer">
            <ExternalLink className="h-4 w-4 mr-2" />
            Ver en el sitio
          </a>
        </Button>
      </div>

      {isLoading && (
        <div className="bg-white rounded-lg border shadow-sm p-6 space-y-6">
          {[...Array(2)].map((_, i) => (
            <div key={i} className="space-y-3">
              <Skeleton className="h-5 w-40" />
              <div className="grid md:grid-cols-2 gap-4">
                <Skeleton className="h-28" />
                <Skeleton className="h-28" />
              </div>
            </div>
          ))}
        </div>
      )}

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
              Aún no se ha guardado ninguna imagen: el sitio usa los logos e imágenes originales que ves abajo.
            </div>
          )}

          <fieldset disabled={!puedeEditar || isSaving} className="space-y-6">
            {GRUPOS.map((grupo) => (
              <section key={grupo.titulo} className="bg-white rounded-lg border shadow-sm p-6">
                <h2 className="text-lg font-semibold text-slate-800">{grupo.titulo}</h2>
                <p className="text-sm text-muted-foreground mb-5">{grupo.descripcion}</p>
                <div className="grid md:grid-cols-2 gap-x-6 gap-y-8">
                  {grupo.campos.map((campo) => (
                    <Controller
                      key={campo.nombre}
                      control={control}
                      name={campo.nombre}
                      render={({ field }) => (
                        <CampoImagen
                          id={campo.nombre}
                          etiqueta={campo.etiqueta}
                          uso={campo.uso}
                          valor={field.value}
                          onChange={(nombre) => field.onChange(nombre)}
                          respaldo={campo.respaldo}
                          textoRespaldo="Se usa la imagen original."
                          ayuda={campo.ayuda}
                          deshabilitado={!puedeEditar || isSaving}
                          fondoOscuro={campo.fondoOscuro}
                          error={formState.errors[campo.nombre]?.message}
                        />
                      )}
                    />
                  ))}
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
                disabled={isSaving || !formState.isDirty}
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

export default AdminContenidoIdentidad;
