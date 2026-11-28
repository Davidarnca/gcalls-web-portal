import React from "react";
import { useFieldArray } from "react-hook-form";
import { z } from "zod";
import { Plus } from "lucide-react";
import { CONTENIDO_QUIENES_SOMOS_DEFAULT } from "@/lib/contenidos";
import type { ContenidoQuienesSomos } from "@/types/api";
import ContenidosTabs from "@/components/admin/ContenidosTabs";
import {
  AvisoSinGuardar,
  AvisoSoloLectura,
  BarraGuardar,
  BotonesOrden,
  CabeceraEditor,
  CampoTexto,
  ErrorCampo,
  ErrorLista,
  EstadoCargando,
  EstadoError,
} from "@/components/admin/PiezasEditor";
import { useEditorContenido, zMultilinea, zObligatorio, zTexto } from "@/components/admin/useEditorContenido";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/components/ui/sonner";

const MAX_PASOS = 8;
const MAX_LINEAS_VALOR = 10;

// Refleja contenidos_schema()['quienes_somos'] en PHP
const esquema = z.object({
  encabezado_titulo: zTexto(80),
  encabezado_descripcion: zMultilinea(600),
  mision_titulo: zTexto(60),
  mision: zMultilinea(800),
  vision_titulo: zTexto(60),
  vision: zMultilinea(800),
  valor_titulo: zTexto(60),
  valor: zMultilinea(800).refine(
    (v) => v.split("\n").filter((l) => l.trim() !== "").length <= MAX_LINEAS_VALOR,
    `Máximo ${MAX_LINEAS_VALOR} líneas.`
  ),
  metodo_titulo: zTexto(60),
  pasos: z
    .array(
      z.object({
        titulo: zObligatorio(zTexto(100), "El título es obligatorio."),
        descripcion: zMultilinea(400),
      })
    )
    .min(1, "Debe haber al menos un paso.")
    .max(MAX_PASOS, `Máximo ${MAX_PASOS} pasos.`),
});

const AdminContenidoQuienesSomos: React.FC = () => {
  const { form, puedeEditar, isLoading, error, isSaving, meta, cargar, guardar } = useEditorContenido<ContenidoQuienesSomos>({
    seccion: "quienes_somos",
    respaldo: CONTENIDO_QUIENES_SOMOS_DEFAULT,
    esquema,
    clavesLista: /^pasos\.\d+\.(titulo|descripcion)$/,
    mensajeGuardado: "Ya se ven en la página Quiénes Somos.",
  });
  const { control, register, handleSubmit, reset, formState } = form;
  const pasos = useFieldArray({ control, name: "pasos" });
  const errores = formState.errors;

  const restaurar = () => {
    reset(CONTENIDO_QUIENES_SOMOS_DEFAULT, { keepDefaultValues: true });
    toast.info("Textos originales cargados en el formulario", {
      description: "Revisa y pulsa «Guardar cambios» para aplicarlos.",
    });
  };

  return (
    <div className="p-4 md:p-8 space-y-6 max-w-5xl mx-auto">
      <ContenidosTabs />
      <CabeceraEditor
        titulo="Quiénes Somos"
        descripcion="Encabezado, misión, visión, cómo generamos valor y los pasos del método."
        rutaSitio="/quienes-somos"
        onRestaurar={puedeEditar && !isLoading && !error ? restaurar : undefined}
      />

      {isLoading && <EstadoCargando />}
      {!isLoading && error && <EstadoError mensaje={error} onReintentar={cargar} />}

      {!isLoading && !error && (
        <form onSubmit={handleSubmit(guardar)} noValidate className="space-y-6">
          {!puedeEditar && <AvisoSoloLectura />}
          {!meta.en && <AvisoSinGuardar texto="Este contenido aún no se ha guardado: el sitio muestra los textos originales que ves abajo." />}

          <fieldset disabled={!puedeEditar || isSaving} className="space-y-6">
            <section className="bg-white rounded-lg border shadow-sm p-6">
              <h2 className="text-lg font-semibold text-slate-800">Encabezado</h2>
              <p className="text-sm text-muted-foreground mb-5">Franja de color al inicio de la página.</p>
              <div className="grid md:grid-cols-2 gap-x-6 gap-y-5">
                <CampoTexto form={form} nombre="encabezado_titulo" etiqueta="Título" ancho />
                <CampoTexto form={form} nombre="encabezado_descripcion" etiqueta="Descripción" multilinea />
              </div>
            </section>

            <section className="bg-white rounded-lg border shadow-sm p-6">
              <h2 className="text-lg font-semibold text-slate-800">Tarjetas de texto</h2>
              <p className="text-sm text-muted-foreground mb-5">Si dejas el texto de una tarjeta vacío, esa tarjeta no se muestra.</p>
              <div className="grid md:grid-cols-2 gap-x-6 gap-y-5">
                <CampoTexto form={form} nombre="mision_titulo" etiqueta="Misión · título" ancho />
                <CampoTexto form={form} nombre="mision" etiqueta="Misión · texto" multilinea filas={5} />
                <CampoTexto form={form} nombre="vision_titulo" etiqueta="Visión · título" ancho />
                <CampoTexto form={form} nombre="vision" etiqueta="Visión · texto" multilinea filas={4} />
                <CampoTexto form={form} nombre="valor_titulo" etiqueta="Cómo generamos valor · título" ancho />
                <CampoTexto
                  form={form}
                  nombre="valor"
                  etiqueta="Cómo generamos valor · texto"
                  multilinea
                  filas={6}
                  ayuda={`Una idea por línea (máximo ${MAX_LINEAS_VALOR}). Escribe «• » al inicio si quieres viñetas.`}
                />
              </div>
            </section>

            <section className="bg-white rounded-lg border shadow-sm p-6 space-y-5">
              <div>
                <h2 className="text-lg font-semibold text-slate-800">Cómo lo hacemos (pasos)</h2>
                <p className="text-sm text-muted-foreground">Carrusel de pasos. El sitio los numera solo, según el orden.</p>
              </div>
              <div className="grid md:grid-cols-2 gap-x-6 gap-y-5">
                <CampoTexto form={form} nombre="metodo_titulo" etiqueta="Título de la tarjeta" ancho />
              </div>

              <div className="flex items-center justify-between gap-4">
                <h3 className="font-semibold text-slate-700">
                  Pasos ({pasos.fields.length} de {MAX_PASOS})
                </h3>
                {puedeEditar && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={pasos.fields.length >= MAX_PASOS}
                    onClick={() => pasos.append({ titulo: "", descripcion: "" }, { shouldFocus: true })}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Agregar paso
                  </Button>
                )}
              </div>
              <ErrorLista error={errores.pasos} />

              <ol className="space-y-4">
                {pasos.fields.map((campo, i) => {
                  const e = errores.pasos?.[i];
                  const id = (sub: string) => `pasos.${i}.${sub}`;
                  return (
                    <li key={campo.id} className="rounded-lg border bg-slate-50/60 p-4 space-y-4">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-sm font-semibold text-slate-600">Paso {i + 1}</span>
                        {puedeEditar && <BotonesOrden etiqueta="paso" i={i} total={pasos.fields.length} minimo={1} lista={pasos} />}
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor={id("titulo")}>Título</Label>
                        <Input id={id("titulo")} aria-invalid={Boolean(e?.titulo)} {...register(`pasos.${i}.titulo` as const)} />
                        <ErrorCampo errores={e?.titulo} />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor={id("descripcion")}>Descripción</Label>
                        <Textarea id={id("descripcion")} rows={3} aria-invalid={Boolean(e?.descripcion)} {...register(`pasos.${i}.descripcion` as const)} />
                        <ErrorCampo errores={e?.descripcion} />
                      </div>
                    </li>
                  );
                })}
              </ol>
            </section>
          </fieldset>

          <BarraGuardar meta={meta} puedeEditar={puedeEditar} isSaving={isSaving} isDirty={formState.isDirty} />
        </form>
      )}
    </div>
  );
};

export default AdminContenidoQuienesSomos;
