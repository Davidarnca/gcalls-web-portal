import React from "react";
import { useFieldArray } from "react-hook-form";
import { z } from "zod";
import { Plus } from "lucide-react";
import { CONTENIDO_DECALOGO_DEFAULT } from "@/lib/contenidos";
import type { ContenidoDecalogo } from "@/types/api";
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

const MAX_PRINCIPIOS = 12;

// Refleja contenidos_schema()['decalogo'] en PHP
const esquema = z.object({
  encabezado_titulo: zTexto(80),
  encabezado_destacado: zTexto(60),
  encabezado_descripcion: zMultilinea(400),
  principios: z
    .array(
      z.object({
        titulo: zObligatorio(zTexto(80), "El título es obligatorio."),
        descripcion: zMultilinea(250),
      })
    )
    .min(1, "Debe haber al menos un principio.")
    .max(MAX_PRINCIPIOS, `Máximo ${MAX_PRINCIPIOS} principios.`),
  boton_ver_todos: zTexto(40),
  propuesta_titulo: zTexto(80),
  propuesta_texto: zMultilinea(800),
});

const AdminContenidoDecalogo: React.FC = () => {
  const { form, puedeEditar, isLoading, error, isSaving, meta, cargar, guardar } = useEditorContenido<ContenidoDecalogo>({
    seccion: "decalogo",
    respaldo: CONTENIDO_DECALOGO_DEFAULT,
    esquema,
    clavesLista: /^principios\.\d+\.(titulo|descripcion)$/,
    mensajeGuardado: "Ya se ven en la página Decálogo.",
  });
  const { control, register, handleSubmit, reset, formState } = form;
  const principios = useFieldArray({ control, name: "principios" });
  const errores = formState.errors;

  const restaurar = () => {
    reset(CONTENIDO_DECALOGO_DEFAULT, { keepDefaultValues: true });
    toast.info("Textos originales cargados en el formulario", {
      description: "Revisa y pulsa «Guardar cambios» para aplicarlos.",
    });
  };

  return (
    <div className="p-4 md:p-8 space-y-6 max-w-5xl mx-auto">
      <ContenidosTabs />
      <CabeceraEditor
        titulo="Decálogo"
        descripcion="Encabezado, principios numerados y propuesta de valor."
        rutaSitio="/decalogo"
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
              <p className="text-sm text-muted-foreground mb-5">Lo primero que se ve en la página.</p>
              <div className="grid md:grid-cols-2 gap-x-6 gap-y-5">
                <CampoTexto form={form} nombre="encabezado_titulo" etiqueta="Título" />
                <CampoTexto form={form} nombre="encabezado_destacado" etiqueta="Título destacado" ayuda="Final del título, en color." />
                <CampoTexto form={form} nombre="encabezado_descripcion" etiqueta="Descripción" multilinea />
              </div>
            </section>

            <section className="bg-white rounded-lg border shadow-sm p-6 space-y-5">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <h2 className="text-lg font-semibold text-slate-800">
                    Principios ({principios.fields.length} de {MAX_PRINCIPIOS})
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    El sitio los numera solo. Muestra los primeros 4 y el botón «Ver todos» despliega el resto.
                  </p>
                </div>
                {puedeEditar && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={principios.fields.length >= MAX_PRINCIPIOS}
                    onClick={() => principios.append({ titulo: "", descripcion: "" }, { shouldFocus: true })}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Agregar principio
                  </Button>
                )}
              </div>
              <ErrorLista error={errores.principios} />

              <ol className="space-y-4">
                {principios.fields.map((campo, i) => {
                  const e = errores.principios?.[i];
                  const id = (sub: string) => `principios.${i}.${sub}`;
                  return (
                    <li key={campo.id} className="rounded-lg border bg-slate-50/60 p-4 space-y-4">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-sm font-semibold text-slate-600">Principio {i + 1}</span>
                        {puedeEditar && <BotonesOrden etiqueta="principio" i={i} total={principios.fields.length} minimo={1} lista={principios} />}
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor={id("titulo")}>Título</Label>
                        <Input id={id("titulo")} aria-invalid={Boolean(e?.titulo)} {...register(`principios.${i}.titulo` as const)} />
                        <ErrorCampo errores={e?.titulo} />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor={id("descripcion")}>Descripción</Label>
                        <Textarea id={id("descripcion")} rows={2} aria-invalid={Boolean(e?.descripcion)} {...register(`principios.${i}.descripcion` as const)} />
                        <ErrorCampo errores={e?.descripcion} />
                      </div>
                    </li>
                  );
                })}
              </ol>
              <div className="grid md:grid-cols-2 gap-x-6 gap-y-5">
                <CampoTexto form={form} nombre="boton_ver_todos" etiqueta="Texto del botón «Ver todos»" ayuda="Solo aparece si hay más de 4 principios." />
              </div>
            </section>

            <section className="bg-white rounded-lg border shadow-sm p-6">
              <h2 className="text-lg font-semibold text-slate-800">Propuesta de valor</h2>
              <p className="text-sm text-muted-foreground mb-5">Franja de color al final, visible tras desplegar todos los principios.</p>
              <div className="grid md:grid-cols-2 gap-x-6 gap-y-5">
                <CampoTexto form={form} nombre="propuesta_titulo" etiqueta="Título" ancho />
                <CampoTexto form={form} nombre="propuesta_texto" etiqueta="Texto" multilinea filas={4} />
              </div>
            </section>
          </fieldset>

          <BarraGuardar meta={meta} puedeEditar={puedeEditar} isSaving={isSaving} isDirty={formState.isDirty} />
        </form>
      )}
    </div>
  );
};

export default AdminContenidoDecalogo;
