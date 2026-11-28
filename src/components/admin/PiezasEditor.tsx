import React from "react";
import { get, type FieldErrors, type FieldValues, type Path, type UseFormReturn } from "react-hook-form";
import { AlertCircle, ArrowDown, ArrowUp, ExternalLink, Info, Lock, RefreshCw, RotateCcw, Save, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { formatearFecha } from "@/components/admin/useEditorContenido";

/** Piezas de interfaz compartidas por los editores de secciones del CMS. */

interface CampoTextoProps<T extends FieldValues> {
  form: UseFormReturn<T>;
  nombre: string;
  etiqueta: string;
  ayuda?: string;
  multilinea?: boolean;
  filas?: number;
  placeholder?: string;
  /** Ocupa las dos columnas de la cuadrícula */
  ancho?: boolean;
}

/** Campo de texto (una línea o varias) con su mensaje de ayuda o de error. */
export function CampoTexto<T extends FieldValues>({ form, nombre, etiqueta, ayuda, multilinea, filas = 3, placeholder, ancho }: CampoTextoProps<T>) {
  const mensaje = get(form.formState.errors, nombre)?.message as string | undefined;
  const registro = form.register(nombre as Path<T>);
  return (
    <div className={multilinea || ancho ? "md:col-span-2 space-y-2" : "space-y-2"}>
      <Label htmlFor={nombre}>{etiqueta}</Label>
      {multilinea ? (
        <Textarea id={nombre} rows={filas} placeholder={placeholder} aria-invalid={Boolean(mensaje)} {...registro} />
      ) : (
        <Input id={nombre} placeholder={placeholder} aria-invalid={Boolean(mensaje)} {...registro} />
      )}
      <p className={`text-xs ${mensaje ? "text-destructive font-medium" : "text-muted-foreground"}`}>
        {mensaje ?? ayuda ?? "Déjalo vacío para no mostrarlo."}
      </p>
    </div>
  );
}

interface BotonesOrdenProps {
  etiqueta: string;
  i: number;
  total: number;
  minimo: number;
  lista: { move: (a: number, b: number) => void; remove: (i: number) => void };
}

/** Subir, bajar y eliminar un elemento de una lista. */
export const BotonesOrden: React.FC<BotonesOrdenProps> = ({ etiqueta, i, total, minimo, lista }) => (
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

/** Error general de una lista (mínimo, máximo). */
export const ErrorLista: React.FC<{ error?: { message?: string; root?: { message?: string } } }> = ({ error }) => {
  const mensaje = error?.root?.message ?? error?.message;
  return mensaje ? <p className="text-sm text-destructive font-medium">{mensaje}</p> : null;
};

/** Mensaje de error de un subcampo de una lista. */
export const ErrorCampo: React.FC<{ errores?: FieldErrors<FieldValues>[string] }> = ({ errores }) =>
  errores?.message ? <p className="text-xs text-destructive font-medium">{String(errores.message)}</p> : null;

interface CabeceraProps {
  titulo: string;
  descripcion: string;
  rutaSitio: string;
  onRestaurar?: () => void;
}

/** Título de la página del editor, «Restaurar textos originales» y «Ver en el sitio». */
export const CabeceraEditor: React.FC<CabeceraProps> = ({ titulo, descripcion, rutaSitio, onRestaurar }) => (
  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-lg shadow-sm border">
    <div>
      <h1 className="text-2xl md:text-3xl font-bold text-[#2b358e]">{titulo}</h1>
      <p className="text-muted-foreground mt-1 text-sm">{descripcion}</p>
    </div>
    <div className="flex gap-2">
      {onRestaurar && (
        <Button type="button" variant="outline" size="sm" onClick={onRestaurar}>
          <RotateCcw className="h-4 w-4 mr-2" />
          Restaurar textos originales
        </Button>
      )}
      <Button asChild variant="outline" size="sm" className="border-[#0e7734] text-[#0e7734] hover:bg-[#0e7734]/10">
        <a href={rutaSitio} target="_blank" rel="noopener noreferrer">
          <ExternalLink className="h-4 w-4 mr-2" />
          Ver en el sitio
        </a>
      </Button>
    </div>
  </div>
);

export const EstadoCargando: React.FC = () => (
  <div className="bg-white rounded-lg border shadow-sm p-6 space-y-4">
    <Skeleton className="h-6 w-40" />
    <Skeleton className="h-10" />
    <Skeleton className="h-24" />
    <Skeleton className="h-40" />
  </div>
);

export const EstadoError: React.FC<{ mensaje: string; onReintentar: () => void }> = ({ mensaje, onReintentar }) => (
  <div className="bg-white rounded-lg border border-destructive/30 p-8 shadow-sm text-center max-w-lg mx-auto space-y-4">
    <div className="w-12 h-12 rounded-full bg-destructive/10 text-destructive flex items-center justify-center mx-auto">
      <AlertCircle className="h-6 w-6" />
    </div>
    <div>
      <h2 className="text-lg font-semibold text-slate-800">No se pudo cargar el contenido</h2>
      <p className="text-sm text-muted-foreground mt-1">{mensaje}</p>
    </div>
    <Button onClick={onReintentar} className="bg-[#2b358e] hover:bg-[#2b358e]/90 text-white">
      <RefreshCw className="h-4 w-4 mr-2" />
      Reintentar
    </Button>
  </div>
);

export const AvisoSoloLectura: React.FC = () => (
  <div className="flex items-start gap-3 rounded-lg border border-amber-300 bg-amber-50 p-4 text-sm text-amber-900">
    <Lock className="h-4 w-4 mt-0.5 flex-shrink-0" />
    Tu rol solo permite consultar este contenido.
  </div>
);

export const AvisoSinGuardar: React.FC<{ texto: string }> = ({ texto }) => (
  <div className="flex items-start gap-3 rounded-lg border border-blue-200 bg-blue-50 p-4 text-sm text-blue-900">
    <Info className="h-4 w-4 mt-0.5 flex-shrink-0" />
    {texto}
  </div>
);

interface BarraGuardarProps {
  meta: { en: string | null; por: string | null };
  puedeEditar: boolean;
  isSaving: boolean;
  isDirty: boolean;
}

/** Barra fija inferior con la última actualización y el botón «Guardar cambios». */
export const BarraGuardar: React.FC<BarraGuardarProps> = ({ meta, puedeEditar, isSaving, isDirty }) => (
  <div className="sticky bottom-0 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white/95 backdrop-blur border rounded-lg shadow-sm p-4">
    <p className="text-xs text-muted-foreground">
      {meta.en
        ? `Última actualización: ${formatearFecha(meta.en)}${meta.por ? ` por ${meta.por}` : ""}`
        : "Sin cambios guardados todavía."}
    </p>
    {puedeEditar && (
      <Button type="submit" disabled={isSaving || (!isDirty && Boolean(meta.en))} className="bg-[#0e7734] hover:bg-[#0e7734]/90 text-white">
        <Save className={`h-4 w-4 mr-2 ${isSaving ? "animate-pulse" : ""}`} />
        {isSaving ? "Guardando..." : "Guardar cambios"}
      </Button>
    )}
  </div>
);
