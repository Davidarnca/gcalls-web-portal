import React, { useCallback, useEffect, useState } from "react";
import { Controller, useFieldArray, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useQueryClient } from "@tanstack/react-query";
import { AlertCircle, ArrowDown, ArrowUp, ExternalLink, Info, Lock, Plus, RefreshCw, RotateCcw, Save, Trash2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { CONTENIDO_INICIO_DEFAULT, claveContenido, combinarConRespaldo } from "@/lib/contenidos";
import { ErrorApi, listarServiciosAdmin } from "@/lib/api/admin-servicios";
import { NOMBRES_ICONOS } from "@/lib/iconos";
import { completarServicio } from "@/lib/servicios";
import type { ContenidoAdminResponse, ContenidoInicio, ServicioAdminApi } from "@/types/api";
import ContenidosTabs from "@/components/admin/ContenidosTabs";
import SelectorIcono from "@/components/admin/SelectorIcono";
import CampoImagen from "@/components/admin/CampoImagen";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "@/components/ui/sonner";

const API_URL = "/api/admin/contenidos.php?seccion=inicio";
const MAX_TARJETAS = 8;

// ── Validación en el navegador (refleja contenidos_schema()['inicio'] en PHP) ──

const texto = (max: number) =>
  z.string().max(max, `Máximo ${max} caracteres.`).refine((v) => !v.includes("\n"), "Debe ser una sola línea.");
const multilinea = (max: number) => z.string().max(max, `Máximo ${max} caracteres.`);

const esquema = z.object({
  hero_imagen: z.string(),
  hero_antetitulo: texto(60),
  hero_titulo: texto(80),
  hero_titulo_destacado: texto(80),
  hero_descripcion: multilinea(400),
  hero_boton_principal: texto(40),
  hero_boton_secundario: texto(40),
  especialidades_titulo: texto(60),
  especialidades_destacado: texto(60),
  especialidades_descripcion: multilinea(300),
  especialidades: z
    .array(
      z.object({
        titulo: texto(120).refine((v) => v.trim() !== "", "El título es obligatorio."),
        descripcion: multilinea(300),
        icono: z.string().refine((v) => NOMBRES_ICONOS.includes(v), "Elige un ícono."),
        servicio: z.string().min(1, "Elige el servicio al que enlaza."),
      })
    )
    .min(1, "Debe haber al menos una tarjeta.")
    .max(MAX_TARJETAS, `Máximo ${MAX_TARJETAS} tarjetas.`),
  cta_titulo: texto(100),
  cta_descripcion: multilinea(300),
  cta_boton: texto(40),
});

type Campo = Exclude<keyof ContenidoInicio, "especialidades">;

interface DefCampo {
  nombre: Campo;
  etiqueta: string;
  ayuda?: string;
  multilinea?: boolean;
}

const BANNER: DefCampo[] = [
  { nombre: "hero_antetitulo", etiqueta: "Antetítulo", ayuda: "Línea superior, en blanco brillante." },
  { nombre: "hero_titulo", etiqueta: "Título" },
  { nombre: "hero_titulo_destacado", etiqueta: "Título destacado", ayuda: "Se muestra en color de acento." },
  { nombre: "hero_descripcion", etiqueta: "Descripción", multilinea: true },
  { nombre: "hero_boton_principal", etiqueta: "Botón principal", ayuda: "Lleva a Quiénes Somos." },
  { nombre: "hero_boton_secundario", etiqueta: "Botón secundario", ayuda: "Lleva a Contactos." },
];
const ESPECIALIDADES: DefCampo[] = [
  { nombre: "especialidades_titulo", etiqueta: "Título" },
  { nombre: "especialidades_destacado", etiqueta: "Título destacado", ayuda: "Se muestra en degradado de color." },
  { nombre: "especialidades_descripcion", etiqueta: "Descripción", multilinea: true },
];
const LLAMADA: DefCampo[] = [
  { nombre: "cta_titulo", etiqueta: "Título" },
  { nombre: "cta_descripcion", etiqueta: "Descripción", multilinea: true },
  { nombre: "cta_boton", etiqueta: "Botón", ayuda: "Lleva a Contactos." },
];

const formatearFecha = (fecha: string) =>
  new Date(fecha.replace(" ", "T")).toLocaleString("es-CO", { dateStyle: "medium", timeStyle: "short" });

const AdminContenidoInicio: React.FC = () => {
  const { user, csrfToken, checkSession } = useAuth();
  const queryClient = useQueryClient();
  const puedeEditar = user?.rol === "admin" || user?.rol === "editor";

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [servicios, setServicios] = useState<ServicioAdminApi[]>([]);
  const [meta, setMeta] = useState<{ en: string | null; por: string | null }>({ en: null, por: null });

  const form = useForm<ContenidoInicio>({
    resolver: zodResolver(esquema),
    mode: "onTouched",
    defaultValues: CONTENIDO_INICIO_DEFAULT,
  });
  const { register, control, handleSubmit, reset, setError: setFieldError, formState } = form;
  const tarjetas = useFieldArray({ control, name: "especialidades" });
  const errores = formState.errors;

  const aplicar = useCallback(
    (data: NonNullable<ContenidoAdminResponse<ContenidoInicio>["data"]>) => {
      reset(combinarConRespaldo(CONTENIDO_INICIO_DEFAULT, data.datos));
      setMeta({ en: data.actualizado_en, por: data.actualizado_por });
    },
    [reset]
  );

  const sesionExpirada = useCallback(async () => {
    toast.error("Tu sesión expiró", { description: "Inicia sesión nuevamente para continuar." });
    await checkSession();
  }, [checkSession]);

  const cargar = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [respuesta, lista] = await Promise.all([
        fetch(API_URL, { credentials: "include" }),
        listarServiciosAdmin(),
      ]);
      if (respuesta.status === 401) return sesionExpirada();
      const json = (await respuesta.json()) as ContenidoAdminResponse<ContenidoInicio>;
      if (!respuesta.ok || !json.success || !json.data) {
        throw new Error(json.message || `Error del servidor (${respuesta.status}).`);
      }
      setServicios(lista);
      aplicar(json.data);
    } catch (err) {
      if (err instanceof ErrorApi && err.status === 401) return sesionExpirada();
      setError(err instanceof Error ? err.message : "No se pudo conectar con el servidor.");
    } finally {
      setIsLoading(false);
    }
  }, [aplicar, sesionExpirada]);

  useEffect(() => {
    cargar();
  }, [cargar]);

  const restaurarOriginal = () => {
    reset(CONTENIDO_INICIO_DEFAULT, { keepDefaultValues: true });
    toast.info("Textos originales cargados en el formulario", {
      description: "Revisa y pulsa «Guardar cambios» para aplicarlos.",
    });
  };

  const guardar = async (valores: ContenidoInicio) => {
    if (!csrfToken) return;
    setIsSaving(true);
    try {
      const respuesta = await fetch(API_URL, {
        method: "PUT",
        credentials: "include",
        headers: { "Content-Type": "application/json", "X-CSRF-Token": csrfToken },
        body: JSON.stringify({ datos: valores }),
      });
      if (respuesta.status === 401) return sesionExpirada();
      const json = (await respuesta.json()) as ContenidoAdminResponse<ContenidoInicio>;

      if (respuesta.status === 400 && json.errors) {
        let general = "";
        for (const [clave, mensaje] of Object.entries(json.errors)) {
          const limpio = mensaje.replace(/^Tarjeta \d+ · /, "").replace(/^[^:]+: /, "");
          if (/^especialidades\.\d+\.(titulo|descripcion|icono|servicio)$/.test(clave) || clave in CONTENIDO_INICIO_DEFAULT) {
            setFieldError(clave as keyof ContenidoInicio, { type: "server", message: limpio });
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
      await queryClient.invalidateQueries({ queryKey: claveContenido("inicio") });
      toast.success("Cambios guardados", { description: "Ya se ven en la página de inicio." });
    } catch (err) {
      toast.error("No se pudieron guardar los cambios", {
        description: err instanceof Error ? err.message : "Intenta de nuevo.",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const campoSimple = (c: DefCampo) => {
    const mensaje = errores[c.nombre]?.message;
    return (
      <div key={c.nombre} className={c.multilinea ? "md:col-span-2 space-y-2" : "space-y-2"}>
        <Label htmlFor={c.nombre}>{c.etiqueta}</Label>
        {c.multilinea ? (
          <Textarea id={c.nombre} rows={3} aria-invalid={Boolean(mensaje)} {...register(c.nombre)} />
        ) : (
          <Input id={c.nombre} aria-invalid={Boolean(mensaje)} {...register(c.nombre)} />
        )}
        <p className={`text-xs ${mensaje ? "text-destructive font-medium" : "text-muted-foreground"}`}>
          {mensaje ?? c.ayuda ?? "Déjalo vacío para no mostrarlo."}
        </p>
      </div>
    );
  };

  return (
    <div className="p-4 md:p-8 space-y-6 max-w-5xl mx-auto">
      <ContenidosTabs />

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-lg shadow-sm border">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-[#2b358e]">Página de inicio</h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Banner principal, tarjetas de especialidades y llamada final.
          </p>
        </div>
        <div className="flex gap-2">
          {puedeEditar && !isLoading && !error && (
            <Button type="button" variant="outline" size="sm" onClick={restaurarOriginal}>
              <RotateCcw className="h-4 w-4 mr-2" />
              Restaurar original
            </Button>
          )}
          <Button asChild variant="outline" size="sm" className="border-[#0e7734] text-[#0e7734] hover:bg-[#0e7734]/10">
            <a href="/" target="_blank" rel="noopener noreferrer">
              <ExternalLink className="h-4 w-4 mr-2" />
              Ver en el sitio
            </a>
          </Button>
        </div>
      </div>

      {isLoading && (
        <div className="bg-white rounded-lg border shadow-sm p-6 space-y-4">
          <Skeleton className="h-6 w-40" />
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
              Tu rol solo permite consultar este contenido.
            </div>
          )}
          {!meta.en && (
            <div className="flex items-start gap-3 rounded-lg border border-blue-200 bg-blue-50 p-4 text-sm text-blue-900">
              <Info className="h-4 w-4 mt-0.5 flex-shrink-0" />
              Este contenido aún no se ha guardado: el sitio muestra los textos originales que ves abajo.
            </div>
          )}

          <fieldset disabled={!puedeEditar || isSaving} className="space-y-6">
            <section className="bg-white rounded-lg border shadow-sm p-6">
              <h2 className="text-lg font-semibold text-slate-800">Banner principal</h2>
              <p className="text-sm text-muted-foreground mb-5">La primera pantalla del sitio.</p>
              <div className="mb-6">
                <Controller
                  control={control}
                  name="hero_imagen"
                  render={({ field }) => (
                    <CampoImagen
                      id="hero_imagen"
                      etiqueta="Foto de fondo (opcional)"
                      uso="foto"
                      valor={field.value}
                      onChange={(nombre) => field.onChange(nombre)}
                      respaldo={null}
                      textoRespaldo="Sin foto: el banner muestra solo el degradado verde y azul."
                      deshabilitado={!puedeEditar || isSaving}
                      error={errores.hero_imagen?.message}
                    />
                  )}
                />
              </div>
              <div className="grid md:grid-cols-2 gap-x-6 gap-y-5">{BANNER.map(campoSimple)}</div>
            </section>

            <section className="bg-white rounded-lg border shadow-sm p-6 space-y-5">
              <div>
                <h2 className="text-lg font-semibold text-slate-800">Especialidades</h2>
                <p className="text-sm text-muted-foreground">
                  Carrusel de tarjetas. Cada tarjeta enlaza a un servicio; si ese servicio está oculto, la tarjeta no se muestra.
                </p>
              </div>
              <div className="grid md:grid-cols-2 gap-x-6 gap-y-5">{ESPECIALIDADES.map(campoSimple)}</div>

              <div className="flex items-center justify-between gap-4 pt-2">
                <h3 className="font-semibold text-slate-700">Tarjetas ({tarjetas.fields.length} de {MAX_TARJETAS})</h3>
                {puedeEditar && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={tarjetas.fields.length >= MAX_TARJETAS}
                    onClick={() => tarjetas.append({ titulo: "", descripcion: "", icono: "CheckCircle2", servicio: "" }, { shouldFocus: true })}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Agregar tarjeta
                  </Button>
                )}
              </div>
              {(errores.especialidades?.root?.message || errores.especialidades?.message) && (
                <p className="text-sm text-destructive font-medium">
                  {errores.especialidades?.root?.message ?? errores.especialidades?.message}
                </p>
              )}

              <ol className="space-y-4">
                {tarjetas.fields.map((campo, i) => {
                  const e = errores.especialidades?.[i];
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
                        <div className="space-y-2 md:col-span-2">
                          <Label htmlFor={`especialidades.${i}.titulo`}>Título</Label>
                          <Input id={`especialidades.${i}.titulo`} aria-invalid={Boolean(e?.titulo)} {...register(`especialidades.${i}.titulo` as const)} />
                          {e?.titulo && <p className="text-xs text-destructive font-medium">{e.titulo.message}</p>}
                        </div>
                        <div className="space-y-2 md:col-span-2">
                          <Label htmlFor={`especialidades.${i}.descripcion`}>Descripción</Label>
                          <Textarea id={`especialidades.${i}.descripcion`} rows={3} aria-invalid={Boolean(e?.descripcion)} {...register(`especialidades.${i}.descripcion` as const)} />
                          {e?.descripcion && <p className="text-xs text-destructive font-medium">{e.descripcion.message}</p>}
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor={`especialidades.${i}.icono`}>Ícono</Label>
                          <Controller
                            control={control}
                            name={`especialidades.${i}.icono` as const}
                            render={({ field }) => (
                              <SelectorIcono id={`especialidades.${i}.icono`} value={field.value} onChange={field.onChange} disabled={!puedeEditar} />
                            )}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor={`especialidades.${i}.servicio`}>Enlaza a</Label>
                          <Controller
                            control={control}
                            name={`especialidades.${i}.servicio` as const}
                            render={({ field }) => (
                              <Select value={field.value} onValueChange={field.onChange} disabled={!puedeEditar}>
                                <SelectTrigger id={`especialidades.${i}.servicio`} aria-invalid={Boolean(e?.servicio)}>
                                  <SelectValue placeholder="Elige un servicio" />
                                </SelectTrigger>
                                <SelectContent>
                                  {servicios.map((s) => (
                                    <SelectItem key={s.slug} value={s.slug}>
                                      {completarServicio(s).titulo}
                                      {s.activo ? "" : " (oculto: la tarjeta no se mostrará)"}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            )}
                          />
                          {e?.servicio && <p className="text-xs text-destructive font-medium">{e.servicio.message}</p>}
                        </div>
                      </div>
                    </li>
                  );
                })}
              </ol>
            </section>

            <section className="bg-white rounded-lg border shadow-sm p-6">
              <h2 className="text-lg font-semibold text-slate-800">Llamada final</h2>
              <p className="text-sm text-muted-foreground mb-5">Franja de color al final de la página.</p>
              <div className="grid md:grid-cols-2 gap-x-6 gap-y-5">{LLAMADA.map(campoSimple)}</div>
            </section>
          </fieldset>

          <div className="sticky bottom-0 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white/95 backdrop-blur border rounded-lg shadow-sm p-4">
            <p className="text-xs text-muted-foreground">
              {meta.en
                ? `Última actualización: ${formatearFecha(meta.en)}${meta.por ? ` por ${meta.por}` : ""}`
                : "Sin cambios guardados todavía."}
            </p>
            {puedeEditar && (
              <Button
                type="submit"
                disabled={isSaving || (!formState.isDirty && Boolean(meta.en))}
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

export default AdminContenidoInicio;
