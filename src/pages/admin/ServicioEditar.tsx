import React, { useCallback, useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { Controller, useFieldArray, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useQueryClient } from "@tanstack/react-query";
import {
  AlertCircle,
  ArrowDown,
  ArrowLeft,
  ArrowUp,
  ExternalLink,
  Lock,
  Plus,
  RefreshCw,
  RotateCcw,
  Save,
  Trash2,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { ErrorApi, actualizarServicio, listarServiciosAdmin } from "@/lib/api/admin-servicios";
import { NOMBRES_ICONOS } from "@/lib/iconos";
import SelectorIcono from "@/components/admin/SelectorIcono";
import CampoImagen from "@/components/admin/CampoImagen";
import {
  CLAVE_SERVICIOS,
  NOMBRES_TEMAS,
  SERVICIOS_RESPALDO,
  TEMAS,
  completarServicio,
  rutaServicio,
} from "@/lib/servicios";
import type { ServicioAdminApi, ServicioTema } from "@/types/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/components/ui/sonner";

// ── Validación en el navegador (refleja public/api/config/servicios.php) ─────

const MAX_TARJETAS = 6;
const lineasDe = (texto: string) => texto.split("\n").map((l) => l.trim()).filter(Boolean);

const esquema = z.object({
  titulo: z
    .string()
    .trim()
    .min(3, "Mínimo 3 caracteres.")
    .max(200, "Máximo 200 caracteres.")
    .refine((v) => !v.includes("\n"), "Debe ser una sola línea."),
  icono: z.string().refine((v) => NOMBRES_ICONOS.includes(v), "Elige un ícono de la lista."),
  tema: z.string().refine((v) => (NOMBRES_TEMAS as string[]).includes(v), "Elige un tema."),
  descripcion: z.string().trim().min(1, "La descripción no puede quedar vacía.").max(1500, "Máximo 1500 caracteres."),
  imagen: z.string(),
  tarjetas: z
    .array(
      z.object({
        titulo: z.string().trim().min(1, "El título es obligatorio.").max(100, "Máximo 100 caracteres."),
        icono: z.string().refine((v) => NOMBRES_ICONOS.includes(v), "Elige un ícono."),
        itemsTexto: z.string().superRefine((v, ctx) => {
          const items = lineasDe(v);
          if (items.length < 1 || items.length > 15) {
            ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Escribe entre 1 y 15 puntos, uno por línea." });
          } else if (items.some((i) => i.length > 300)) {
            ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Cada punto admite máximo 300 caracteres." });
          }
        }),
      })
    )
    .min(1, "Debe haber al menos una tarjeta.")
    .max(MAX_TARJETAS, `Máximo ${MAX_TARJETAS} tarjetas.`),
});

type Formulario = z.infer<typeof esquema>;

const aFormulario = (s: ReturnType<typeof completarServicio>): Formulario => ({
  titulo: s.titulo,
  icono: s.icono,
  tema: s.tema,
  descripcion: s.contenido.descripcion,
  imagen: s.contenido.imagen ?? "",
  tarjetas: s.contenido.tarjetas.map((t) => ({ titulo: t.titulo, icono: t.icono, itemsTexto: t.items.join("\n") })),
});

/** Convierte las claves de error de la API (ej. "tarjetas.0.items") en rutas del formulario. */
const rutaFormulario = (clave: string): string | null => {
  if (["titulo", "icono", "tema", "descripcion", "imagen"].includes(clave)) return clave;
  const m = clave.match(/^tarjetas\.(\d+)\.(titulo|icono|items)$/);
  if (m) return `tarjetas.${m[1]}.${m[2] === "items" ? "itemsTexto" : m[2]}`;
  return null;
};

// ── Página ───────────────────────────────────────────────────────────────────

const AdminServicioEditar: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const idNumero = Number(id);
  const { user, csrfToken, checkSession } = useAuth();
  const queryClient = useQueryClient();
  const puedeEditar = user?.rol === "admin" || user?.rol === "editor";

  const [servicio, setServicio] = useState<ServicioAdminApi | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const form = useForm<Formulario>({
    resolver: zodResolver(esquema),
    mode: "onTouched",
    defaultValues: { titulo: "", icono: "Briefcase", tema: "marca", descripcion: "", imagen: "", tarjetas: [] },
  });
  const { register, control, handleSubmit, reset, setError: setFieldError, formState, watch } = form;
  const tarjetas = useFieldArray({ control, name: "tarjetas" });

  const cargar = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const lista = await listarServiciosAdmin();
      const encontrado = lista.find((s) => s.id === idNumero) ?? null;
      setServicio(encontrado);
      if (encontrado) reset(aFormulario(completarServicio(encontrado)));
      else setError("Este servicio no existe.");
    } catch (err) {
      if (err instanceof ErrorApi && err.status === 401) {
        toast.error("Tu sesión expiró", { description: "Inicia sesión nuevamente para continuar." });
        await checkSession();
        return;
      }
      setError(err instanceof Error ? err.message : "No se pudo conectar con el servidor.");
    } finally {
      setIsLoading(false);
    }
  }, [idNumero, reset, checkSession]);

  useEffect(() => {
    cargar();
  }, [cargar]);

  const respaldo = servicio ? SERVICIOS_RESPALDO.find((r) => r.slug === servicio.slug) : undefined;

  const restaurarOriginal = () => {
    if (!respaldo) return;
    reset(aFormulario({ ...respaldo, id: servicio?.id ?? null }), { keepDefaultValues: true });
    toast.info("Contenido original cargado en el formulario", {
      description: "Revisa y pulsa «Guardar cambios» para aplicarlo.",
    });
  };

  const guardar = async (valores: Formulario) => {
    if (!servicio || !csrfToken) return;
    setIsSaving(true);
    try {
      const actualizado = await actualizarServicio(
        servicio.id,
        {
          titulo: valores.titulo.trim(),
          icono: valores.icono,
          tema: valores.tema as ServicioTema,
          contenido: {
            descripcion: valores.descripcion.trim(),
            imagen: valores.imagen,
            tarjetas: valores.tarjetas.map((t) => ({
              titulo: t.titulo.trim(),
              icono: t.icono,
              items: lineasDe(t.itemsTexto),
            })),
          },
        },
        csrfToken
      );
      setServicio(actualizado);
      reset(aFormulario(completarServicio(actualizado)));
      await queryClient.invalidateQueries({ queryKey: CLAVE_SERVICIOS });
      toast.success("Cambios guardados", {
        description: actualizado.activo ? "Ya se ven en el sitio." : "El servicio está oculto: publícalo para mostrarlo.",
      });
    } catch (err) {
      if (err instanceof ErrorApi && err.status === 401) {
        toast.error("Tu sesión expiró", { description: "Inicia sesión nuevamente para continuar." });
        await checkSession();
        return;
      }
      if (err instanceof ErrorApi && err.errors) {
        let generales = "";
        for (const [clave, mensaje] of Object.entries(err.errors)) {
          const ruta = rutaFormulario(clave);
          if (ruta) setFieldError(ruta as keyof Formulario, { type: "server", message: mensaje.replace(/^Tarjeta \d+: /, "") });
          else generales = mensaje;
        }
        toast.error("Revisa los campos marcados", generales ? { description: generales } : undefined);
        return;
      }
      toast.error("No se pudieron guardar los cambios", {
        description: err instanceof Error ? err.message : "Intenta de nuevo.",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const errores = formState.errors;
  const temaActual = watch("tema") as ServicioTema;

  return (
    <div className="p-4 md:p-8 space-y-6 max-w-5xl mx-auto">
      <Link to="/admin/servicios" className="inline-flex items-center text-sm text-muted-foreground hover:text-[#2b358e]">
        <ArrowLeft className="h-4 w-4 mr-1" /> Volver a Servicios
      </Link>

      {isLoading && (
        <div className="bg-white rounded-lg border shadow-sm p-6 space-y-4">
          <Skeleton className="h-8 w-2/3" />
          <Skeleton className="h-10" />
          <Skeleton className="h-24" />
          <Skeleton className="h-40" />
        </div>
      )}

      {!isLoading && error && (
        <div className="bg-white rounded-lg border border-destructive/30 p-8 shadow-sm text-center max-w-lg mx-auto space-y-4">
          <div className="w-12 h-12 rounded-full bg-destructive/10 text-destructive flex items-center justify-center mx-auto">
            <AlertCircle className="h-6 w-6" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-slate-800">No se pudo cargar el servicio</h2>
            <p className="text-sm text-muted-foreground mt-1">{error}</p>
          </div>
          <Button onClick={cargar} className="bg-[#2b358e] hover:bg-[#2b358e]/90 text-white">
            <RefreshCw className="h-4 w-4 mr-2" />
            Reintentar
          </Button>
        </div>
      )}

      {!isLoading && !error && servicio && (
        <form onSubmit={handleSubmit(guardar)} noValidate className="space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-lg shadow-sm border">
            <div className="min-w-0">
              <h1 className="text-2xl md:text-3xl font-bold text-[#2b358e] truncate">Editar servicio</h1>
              <p className="text-muted-foreground mt-1 text-sm">
                {servicio.activo ? "Publicado" : "Oculto"} · {rutaServicio(servicio.slug)}
              </p>
            </div>
            <div className="flex gap-2">
              {puedeEditar && respaldo && (
                <Button type="button" variant="outline" size="sm" onClick={restaurarOriginal}>
                  <RotateCcw className="h-4 w-4 mr-2" />
                  Restaurar original
                </Button>
              )}
              <Button asChild variant="outline" size="sm" className="border-[#0e7734] text-[#0e7734] hover:bg-[#0e7734]/10">
                <a href={rutaServicio(servicio.slug)} target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Ver en el sitio
                </a>
              </Button>
            </div>
          </div>

          {!puedeEditar && (
            <div className="flex items-start gap-3 rounded-lg border border-amber-300 bg-amber-50 p-4 text-sm text-amber-900">
              <Lock className="h-4 w-4 mt-0.5 flex-shrink-0" />
              Tu rol solo permite consultar este contenido.
            </div>
          )}

          <fieldset disabled={!puedeEditar || isSaving} className="space-y-6">
            {/* Encabezado del servicio */}
            <section className="bg-white rounded-lg border shadow-sm p-6 space-y-5">
              <h2 className="text-lg font-semibold text-slate-800">Encabezado</h2>

              <div className="space-y-2">
                <Label htmlFor="titulo">Título</Label>
                <Input id="titulo" aria-invalid={Boolean(errores.titulo)} {...register("titulo")} />
                <p className={`text-xs ${errores.titulo ? "text-destructive font-medium" : "text-muted-foreground"}`}>
                  {errores.titulo?.message ?? "Aparece en la página, en el menú, en el pie y en el formulario."}
                </p>
              </div>

              <div className="grid md:grid-cols-2 gap-5">
                <div className="space-y-2">
                  <Label htmlFor="icono">Ícono principal</Label>
                  <Controller
                    control={control}
                    name="icono"
                    render={({ field }) => (
                      <SelectorIcono id="icono" value={field.value} onChange={field.onChange} disabled={!puedeEditar} />
                    )}
                  />
                </div>

                <div className="space-y-2">
                  <Label id="tema-etiqueta">Tema de color</Label>
                  <Controller
                    control={control}
                    name="tema"
                    render={({ field }) => (
                      <div role="radiogroup" aria-labelledby="tema-etiqueta" className="flex flex-wrap gap-2">
                        {NOMBRES_TEMAS.map((clave) => (
                          <button
                            key={clave}
                            type="button"
                            role="radio"
                            aria-checked={field.value === clave}
                            aria-label={TEMAS[clave].etiqueta}
                            title={TEMAS[clave].etiqueta}
                            onClick={() => field.onChange(clave)}
                            className={`h-9 w-9 rounded-full border-2 transition ${TEMAS[clave].muestra} ${
                              field.value === clave ? "border-slate-900 ring-2 ring-offset-2 ring-slate-400" : "border-white shadow"
                            }`}
                          />
                        ))}
                      </div>
                    )}
                  />
                  <p className="text-xs text-muted-foreground">{TEMAS[temaActual]?.etiqueta}</p>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="descripcion">Descripción</Label>
                <Textarea id="descripcion" rows={4} aria-invalid={Boolean(errores.descripcion)} {...register("descripcion")} />
                <p className={`text-xs ${errores.descripcion ? "text-destructive font-medium" : "text-muted-foreground"}`}>
                  {errores.descripcion?.message ?? "Texto del recuadro central. Cada salto de línea crea un párrafo."}
                </p>
              </div>

              <Controller
                control={control}
                name="imagen"
                render={({ field }) => (
                  <CampoImagen
                    id="imagen"
                    etiqueta="Foto de fondo (opcional)"
                    uso="foto"
                    valor={field.value}
                    onChange={(nombre) => field.onChange(nombre)}
                    respaldo={null}
                    textoRespaldo="Sin foto: el encabezado usa solo los colores del tema."
                    deshabilitado={!puedeEditar || isSaving}
                    error={errores.imagen?.message}
                  />
                )}
              />
            </section>

            {/* Tarjetas */}
            <section className="bg-white rounded-lg border shadow-sm p-6 space-y-5">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <h2 className="text-lg font-semibold text-slate-800">Tarjetas</h2>
                  <p className="text-sm text-muted-foreground">
                    Se muestran en este orden debajo del encabezado. Entre 1 y {MAX_TARJETAS}.
                  </p>
                </div>
                {puedeEditar && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={tarjetas.fields.length >= MAX_TARJETAS}
                    onClick={() => tarjetas.append({ titulo: "", icono: "CheckCircle2", itemsTexto: "" }, { shouldFocus: true })}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Agregar tarjeta
                  </Button>
                )}
              </div>

              {errores.tarjetas?.root?.message || errores.tarjetas?.message ? (
                <p className="text-sm text-destructive font-medium">
                  {errores.tarjetas?.root?.message ?? errores.tarjetas?.message}
                </p>
              ) : null}

              <ol className="space-y-4">
                {tarjetas.fields.map((campo, i) => {
                  const e = errores.tarjetas?.[i];
                  return (
                    <li key={campo.id} className="rounded-lg border bg-slate-50/60 p-4 space-y-4">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-sm font-semibold text-slate-600">Tarjeta {i + 1}</span>
                        {puedeEditar && (
                          <div className="flex gap-1">
                            <Button type="button" variant="ghost" size="icon" aria-label={`Subir tarjeta ${i + 1}`} disabled={i === 0} onClick={() => tarjetas.move(i, i - 1)}>
                              <ArrowUp className="h-4 w-4" />
                            </Button>
                            <Button type="button" variant="ghost" size="icon" aria-label={`Bajar tarjeta ${i + 1}`} disabled={i === tarjetas.fields.length - 1} onClick={() => tarjetas.move(i, i + 1)}>
                              <ArrowDown className="h-4 w-4" />
                            </Button>
                            <Button type="button" variant="ghost" size="icon" aria-label={`Eliminar tarjeta ${i + 1}`} disabled={tarjetas.fields.length <= 1} onClick={() => tarjetas.remove(i)} className="text-destructive hover:text-destructive">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        )}
                      </div>

                      <div className="grid md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor={`tarjetas.${i}.titulo`}>Título</Label>
                          <Input id={`tarjetas.${i}.titulo`} aria-invalid={Boolean(e?.titulo)} {...register(`tarjetas.${i}.titulo` as const)} />
                          {e?.titulo && <p className="text-xs text-destructive font-medium">{e.titulo.message}</p>}
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor={`tarjetas.${i}.icono`}>Ícono</Label>
                          <Controller
                            control={control}
                            name={`tarjetas.${i}.icono` as const}
                            render={({ field }) => (
                              <SelectorIcono id={`tarjetas.${i}.icono`} value={field.value} onChange={field.onChange} disabled={!puedeEditar} />
                            )}
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor={`tarjetas.${i}.itemsTexto`}>Puntos</Label>
                        <Textarea id={`tarjetas.${i}.itemsTexto`} rows={5} aria-invalid={Boolean(e?.itemsTexto)} {...register(`tarjetas.${i}.itemsTexto` as const)} />
                        <p className={`text-xs ${e?.itemsTexto ? "text-destructive font-medium" : "text-muted-foreground"}`}>
                          {e?.itemsTexto?.message ?? "Un punto por línea (máximo 15)."}
                        </p>
                      </div>
                    </li>
                  );
                })}
              </ol>
            </section>
          </fieldset>

          {puedeEditar && (
            <div className="sticky bottom-0 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white/95 backdrop-blur border rounded-lg shadow-sm p-4">
              <p className="text-xs text-muted-foreground">
                {formState.isDirty ? "Tienes cambios sin guardar." : "Sin cambios pendientes."}
              </p>
              <Button type="submit" disabled={isSaving || !formState.isDirty} className="bg-[#0e7734] hover:bg-[#0e7734]/90 text-white">
                <Save className={`h-4 w-4 mr-2 ${isSaving ? "animate-pulse" : ""}`} />
                {isSaving ? "Guardando..." : "Guardar cambios"}
              </Button>
            </div>
          )}
        </form>
      )}
    </div>
  );
};

export default AdminServicioEditar;
