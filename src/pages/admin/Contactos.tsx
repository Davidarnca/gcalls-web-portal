import React, { useEffect, useState } from "react";
import type { Lead, LeadsListResponse } from "@/types/api";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { toast } from "@/components/ui/sonner";
import {
  RefreshCw,
  AlertCircle,
  Inbox,
  Mail,
  Phone,
  Building2,
  Calendar,
  Users,
} from "lucide-react";

/**
 * Formatea cadenas de fecha MySQL (YYYY-MM-DD HH:MM:SS) sin conversión
 * a objeto Date ni desplazamiento accidental de zona horaria.
 */
const formatFecha = (fechaStr: string): string => {
  if (!fechaStr) return "—";
  const [datePart, timePart] = fechaStr.split(" ");
  if (!datePart) return fechaStr;

  const [year, month, day] = datePart.split("-");
  const [hour, minute] = (timePart || "").split(":");

  const meses = [
    "ene",
    "feb",
    "mar",
    "abr",
    "may",
    "jun",
    "jul",
    "ago",
    "sep",
    "oct",
    "nov",
    "dic",
  ];
  const mesNombre = meses[parseInt(month, 10) - 1] || month;

  return `${day} ${mesNombre} ${year}${hour && minute ? `, ${hour}:${minute}` : ""}`;
};

/**
 * Retorna las clases de Tailwind según el estado del pipeline CRM.
 */
const getBadgeStyle = (estado: Lead["estado"]): string => {
  switch (estado) {
    case "nuevo":
      return "bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100";
    case "en_seguimiento":
      return "bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100";
    case "cotizado":
      return "bg-purple-50 text-purple-700 border-purple-200 hover:bg-purple-100";
    case "ganado":
      return "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100";
    case "perdido":
      return "bg-slate-100 text-slate-600 border-slate-200 hover:bg-slate-200";
    case "spam":
      return "bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100";
    default:
      return "bg-slate-100 text-slate-700 border-slate-200";
  }
};

/**
 * Etiqueta legible para cada estado de lead.
 */
const getEstadoLabel = (estado: Lead["estado"]): string => {
  switch (estado) {
    case "nuevo":
      return "Nuevo";
    case "en_seguimiento":
      return "En seguimiento";
    case "cotizado":
      return "Cotizado";
    case "ganado":
      return "Ganado";
    case "perdido":
      return "Perdido";
    case "spam":
      return "Spam";
    default:
      return estado;
  }
};

const AdminContactos: React.FC = () => {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchLeads = async () => {
    setIsLoading(true);
    setError(null);

    try {
      let data: LeadsListResponse;

      if (import.meta.env.DEV) {
        // En desarrollo, consumimos la capa de Mock dinámica
        const { mockGetLeads } = await import("@/lib/api/admin-contactos.mock");
        data = await mockGetLeads();
      } else {
        // En producción, consulta real al endpoint PHP
        const response = await fetch("/api/admin/contactos.php", {
          method: "GET",
          headers: {
            Accept: "application/json",
          },
        });

        // a) HTTP != 2xx
        if (!response.ok) {
          throw new Error(`Error en el servidor (${response.status})`);
        }

        data = await response.json();
      }

      // b) response.success === false
      if (data.success === false) {
        throw new Error(data.message || "La solicitud no fue exitosa");
      }

      // c) response.data?.leads no existe o no es un arreglo
      if (!data.data || !Array.isArray(data.data.leads)) {
        throw new Error("Formato de datos inválido recibido del servidor");
      }

      setLeads(data.data.leads);
    } catch (err: unknown) {
      setLeads([]);
      const errorMsg =
        err instanceof Error ? err.message : "Error inesperado al cargar contactos";
      setError(errorMsg);
      toast.error("Error al cargar contactos", { description: errorMsg });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLeads();
  }, []);

  return (
    <div className="p-4 md:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Encabezado */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-lg shadow-sm border">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl md:text-3xl font-bold text-[#2b358e]">
              Gestión de Contactos
            </h1>
            {!isLoading && !error && (
              <Badge variant="secondary" className="font-semibold text-xs">
                {leads.length} {leads.length === 1 ? "registro" : "registros"}
              </Badge>
            )}
          </div>
          <p className="text-muted-foreground mt-1 text-sm">
            Monitoreo y seguimiento de prospectos recibidos desde el portal web.
          </p>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={fetchLeads}
          disabled={isLoading}
          className="border-[#0e7734] text-[#0e7734] hover:bg-[#0e7734]/10 transition-colors"
        >
          <RefreshCw
            className={`h-4 w-4 mr-2 ${isLoading ? "animate-spin" : ""}`}
          />
          Refrescar
        </Button>
      </div>

      {/* Estado: CARGA (Loading) */}
      {isLoading && (
        <div className="bg-white rounded-lg border shadow-sm p-4 space-y-4">
          <div className="flex items-center justify-between pb-2 border-b">
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-6 w-24" />
          </div>
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center gap-4">
                <Skeleton className="h-10 w-1/4" />
                <Skeleton className="h-10 w-1/6" />
                <Skeleton className="h-10 w-1/6" />
                <Skeleton className="h-10 w-1/6" />
                <Skeleton className="h-10 w-1/6" />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Estado: ERROR */}
      {!isLoading && error && (
        <div className="bg-white rounded-lg border border-destructive/30 p-8 shadow-sm text-center max-w-lg mx-auto space-y-4">
          <div className="w-12 h-12 rounded-full bg-destructive/10 text-destructive flex items-center justify-center mx-auto">
            <AlertCircle className="h-6 w-6" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-slate-800">
              No se pudieron cargar los contactos
            </h2>
            <p className="text-sm text-muted-foreground mt-1">{error}</p>
          </div>
          <Button
            onClick={fetchLeads}
            className="bg-[#2b358e] hover:bg-[#2b358e]/90 text-white"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Reintentar
          </Button>
        </div>
      )}

      {/* Estado: VACÍO (Empty) */}
      {!isLoading && !error && leads.length === 0 && (
        <div className="bg-white rounded-lg border p-12 shadow-sm text-center max-w-md mx-auto space-y-4">
          <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
            <Inbox className="h-6 w-6" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-slate-800">
              No hay contactos registrados
            </h2>
            <p className="text-sm text-muted-foreground mt-1">
              Cuando un prospecto envíe un mensaje a través del formulario público, aparecerá aquí.
            </p>
          </div>
          <Button
            variant="outline"
            onClick={fetchLeads}
            className="border-slate-300"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Actualizar
          </Button>
        </div>
      )}

      {/* Estado: DATOS (Tabla responsiva) */}
      {!isLoading && !error && leads.length > 0 && (
        <div className="bg-white rounded-lg border shadow-sm overflow-hidden">
          <div className="relative w-full overflow-auto">
            <Table>
              <TableHeader className="bg-slate-50 border-b">
                <TableRow>
                  <TableHead className="w-[180px]">Prospecto</TableHead>
                  <TableHead className="w-[150px]">Empresa</TableHead>
                  <TableHead className="w-[130px]">Teléfono</TableHead>
                  <TableHead className="w-[160px]">Servicio</TableHead>
                  <TableHead className="min-w-[200px] max-w-xs">Mensaje</TableHead>
                  <TableHead className="w-[120px]">Estado</TableHead>
                  <TableHead className="w-[150px]">Fecha</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {leads.map((lead) => (
                  <TableRow key={lead.id} className="hover:bg-slate-50/70 transition-colors">
                    {/* Prospecto (Nombre + Email) */}
                    <TableCell className="align-top py-3.5">
                      <div className="font-semibold text-slate-800">{lead.nombre}</div>
                      <div className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                        <Mail className="h-3 w-3 flex-shrink-0 text-slate-400" />
                        <a
                          href={`mailto:${lead.email}`}
                          className="hover:underline text-slate-600 truncate max-w-[160px]"
                        >
                          {lead.email}
                        </a>
                      </div>
                    </TableCell>

                    {/* Empresa */}
                    <TableCell className="align-top py-3.5 text-slate-700 text-sm">
                      {lead.empresa ? (
                        <div className="flex items-center gap-1.5">
                          <Building2 className="h-3.5 w-3.5 flex-shrink-0 text-slate-400" />
                          <span className="truncate max-w-[140px]">{lead.empresa}</span>
                        </div>
                      ) : (
                        <span className="text-muted-foreground italic text-xs">Sin empresa</span>
                      )}
                    </TableCell>

                    {/* Teléfono */}
                    <TableCell className="align-top py-3.5 text-slate-700 text-sm">
                      {lead.telefono ? (
                        <div className="flex items-center gap-1.5">
                          <Phone className="h-3.5 w-3.5 flex-shrink-0 text-slate-400" />
                          <a
                            href={`tel:${lead.telefono}`}
                            className="hover:underline text-slate-600 text-xs"
                          >
                            {lead.telefono}
                          </a>
                        </div>
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </TableCell>

                    {/* Servicio de interés */}
                    <TableCell className="align-top py-3.5 text-sm">
                      {lead.servicio_interes !== null ? (
                        <Badge variant="outline" className="font-normal text-xs bg-slate-50 text-slate-700 border-slate-200">
                          Servicio #{lead.servicio_interes}
                        </Badge>
                      ) : (
                        <span className="text-muted-foreground italic text-xs">
                          General / No especificado
                        </span>
                      )}
                    </TableCell>

                    {/* Mensaje */}
                    <TableCell className="align-top py-3.5 text-sm">
                      {lead.mensaje ? (
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <span className="max-w-xs truncate block text-slate-600 cursor-help underline decoration-dotted decoration-slate-300 underline-offset-2">
                              {lead.mensaje}
                            </span>
                          </TooltipTrigger>
                          <TooltipContent className="max-w-md p-3 text-sm whitespace-pre-wrap">
                            {lead.mensaje}
                          </TooltipContent>
                        </Tooltip>
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </TableCell>

                    {/* Estado */}
                    <TableCell className="align-top py-3.5">
                      <Badge
                        variant="outline"
                        className={`text-xs font-medium border ${getBadgeStyle(lead.estado)}`}
                      >
                        {getEstadoLabel(lead.estado)}
                      </Badge>
                    </TableCell>

                    {/* Fecha de registro */}
                    <TableCell className="align-top py-3.5 text-xs text-muted-foreground whitespace-nowrap">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3 text-slate-400 flex-shrink-0" />
                        <span>{formatFecha(lead.fecha_registro)}</span>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminContactos;
