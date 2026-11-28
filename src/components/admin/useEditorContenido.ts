import { useCallback, useEffect, useState } from "react";
import { useForm, type DefaultValues, type FieldValues, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z, type ZodTypeAny } from "zod";
import { useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { claveContenido, combinarConRespaldo } from "@/lib/contenidos";
import type { ContenidoAdminResponse, ContenidoSeccion } from "@/types/api";
import { toast } from "@/components/ui/sonner";

export const formatearFecha = (fecha: string) =>
  new Date(fecha.replace(" ", "T")).toLocaleString("es-CO", { dateStyle: "medium", timeStyle: "short" });

// Reglas de zod que reflejan las del servidor (contenidos_schema() en PHP)
export const zTexto = (max: number) =>
  z.string().max(max, `Máximo ${max} caracteres.`).refine((v) => !v.includes("\n"), "Debe ser una sola línea.");
export const zMultilinea = (max: number) => z.string().max(max, `Máximo ${max} caracteres.`);
export const zObligatorio = (regla: ZodTypeAny, mensaje: string) => regla.refine((v: string) => v.trim() !== "", mensaje);

interface Opciones<T extends FieldValues> {
  seccion: ContenidoSeccion;
  respaldo: T;
  esquema: ZodTypeAny;
  /** Claves de subcampos de lista que el servidor puede reportar, ej. /^pasos\.\d+\.(titulo|descripcion)$/ */
  clavesLista: RegExp;
  /** Texto de la notificación al guardar */
  mensajeGuardado: string;
}

/**
 * Carga, guardado y manejo de errores de un editor de sección del CMS.
 * Misma lógica que el resto de editores: GET admin → formulario → PUT con CSRF,
 * errores del servidor por campo, 401 → checkSession(), e invalidación de react-query.
 */
export function useEditorContenido<T extends FieldValues>({ seccion, respaldo, esquema, clavesLista, mensajeGuardado }: Opciones<T>) {
  const { user, csrfToken, checkSession } = useAuth();
  const queryClient = useQueryClient();
  const puedeEditar = user?.rol === "admin" || user?.rol === "editor";
  const url = `/api/admin/contenidos.php?seccion=${seccion}`;

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [meta, setMeta] = useState<{ en: string | null; por: string | null }>({ en: null, por: null });

  const form = useForm<T>({
    resolver: zodResolver(esquema) as Resolver<T>,
    mode: "onTouched",
    defaultValues: respaldo as DefaultValues<T>,
  });
  const { reset, setError: setFieldError } = form;

  const aplicar = useCallback(
    (data: NonNullable<ContenidoAdminResponse<T>["data"]>) => {
      reset(combinarConRespaldo(respaldo, data.datos as Partial<T>) as DefaultValues<T>);
      setMeta({ en: data.actualizado_en, por: data.actualizado_por });
    },
    [reset, respaldo]
  );

  const sesionExpirada = useCallback(async () => {
    toast.error("Tu sesión expiró", { description: "Inicia sesión nuevamente para continuar." });
    await checkSession();
  }, [checkSession]);

  const cargar = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const respuesta = await fetch(url, { credentials: "include" });
      if (respuesta.status === 401) return sesionExpirada();
      const json = (await respuesta.json()) as ContenidoAdminResponse<T>;
      if (!respuesta.ok || !json.success || !json.data) {
        throw new Error(json.message || `Error del servidor (${respuesta.status}).`);
      }
      aplicar(json.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo conectar con el servidor.");
    } finally {
      setIsLoading(false);
    }
  }, [url, aplicar, sesionExpirada]);

  useEffect(() => {
    cargar();
  }, [cargar]);

  const guardar = async (datos: T) => {
    if (!csrfToken) {
      toast.error("No se pudo validar tu sesión", { description: "Recarga la página e intenta de nuevo." });
      return;
    }
    setIsSaving(true);
    try {
      const respuesta = await fetch(url, {
        method: "PUT",
        credentials: "include",
        headers: { "Content-Type": "application/json", "X-CSRF-Token": csrfToken },
        body: JSON.stringify({ datos }),
      });
      if (respuesta.status === 401) return sesionExpirada();
      const json = (await respuesta.json()) as ContenidoAdminResponse<T>;

      if (respuesta.status === 400 && json.errors) {
        let general = "";
        for (const [clave, mensaje] of Object.entries(json.errors)) {
          // "Paso 2 · Título: máximo 100 caracteres." → "máximo 100 caracteres."
          const limpio = mensaje.replace(/^[^·:]+ \d+ · /, "").replace(/^[^:]+: /, "");
          if (clavesLista.test(clave) || clave in respaldo) {
            setFieldError(clave as Parameters<typeof setFieldError>[0], { type: "server", message: limpio });
          } else {
            general = mensaje;
          }
        }
        toast.error("Revisa los campos marcados", general ? { description: general } : undefined);
        return;
      }
      if (!respuesta.ok || !json.success || !json.data) {
        throw new Error(json.message || `Error del servidor (${respuesta.status}).`);
      }

      aplicar(json.data);
      await queryClient.invalidateQueries({ queryKey: claveContenido(seccion) });
      toast.success("Cambios guardados", { description: mensajeGuardado });
    } catch (err) {
      toast.error("No se pudieron guardar los cambios", {
        description: err instanceof Error ? err.message : "Intenta de nuevo.",
      });
    } finally {
      setIsSaving(false);
    }
  };

  return { form, puedeEditar, isLoading, error, isSaving, meta, cargar, guardar };
}
