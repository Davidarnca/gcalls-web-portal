import React, { useId, useRef, useState } from "react";
import { ImageOff, Loader2, RotateCcw, Upload } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { ErrorApi } from "@/lib/api/admin-servicios";
import { subirImagen, TIPOS_ACEPTADOS } from "@/lib/api/admin-medios";
import { urlMedio } from "@/lib/medios";
import type { UsoImagen } from "@/types/api";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { toast } from "@/components/ui/sonner";

/** Marco de la vista previa según el uso de la imagen. */
const VISTA: Record<UsoImagen, string> = {
  logo: "h-28 w-full max-w-xs",
  favicon: "h-20 w-20",
  compartir: "aspect-[1200/630] w-full max-w-sm",
  foto: "aspect-video w-full max-w-sm",
};

const RECOMENDACION: Record<UsoImagen, string> = {
  logo: "PNG con fondo transparente, de al menos 400 px de ancho.",
  favicon: "Imagen cuadrada (PNG con fondo transparente), de al menos 192 × 192 px.",
  compartir: "Horizontal, ideal 1200 × 630 px. Se recorta al centro a esa proporción.",
  foto: "Horizontal, de al menos 1600 px de ancho. Se ve detrás del texto, con un filtro de color encima.",
};

interface CampoImagenProps {
  id: string;
  etiqueta: string;
  uso: UsoImagen;
  /** Nombre de la imagen guardada; "" = imagen por defecto */
  valor: string;
  onChange: (nombre: string) => void;
  /** Imagen que se ve en el sitio cuando no hay ninguna subida (o null si no hay ninguna) */
  respaldo: string | null;
  /** Texto bajo la vista previa cuando no hay imagen subida */
  textoRespaldo: string;
  ayuda?: string;
  deshabilitado?: boolean;
  /** Vista previa sobre fondo oscuro (para logos claros) */
  fondoOscuro?: boolean;
  error?: string;
}

/**
 * Campo de imagen del panel: vista previa, "Cambiar imagen" y "Quitar".
 * La imagen se sube al elegirla; el contenido solo guarda su nombre al pulsar
 * "Guardar cambios" en el formulario.
 */
const CampoImagen: React.FC<CampoImagenProps> = ({
  id,
  etiqueta,
  uso,
  valor,
  onChange,
  respaldo,
  textoRespaldo,
  ayuda,
  deshabilitado = false,
  fondoOscuro = false,
  error,
}) => {
  const { csrfToken, checkSession } = useAuth();
  const entrada = useRef<HTMLInputElement>(null);
  const idAyuda = useId();
  const [subiendo, setSubiendo] = useState(false);
  const [errorSubida, setErrorSubida] = useState<string | null>(null);

  const subida = urlMedio(valor);
  const vista = subida ?? respaldo;

  const elegir = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const archivo = e.target.files?.[0];
    e.target.value = ""; // permite volver a elegir el mismo archivo
    if (!archivo) return;
    if (!csrfToken) {
      toast.error("No se pudo validar tu sesión", { description: "Recarga la página e intenta de nuevo." });
      return;
    }
    setSubiendo(true);
    setErrorSubida(null);
    try {
      const { archivo: nombre } = await subirImagen(archivo, uso, csrfToken);
      onChange(nombre);
      toast.success("Imagen lista", { description: "Pulsa «Guardar cambios» para publicarla." });
    } catch (err) {
      if (err instanceof ErrorApi && err.status === 401) {
        toast.error("Tu sesión expiró", { description: "Inicia sesión nuevamente para continuar." });
        await checkSession();
        return;
      }
      setErrorSubida(err instanceof Error ? err.message : "No se pudo subir la imagen.");
    } finally {
      setSubiendo(false);
    }
  };

  const mensaje = errorSubida ?? error;

  return (
    <div className="space-y-3">
      <Label htmlFor={id}>{etiqueta}</Label>

      <div className="flex flex-col sm:flex-row gap-4 sm:items-center">
        <div
          className={`relative flex items-center justify-center overflow-hidden rounded-lg border ${VISTA[uso]} ${
            fondoOscuro ? "bg-[#0B1120]" : "bg-[repeating-conic-gradient(#f1f5f9_0%_25%,#ffffff_0%_50%)] bg-[length:16px_16px]"
          }`}
        >
          {vista ? (
            <img
              src={vista}
              alt={`Vista previa: ${etiqueta}`}
              className={`max-h-full max-w-full ${uso === "foto" || uso === "compartir" ? "h-full w-full object-cover" : "object-contain p-2"}`}
            />
          ) : (
            <span className="flex flex-col items-center gap-1 text-xs text-muted-foreground p-3 text-center">
              <ImageOff className="h-5 w-5" />
              Sin imagen
            </span>
          )}
          {subiendo && (
            <div className="absolute inset-0 flex items-center justify-center bg-white/70">
              <Loader2 className="h-6 w-6 animate-spin text-[#2b358e]" aria-label="Subiendo imagen" />
            </div>
          )}
        </div>

        <div className="space-y-2">
          <p className="text-xs font-medium text-slate-700">
            {subida ? "Imagen subida desde el panel." : textoRespaldo}
          </p>
          {!deshabilitado && (
            <div className="flex flex-wrap gap-2">
              <input
                ref={entrada}
                id={id}
                type="file"
                accept={TIPOS_ACEPTADOS.join(",")}
                className="sr-only"
                onChange={elegir}
                disabled={subiendo}
                aria-describedby={idAyuda}
              />
              <Button type="button" variant="outline" size="sm" disabled={subiendo} onClick={() => entrada.current?.click()}>
                <Upload className="h-4 w-4 mr-2" />
                {subida ? "Cambiar imagen" : "Subir imagen"}
              </Button>
              {subida && (
                <Button type="button" variant="ghost" size="sm" disabled={subiendo} onClick={() => onChange("")}>
                  <RotateCcw className="h-4 w-4 mr-2" />
                  Quitar
                </Button>
              )}
            </div>
          )}
        </div>
      </div>

      <p id={idAyuda} className={`text-xs ${mensaje ? "text-destructive font-medium" : "text-muted-foreground"}`}>
        {mensaje ?? `${ayuda ? `${ayuda} ` : ""}${RECOMENDACION[uso]} JPG, PNG o WebP.`}
      </p>
    </div>
  );
};

export default CampoImagen;
