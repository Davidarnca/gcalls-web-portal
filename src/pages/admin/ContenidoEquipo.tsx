import React, { useCallback, useEffect, useState } from "react";
import { Controller, useFieldArray, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useQueryClient } from "@tanstack/react-query";
import { AlertCircle, ArrowDown, ArrowUp, ExternalLink, Info, Lock, Plus, RefreshCw, RotateCcw, Save, Trash2, UserPlus } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { CONTENIDO_EQUIPO_DEFAULT, claveContenido, combinarConRespaldo } from "@/lib/contenidos";
import { NOMBRES_ICONOS } from "@/lib/iconos";
import type { ContenidoAdminResponse, ContenidoEquipo, MiembroEquipo } from "@/types/api";
import ContenidosTabs from "@/components/admin/ContenidosTabs";
import SelectorIcono from "@/components/admin/SelectorIcono";
import CampoImagen from "@/components/admin/CampoImagen";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/components/ui/sonner";

const API_URL = "/api/admin/contenidos.php?seccion=equipo";
const MAX_MIEMBROS = 12;
const MAX_VALORES = 6;
const MAX_ESPECIALIDADES = 6;

// ── Validación en el navegador (refleja contenidos_schema()['equipo'] en PHP) ──

const texto = (max: number) =>
  z.string().max(max, `Máximo ${max} caracteres.`).refine((v) => !v.includes("\n"), "Debe ser una sola línea.");
const multilinea = (max: number) => z.string().max(max, `Máximo ${max} caracteres.`);
const opcional = (regla: z.ZodTypeAny) => z.union([z.literal(""), regla]);
const lineasConTexto = (v: string) => v.split("\n").filter((l) => l.trim() !== "").length;

const esquema = z.object({
  encabezado_antetitulo: texto(40),
  encabezado_titulo: texto(80),
  encabezado_destacado: texto(80),
  encabezado_descripcion: multilinea(500),
  miembros: z
    .array(
      z.object({
        nombre: texto(80).refine((v) => v.trim() !== "", "El nombre es obligatorio."),
        cargo: texto(100),
        descripcion: multilinea(300),
        especialidades: multilinea(400).refine(
          (v) => lineasConTexto(v) <= MAX_ESPECIALIDADES,
          `Máximo ${MAX_ESPECIALIDADES} especialidades (una por línea).`
        ),
        foto: z.string(),
        linkedin: opcional(
          z.string().max(300, "Máximo 300 caracteres.").regex(/^https:\/\/[^\s/]+\.[^\s]+$/i, "Debe empezar por https:// y ser una dirección completa.")
        ),
        email: opcional(z.string().max(180, "Máximo 180 caracteres.").email("No es un correo válido.")),
      })
    )
    .max(MAX_MIEMBROS, `Máximo ${MAX_MIEMBROS} personas.`),
  valores_titulo: texto(60),
  valores_descripcion: texto(150),
  valores: z
    .array(
      z.object({
        icono: z.string().refine((v) => NOMBRES_ICONOS.includes(v), "Elige un ícono."),
        titulo: texto(60).refine((v) => v.trim() !== "", "El título es obligatorio."),
        descripcion: multilinea(250),
      })
    )
    .min(1, "Debe haber al menos un valor.")
    .max(MAX_VALORES, `Máximo ${MAX_VALORES} valores.`),
  cta_titulo: texto(100),
  cta_descripcion: multilinea(300),
  cta_boton: texto(40),
});

type Campo = Exclude<keyof ContenidoEquipo, "miembros" | "valores">;

interface DefCampo {
  nombre: Campo;
  etiqueta: string;
  ayuda?: string;
  multilinea?: boolean;
}

const ENCABEZADO: DefCampo[] = [
  { nombre: "encabezado_antetitulo", etiqueta: "Etiqueta", ayuda: "Texto pequeño sobre el título." },
  { nombre: "encabezado_titulo", etiqueta: "Título" },
  { nombre: "encabezado_destacado", etiqueta: "Título destacado", ayuda: "Segunda línea del título, en color." },
  { nombre: "encabezado_descripcion", etiqueta: "Descripción", multilinea: true },
];
const VALORES: DefCampo[] = [
  { nombre: "valores_titulo", etiqueta: "Título" },
  { nombre: "valores_descripcion", etiqueta: "Descripción" },
];
const LLAMADA: DefCampo[] = [
  { nombre: "cta_titulo", etiqueta: "Título" },
  { nombre: "cta_descripcion", etiqueta: "Descripción", multilinea: true },
  { nombre: "cta_boton", etiqueta: "Botón", ayuda: "Lleva a Contactos." },
];

const MIEMBRO_VACIO: MiembroEquipo = {
  nombre: "",
  cargo: "",
  descripcion: "",
  especialidades: "",
  foto: "",
  linkedin: "",
  email: "",
};

const formatearFecha = (fecha: string) =>
  new Date(fecha.replace(" ", "T")).toLocaleString("es-CO", { dateStyle: "medium", timeStyle: "short" });

const AdminContenidoEquipo: React.FC = () => {
  const { user, csrfToken, checkSession } = useAuth();
  const queryClient = useQueryClient();
  const puedeEditar = user?.rol === "admin" || user?.rol === "editor";

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [meta, setMeta] = useState<{ en: string | null; por: string | null }>({ en: null, por: null });

  const form = useForm<ContenidoEquipo>({
    resolver: zodResolver(esquema),
    mode: "onTouched",
    defaultValues: CONTENIDO_EQUIPO_DEFAULT,
  });
  const { register, control, handleSubmit, reset, getValues, setError: setFieldError, formState } = form;
  const miembros = useFieldArray({ control, name: "miembros" });
  const valores = useFieldArray({ control, name: "valores" });
  const errores = formState.errors;

  const aplicar = useCallback(
    (data: NonNullable<ContenidoAdminResponse<ContenidoEquipo>["data"]>) => {
      reset(combinarConRespaldo(CONTENIDO_EQUIPO_DEFAULT, data.datos));
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
      const respuesta = await fetch(API_URL, { credentials: "include" });
      if (respuesta.status === 401) return sesionExpirada();
      const json = (await respuesta.json()) as ContenidoAdminResponse<ContenidoEquipo>;
      if (!respuesta.ok || !json.success || !json.data) {
        throw new Error(json.message || `Error del servidor (${respuesta.status}).`);
      }
      aplicar(json.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo conectar con el servidor.");
    } finally {
      setIsLoading(false);
    }
  }, [aplicar, sesionExpirada]);

  useEffect(() => {
    cargar();
  }, [cargar]);

  // Restaura textos y valores originales; las personas cargadas se conservan
  const restaurarTextos = () => {
    reset({ ...CONTENIDO_EQUIPO_DEFAULT, miembros: getValues("miembros") }, { keepDefaultValues: true });
    toast.info("Textos originales cargados en el formulario", {
      description: "Las personas no se tocaron. Revisa y pulsa «Guardar cambios» para aplicarlo.",
    });
  };

  const guardar = async (datos: ContenidoEquipo) => {
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
        body: JSON.stringify({ datos }),
      });
      if (respuesta.status === 401) return sesionExpirada();
      const json = (await respuesta.json()) as ContenidoAdminResponse<ContenidoEquipo>;

      if (respuesta.status === 400 && json.errors) {
        let general = "";
        for (const [clave, mensaje] of Object.entries(json.errors)) {
          const limpio = mensaje.replace(/^(Persona|Valor) \d+ · /, "").replace(/^[^:]+: /, "");
          if (
            /^miembros\.\d+\.(nombre|cargo|descripcion|especialidades|foto|linkedin|email)$/.test(clave) ||
            /^valores\.\d+\.(icono|titulo|descripcion)$/.test(clave) ||
            clave in CONTENIDO_EQUIPO_DEFAULT
          ) {
            setFieldError(clave as keyof ContenidoEquipo, { type: "server", message: limpio });
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
      await queryClient.invalidateQueries({ queryKey: claveContenido("equipo") });
      toast.success("Cambios guardados", { description: "Ya se ven en la página Nuestro Equipo." });
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

  const botonesOrden = (
    etiqueta: string,
    i: number,
    total: number,
    lista: { move: (a: number, b: number) => void; remove: (i: number) => void },
    minimo: number
  ) =>
    puedeEditar && (
      <div className="flex gap-1">
        <Button type="button" variant="ghost" size="icon" aria-label={`Subir ${etiqueta} ${i + 1}`} disabled={i === 0} onClick={() => lista.move(i, i - 1)}>
          <ArrowUp className="h-4 w-4" />
        </Button>
        <Button type="button" variant="ghost" size="icon" aria-label={`Bajar ${etiqueta} ${i + 1}`} disabled={i === total - 1} onClick={() => lista.move(i, i + 1)}>
          <ArrowDown className="h-4 w-4" />
        </Button>
        <Button type="button" variant="ghost" size="icon" aria-label={`Eliminar ${etiqueta} ${i + 1}`} disabled={total <= minimo} onClick={() => lista.remove(i)} className="text-destructive hover:text-destructive">
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    );

  const errorDeLista = (e?: { message?: string; root?: { message?: string } }) => {
    const mensaje = e?.root?.message ?? e?.message;
    return mensaje ? <p className="text-sm text-destructive font-medium">{mensaje}</p> : null;
  };

  return (
    <div className="p-4 md:p-8 space-y-6 max-w-5xl mx-auto">
      <ContenidosTabs />

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-lg shadow-sm border">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-[#2b358e]">Nuestro Equipo</h1>
          <p className="text-muted-foreground mt-1 text-sm">Encabezado, personas del equipo, valores y llamada final.</p>
        </div>
        <div className="flex gap-2">
          {puedeEditar && !isLoading && !error && (
            <Button type="button" variant="outline" size="sm" onClick={restaurarTextos}>
              <RotateCcw className="h-4 w-4 mr-2" />
              Restaurar textos originales
            </Button>
          )}
          <Button asChild variant="outline" size="sm" className="border-[#0e7734] text-[#0e7734] hover:bg-[#0e7734]/10">
            <a href="/nuestro-equipo" target="_blank" rel="noopener noreferrer">
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
              Este contenido aún no se ha guardado: el sitio muestra los textos originales que ves abajo, sin personas.
            </div>
          )}

          <fieldset disabled={!puedeEditar || isSaving} className="space-y-6">
            <section className="bg-white rounded-lg border shadow-sm p-6">
              <h2 className="text-lg font-semibold text-slate-800">Encabezado</h2>
              <p className="text-sm text-muted-foreground mb-5">Lo primero que se ve en la página.</p>
              <div className="grid md:grid-cols-2 gap-x-6 gap-y-5">{ENCABEZADO.map(campoSimple)}</div>
            </section>

            {/* Personas */}
            <section className="bg-white rounded-lg border shadow-sm p-6 space-y-5">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <h2 className="text-lg font-semibold text-slate-800">
                    Personas ({miembros.fields.length} de {MAX_MIEMBROS})
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    Se muestran en este orden. Si no hay ninguna, la página oculta esta parte.
                  </p>
                </div>
                {puedeEditar && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={miembros.fields.length >= MAX_MIEMBROS}
                    onClick={() => miembros.append({ ...MIEMBRO_VACIO }, { shouldFocus: true })}
                  >
                    <UserPlus className="h-4 w-4 mr-2" />
                    Agregar persona
                  </Button>
                )}
              </div>
              {errorDeLista(errores.miembros)}

              {miembros.fields.length === 0 && (
                <p className="rounded-lg border border-dashed p-6 text-center text-sm text-muted-foreground">
                  Aún no hay personas. Pulsa «Agregar persona» para empezar.
                </p>
              )}

              <ol className="space-y-4">
                {miembros.fields.map((campo, i) => {
                  const e = errores.miembros?.[i];
                  const id = (sub: string) => `miembros.${i}.${sub}`;
                  return (
                    <li key={campo.id} className="rounded-lg border bg-slate-50/60 p-4 space-y-4">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-sm font-semibold text-slate-600">Persona {i + 1}</span>
                        {botonesOrden("persona", i, miembros.fields.length, miembros, 0)}
                      </div>

                      <Controller
                        control={control}
                        name={`miembros.${i}.foto` as const}
                        render={({ field }) => (
                          <CampoImagen
                            id={id("foto")}
                            etiqueta="Foto"
                            uso="retrato"
                            valor={field.value}
                            onChange={(nombre) => field.onChange(nombre)}
                            respaldo={null}
                            textoRespaldo="Sin foto: se muestran las iniciales del nombre."
                            deshabilitado={!puedeEditar || isSaving}
                            error={e?.foto?.message}
                          />
                        )}
                      />

                      <div className="grid md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor={id("nombre")}>Nombre</Label>
                          <Input id={id("nombre")} aria-invalid={Boolean(e?.nombre)} {...register(`miembros.${i}.nombre` as const)} />
                          {e?.nombre && <p className="text-xs text-destructive font-medium">{e.nombre.message}</p>}
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor={id("cargo")}>Cargo</Label>
                          <Input id={id("cargo")} placeholder="Ej. Directora ambiental" aria-invalid={Boolean(e?.cargo)} {...register(`miembros.${i}.cargo` as const)} />
                          {e?.cargo && <p className="text-xs text-destructive font-medium">{e.cargo.message}</p>}
                        </div>
                        <div className="space-y-2 md:col-span-2">
                          <Label htmlFor={id("descripcion")}>Descripción</Label>
                          <Textarea id={id("descripcion")} rows={2} aria-invalid={Boolean(e?.descripcion)} {...register(`miembros.${i}.descripcion` as const)} />
                          {e?.descripcion && <p className="text-xs text-destructive font-medium">{e.descripcion.message}</p>}
                        </div>
                        <div className="space-y-2 md:col-span-2">
                          <Label htmlFor={id("especialidades")}>Especialidades</Label>
                          <Textarea
                            id={id("especialidades")}
                            rows={3}
                            placeholder={"Ej. ISO 14001\nHuella de carbono"}
                            aria-invalid={Boolean(e?.especialidades)}
                            {...register(`miembros.${i}.especialidades` as const)}
                          />
                          <p className={`text-xs ${e?.especialidades ? "text-destructive font-medium" : "text-muted-foreground"}`}>
                            {e?.especialidades?.message ?? `Una por línea, máximo ${MAX_ESPECIALIDADES}.`}
                          </p>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor={id("linkedin")}>LinkedIn (opcional)</Label>
                          <Input id={id("linkedin")} type="url" placeholder="https://www.linkedin.com/in/..." aria-invalid={Boolean(e?.linkedin)} {...register(`miembros.${i}.linkedin` as const)} />
                          {e?.linkedin && <p className="text-xs text-destructive font-medium">{e.linkedin.message}</p>}
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor={id("email")}>Correo (opcional)</Label>
                          <Input id={id("email")} type="email" placeholder="nombre@gcallssas.com" aria-invalid={Boolean(e?.email)} {...register(`miembros.${i}.email` as const)} />
                          {e?.email && <p className="text-xs text-destructive font-medium">{e.email.message}</p>}
                        </div>
                      </div>
                    </li>
                  );
                })}
              </ol>
            </section>

            {/* Valores */}
            <section className="bg-white rounded-lg border shadow-sm p-6 space-y-5">
              <div>
                <h2 className="text-lg font-semibold text-slate-800">Valores</h2>
                <p className="text-sm text-muted-foreground">Tarjetas con ícono debajo del equipo.</p>
              </div>
              <div className="grid md:grid-cols-2 gap-x-6 gap-y-5">{VALORES.map(campoSimple)}</div>

              <div className="flex items-center justify-between gap-4 pt-2">
                <h3 className="font-semibold text-slate-700">
                  Valores ({valores.fields.length} de {MAX_VALORES})
                </h3>
                {puedeEditar && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={valores.fields.length >= MAX_VALORES}
                    onClick={() => valores.append({ icono: "CheckCircle2", titulo: "", descripcion: "" }, { shouldFocus: true })}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Agregar valor
                  </Button>
                )}
              </div>
              {errorDeLista(errores.valores)}

              <ol className="space-y-4">
                {valores.fields.map((campo, i) => {
                  const e = errores.valores?.[i];
                  const id = (sub: string) => `valores.${i}.${sub}`;
                  return (
                    <li key={campo.id} className="rounded-lg border bg-slate-50/60 p-4 space-y-4">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-sm font-semibold text-slate-600">Valor {i + 1}</span>
                        {botonesOrden("valor", i, valores.fields.length, valores, 1)}
                      </div>
                      <div className="grid md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor={id("titulo")}>Título</Label>
                          <Input id={id("titulo")} aria-invalid={Boolean(e?.titulo)} {...register(`valores.${i}.titulo` as const)} />
                          {e?.titulo && <p className="text-xs text-destructive font-medium">{e.titulo.message}</p>}
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor={id("icono")}>Ícono</Label>
                          <Controller
                            control={control}
                            name={`valores.${i}.icono` as const}
                            render={({ field }) => (
                              <SelectorIcono id={id("icono")} value={field.value} onChange={field.onChange} disabled={!puedeEditar} />
                            )}
                          />
                        </div>
                        <div className="space-y-2 md:col-span-2">
                          <Label htmlFor={id("descripcion")}>Descripción</Label>
                          <Textarea id={id("descripcion")} rows={2} aria-invalid={Boolean(e?.descripcion)} {...register(`valores.${i}.descripcion` as const)} />
                          {e?.descripcion && <p className="text-xs text-destructive font-medium">{e.descripcion.message}</p>}
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

export default AdminContenidoEquipo;
