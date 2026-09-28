/**
 * G-Calls S.A.S. — Mock DEV: GET /api/admin/contactos
 *
 * Simula la respuesta del endpoint administrativo de lectura de leads.
 * Diseñado para ser consumido condicionalmente en desarrollo bajo import.meta.env.DEV
 * mediante importación dinámica (await import(...)).
 *
 * Nota sobre bundling: Su aislamiento o exclusión como código muerto (dead code)
 * en el empaquetado final depende de que el componente consumidor mantenga
 * la importación dinámica dentro de la bifurcación condicional evaluada por Vite.
 *
 * Disparador de uso: cuando la futura página AdminContactos se construya,
 * importará este mock dinámicamente igual que Contactos.tsx importa
 * contactos.mock.ts para el POST.
 */

import type { Lead, LeadsListResponse } from "@/types/api";

// ── Datos de prueba ────────────────────────────────────────────────────────────
// Cubre todos los casos que la tabla de leads debe representar:
// - Todos los estados del ENUM
// - empresa: string presente / null
// - telefono: string presente / null
// - servicio_interes: número presente / null
// - Fechas variadas (orden descendente refleja el ORDER BY del PHP real)
const MOCK_LEADS: Lead[] = [
  {
    id: 7,
    nombre: "Carlos Méndez",
    empresa: "Logística Andina S.A.S",
    email: "carlos.mendez@logandina.co",
    telefono: "+57 310 234 5678",
    servicio_interes: 1,
    mensaje: "Necesitamos optimizar nuestra cadena de suministro para Q1 2027.",
    estado: "nuevo",
    fecha_registro: "2026-09-27 09:15:00",
  },
  {
    id: 6,
    nombre: "Ana María Torres",
    empresa: null,          // empresa ausente → null
    email: "ana.torres@gmail.com",
    telefono: null,         // teléfono ausente → null
    servicio_interes: null, // sin servicio seleccionado → null
    mensaje: "Me gustaría conocer sus servicios de gestión ambiental.",
    estado: "en_seguimiento",
    fecha_registro: "2026-09-25 14:30:00",
  },
  {
    id: 5,
    nombre: "Pedro Gutiérrez",
    empresa: "Constructora Bogotá Ltda",
    email: "pgutierrez@constructorabogota.com",
    telefono: "+57 300 987 6543",
    servicio_interes: 3,
    mensaje: "Requerimos asesoría en SST para obra nueva de 8 pisos.",
    estado: "cotizado",
    fecha_registro: "2026-09-20 11:00:00",
  },
  {
    id: 4,
    nombre: "Laura Ríos",
    empresa: "HR Consulting Group",
    email: "lrios@hrcg.co",
    telefono: "+57 320 111 2233",
    servicio_interes: 4,
    mensaje: "Interés en gestión de talento humano para empresa de 200 empleados.",
    estado: "ganado",
    fecha_registro: "2026-09-15 08:45:00",
  },
  {
    id: 2,
    nombre: "Juliana Ospina",
    empresa: "Exportaciones del Pacífico",
    email: "j.ospina@expac.co",
    telefono: null,         // teléfono ausente → null
    servicio_interes: 2,
    mensaje: null,          // mensaje ausente → null
    estado: "perdido",
    fecha_registro: "2026-09-05 16:20:00",
  },
  {
    id: 1,
    nombre: "Test Spam Bot",
    empresa: null,
    email: "spam@noreply.com",
    telefono: null,
    servicio_interes: null,
    mensaje: "Buy cheap watches!! Click here!!!",
    estado: "spam",
    fecha_registro: "2026-08-10 03:12:00",
  },
];

// ── Función exportada ─────────────────────────────────────────────────────────
/**
 * Simula GET /api/admin/contactos.php con un delay de red (~600ms).
 * Retorna siempre éxito — los errores de red se simulan en pruebas manuales
 * cambiando temporalmente el return.
 */
export const mockGetLeads = async (): Promise<LeadsListResponse> => {
  await new Promise((resolve) => setTimeout(resolve, 600));

  return {
    success: true,
    message: "Leads obtenidos correctamente (Mock DEV).",
    data: {
      leads: MOCK_LEADS,
      total: MOCK_LEADS.length,
    },
  };
};
