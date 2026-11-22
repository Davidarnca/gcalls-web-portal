import React, { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { AlertCircle, Briefcase, ExternalLink, Eye, Pencil, RefreshCw } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { ErrorApi, actualizarServicio, listarServiciosAdmin } from "@/lib/api/admin-servicios";
import { icono } from "@/lib/iconos";
import { CLAVE_SERVICIOS, TEMAS, completarServicio, rutaServicio } from "@/lib/servicios";
import type { ServicioAdminApi } from "@/types/api";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "@/components/ui/sonner";

const AdminServicios: React.FC = () => {
  const { user, csrfToken, checkSession } = useAuth();
  const queryClient = useQueryClient();
  const puedeEditar = user?.rol === "admin" || user?.rol === "editor";

  const [servicios, setServicios] = useState<ServicioAdminApi[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [cambiando, setCambiando] = useState<number | null>(null);
  const [porOcultar, setPorOcultar] = useState<ServicioAdminApi | null>(null);

  const cargar = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      setServicios(await listarServiciosAdmin());
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
  }, [checkSession]);

  useEffect(() => {
    cargar();
  }, [cargar]);

  const cambiarEstado = async (servicio: ServicioAdminApi, activo: boolean) => {
    if (!csrfToken) return;
    setCambiando(servicio.id);
    try {
      const actualizado = await actualizarServicio(servicio.id, { activo }, csrfToken);
      setServicios((lista) => lista.map((s) => (s.id === actualizado.id ? actualizado : s)));
      await queryClient.invalidateQueries({ queryKey: CLAVE_SERVICIOS });
      toast.success(activo ? "Servicio publicado" : "Servicio oculto", {
        description: activo
          ? "Ya aparece en el menú, el pie de página y el formulario."
          : "Ya no aparece en el sitio y su página muestra el aviso de no disponible.",
      });
    } catch (err) {
      if (err instanceof ErrorApi && err.status === 401) {
        await checkSession();
        return;
      }
      toast.error("No se pudo cambiar el estado", {
        description: err instanceof Error ? err.message : "Intenta de nuevo.",
      });
    } finally {
      setCambiando(null);
    }
  };

  const activos = servicios.filter((s) => s.activo).length;

  return (
    <div className="p-4 md:p-8 space-y-6 max-w-5xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-lg shadow-sm border">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl md:text-3xl font-bold text-[#2b358e]">Servicios</h1>
            {!isLoading && !error && (
              <Badge variant="secondary" className="font-semibold text-xs">
                {activos} de {servicios.length} publicados
              </Badge>
            )}
          </div>
          <p className="text-muted-foreground mt-1 text-sm">
            Edita el contenido de cada servicio y decide cuáles se muestran en el sitio.
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={cargar}
          disabled={isLoading}
          className="border-[#0e7734] text-[#0e7734] hover:bg-[#0e7734]/10"
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? "animate-spin" : ""}`} />
          Refrescar
        </Button>
      </div>

      {isLoading && (
        <div className="bg-white rounded-lg border shadow-sm divide-y">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="flex items-center gap-4 p-4">
              <Skeleton className="h-12 w-12 rounded-xl" />
              <Skeleton className="h-5 flex-1" />
              <Skeleton className="h-6 w-24" />
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
            <h2 className="text-lg font-semibold text-slate-800">No se pudieron cargar los servicios</h2>
            <p className="text-sm text-muted-foreground mt-1">{error}</p>
          </div>
          <Button onClick={cargar} className="bg-[#2b358e] hover:bg-[#2b358e]/90 text-white">
            <RefreshCw className="h-4 w-4 mr-2" />
            Reintentar
          </Button>
        </div>
      )}

      {!isLoading && !error && servicios.length === 0 && (
        <div className="bg-white rounded-lg border p-12 shadow-sm text-center max-w-md mx-auto space-y-3">
          <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
            <Briefcase className="h-6 w-6" />
          </div>
          <h2 className="text-lg font-semibold text-slate-800">No hay servicios registrados</h2>
          <p className="text-sm text-muted-foreground">
            La base de datos no tiene servicios. Pide al desarrollador que cargue el catálogo inicial.
          </p>
        </div>
      )}

      {!isLoading && !error && servicios.length > 0 && (
        <ul className="bg-white rounded-lg border shadow-sm divide-y">
          {servicios.map((s) => {
            const completo = completarServicio(s);
            const Icono = icono(completo.icono);
            const tema = TEMAS[completo.tema];
            return (
              <li key={s.id} className="flex flex-col sm:flex-row sm:items-center gap-4 p-4">
                <div className="flex items-center gap-4 flex-1 min-w-0">
                  <div className={`h-12 w-12 rounded-xl flex items-center justify-center text-white shrink-0 ${tema.muestra} ${s.activo ? "" : "opacity-40"}`}>
                    <Icono className="h-6 w-6" />
                  </div>
                  <div className="min-w-0">
                    <p className={`font-semibold truncate ${s.activo ? "text-slate-800" : "text-slate-400"}`}>
                      {completo.titulo}
                    </p>
                    <a
                      href={rutaServicio(s.slug)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-muted-foreground hover:text-[#2b358e] inline-flex items-center gap-1"
                    >
                      {rutaServicio(s.slug)} <ExternalLink className="h-3 w-3" />
                    </a>
                  </div>
                </div>

                <div className="flex items-center gap-4 sm:justify-end">
                  <label className="flex items-center gap-2 text-sm cursor-pointer">
                    <Switch
                      checked={s.activo}
                      disabled={!puedeEditar || cambiando === s.id}
                      onCheckedChange={(valor) => (valor ? cambiarEstado(s, true) : setPorOcultar(s))}
                      aria-label={`${s.activo ? "Ocultar" : "Publicar"} ${completo.titulo}`}
                    />
                    <span className={s.activo ? "text-[#0e7734] font-medium" : "text-muted-foreground"}>
                      {s.activo ? "Publicado" : "Oculto"}
                    </span>
                  </label>
                  <Button asChild variant="outline" size="sm">
                    <Link to={`/admin/servicios/${s.id}`}>
                      {puedeEditar ? <Pencil className="h-4 w-4 mr-2" /> : <Eye className="h-4 w-4 mr-2" />}
                      {puedeEditar ? "Editar" : "Ver"}
                    </Link>
                  </Button>
                </div>
              </li>
            );
          })}
        </ul>
      )}

      <AlertDialog open={porOcultar !== null} onOpenChange={(abierto) => !abierto && setPorOcultar(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Ocultar este servicio?</AlertDialogTitle>
            <AlertDialogDescription>
              «{porOcultar ? completarServicio(porOcultar).titulo : ""}» dejará de aparecer en el menú, en el pie
              de página y en el formulario de contacto, y su página mostrará el aviso de no disponible. Su
              contenido se conserva y puedes volver a publicarlo cuando quieras.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (porOcultar) cambiarEstado(porOcultar, false);
                setPorOcultar(null);
              }}
            >
              Ocultar servicio
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default AdminServicios;
