import { useQuery } from "@tanstack/react-query";
import type {
  ServicioApi,
  ServicioContenido,
  ServicioTema,
  ServiciosPublicoResponse,
} from "@/types/api";

// ── Temas de color ───────────────────────────────────────────────────────────
// Clases literales (Tailwind solo genera las que ve escritas completas).
// Reproducen exactamente los diseños de las 6 páginas originales.
// Las claves deben coincidir con SERVICIOS_TEMAS en public/api/config/servicios.php.

export interface TemaServicio {
  etiqueta: string;
  /** Muestra de color para el selector del panel */
  muestra: string;
  seccion: string;
  marcoIcono: string;
  tarjetaHero: string;
  botonPrimario: string;
  botonSecundario: string;
  tarjeta: string;
  iconoTarjeta: string;
  viñeta: string;
  textoTarjeta: string;
}

const oscuro = {
  seccion: "bg-[#0F172A]",
  tarjetaHero: "bg-[#1E293B]/80 border border-slate-700/60 text-slate-200",
  botonSecundario: "bg-[#1E293B] border border-slate-700 text-slate-200 hover:bg-slate-800",
  textoTarjeta: "text-slate-300",
};

export const TEMAS: Record<ServicioTema, TemaServicio> = {
  marca: {
    etiqueta: "Marca G-Calls (degradado verde y azul)",
    muestra: "bg-gradient-to-br from-[#0e7734] to-[#2b358e]",
    seccion: "",
    marcoIcono: "bg-white/10 border border-white/20 text-white",
    tarjetaHero: "bg-black/20 border border-white/10 text-white/95",
    botonPrimario: "bg-white text-[#2b358e] hover:bg-slate-100",
    botonSecundario: "bg-transparent border border-white/30 text-white hover:bg-white/10",
    tarjeta: "bg-white/10 border-white/10 hover:bg-white/20 shadow-2xl",
    iconoTarjeta: "bg-white/20 text-white group-hover:bg-[#e84e1b] duration-500 shadow-lg",
    viñeta: "text-white",
    textoTarjeta: "text-white/80",
  },
  esmeralda: {
    ...oscuro,
    etiqueta: "Verde esmeralda",
    muestra: "bg-emerald-500",
    marcoIcono: "bg-emerald-500/10 border border-emerald-500/30 text-emerald-400",
    botonPrimario: "bg-emerald-500 text-white hover:bg-emerald-600",
    tarjeta: "bg-[#1E293B]/60 border-slate-700/50 hover:border-emerald-500/40 hover:bg-[#1E293B] shadow-xl",
    iconoTarjeta: "bg-slate-800 border border-slate-700 text-emerald-400 group-hover:bg-emerald-500 group-hover:text-white duration-300 shadow-md",
    viñeta: "text-emerald-400",
  },
  naranja: {
    ...oscuro,
    etiqueta: "Naranja",
    muestra: "bg-orange-500",
    marcoIcono: "bg-orange-500/10 border border-orange-500/30 text-orange-400",
    botonPrimario: "bg-orange-500 text-white hover:bg-orange-600",
    tarjeta: "bg-[#1E293B]/60 border-slate-700/50 hover:border-orange-500/40 hover:bg-[#1E293B] shadow-xl",
    iconoTarjeta: "bg-slate-800 border border-slate-700 text-orange-400 group-hover:bg-orange-500 group-hover:text-white duration-300 shadow-md",
    viñeta: "text-amber-400",
  },
  cian: {
    ...oscuro,
    etiqueta: "Cian",
    muestra: "bg-cyan-500",
    marcoIcono: "bg-cyan-500/10 border border-cyan-500/30 text-cyan-400",
    botonPrimario: "bg-cyan-600 text-white hover:bg-cyan-500",
    tarjeta: "bg-[#1E293B]/60 border-slate-700/50 hover:border-cyan-500/40 hover:bg-[#1E293B] shadow-xl",
    iconoTarjeta: "bg-slate-800 border border-slate-700 text-cyan-400 group-hover:bg-cyan-500 group-hover:text-white duration-300 shadow-md",
    viñeta: "text-cyan-400",
  },
  violeta: {
    ...oscuro,
    etiqueta: "Violeta",
    muestra: "bg-violet-500",
    marcoIcono: "bg-violet-500/10 border border-violet-500/30 text-violet-400",
    botonPrimario: "bg-violet-600 text-white hover:bg-violet-500",
    tarjeta: "bg-[#1E293B]/60 border-slate-700/50 hover:border-violet-500/40 hover:bg-[#1E293B] shadow-xl",
    iconoTarjeta: "bg-slate-800 border border-slate-700 text-violet-400 group-hover:bg-violet-500 group-hover:text-white duration-300 shadow-md",
    viñeta: "text-violet-400",
  },
  azul: {
    ...oscuro,
    etiqueta: "Azul cobalto",
    muestra: "bg-blue-600",
    marcoIcono: "bg-blue-500/10 border border-blue-500/30 text-blue-400",
    botonPrimario: "bg-blue-600 text-white hover:bg-blue-500",
    tarjeta: "bg-[#1E293B]/60 border-slate-700/50 hover:border-blue-500/40 hover:bg-[#1E293B] shadow-xl",
    iconoTarjeta: "bg-slate-800 border border-slate-700 text-blue-400 group-hover:bg-blue-600 group-hover:text-white duration-300 shadow-md",
    viñeta: "text-amber-400",
  },
};

/** Luces de fondo de cada tema oscuro (dos manchas difuminadas). */
export const LUCES: Record<Exclude<ServicioTema, "marca">, [string, string]> = {
  esmeralda: ["bg-emerald-500/10", "bg-teal-500/10"],
  naranja: ["bg-orange-500/10", "bg-emerald-500/10"],
  cian: ["bg-indigo-500/10", "bg-cyan-500/10"],
  violeta: ["bg-violet-500/10", "bg-pink-500/10"],
  azul: ["bg-blue-600/10", "bg-amber-500/10"],
};

export const NOMBRES_TEMAS = Object.keys(TEMAS) as ServicioTema[];

// ── Contenido de respaldo ────────────────────────────────────────────────────
// Contenido original de las 6 páginas de servicios, extraído tal cual.
// Se usa mientras carga la API, si falla, o si un servicio no tiene contenido guardado.

export interface ServicioRespaldo {
  slug: string;
  titulo: string;
  icono: string;
  tema: ServicioTema;
  contenido: ServicioContenido;
}

export const SERVICIOS_RESPALDO: ServicioRespaldo[] = [
  {
    "slug": "supply-chain-management",
    "titulo": "Cadena de Abastecimiento Inteligente",
    "icono": "Container",
    "tema": "marca",
    "contenido": {
      "descripcion": "Transformamos la gestión de la cadena de abastecimiento de punta a punta, integrando estrategia, operación y tecnología para lograr eficiencia, control y resultados medibles.",
      "tarjetas": [
        {
          "titulo": "Qué gestionamos",
          "icono": "Settings",
          "items": [
            "Planeación estratégica de la cadena",
            "Abastecimiento estratégico (Sourcing)",
            "Gestión y desarrollo de proveedores",
            "Operación de compras y procesos P2P",
            "Gerenciamiento de contratos",
            "Gestión logística y transporte",
            "Optimización de inventarios",
            "Estandarización de procesos"
          ]
        },
        {
          "titulo": "Cómo generamos valor",
          "icono": "Award",
          "items": [
            "Optimización de costos en compras y logística",
            "Mejora en niveles de servicio y cumplimiento",
            "Mayor control y visibilidad de la cadena",
            "Reducción de riesgos operativos",
            "Alineación operativa y estratégica"
          ]
        },
        {
          "titulo": "Potenciado con IA",
          "icono": "BrainCircuit",
          "items": [
            "Modelos predictivos de demanda",
            "Optimización de stock inteligente",
            "Evaluación de proveedores con datos",
            "Automatización de procesos P2P",
            "Análisis de escenarios estratégicos"
          ]
        },
        {
          "titulo": "Resultados esperados",
          "icono": "BarChart3",
          "items": [
            "Reducción de costos operativos",
            "Eficiencia en gestión de compras",
            "Optimización del capital de trabajo",
            "Incremento en trazabilidad y confianza"
          ]
        }
      ]
    }
  },
  {
    "slug": "gestion-ambiental-sostenibilidad",
    "titulo": "Gestión Ambiental y Sostenibilidad (ESG)",
    "icono": "Leaf",
    "tema": "esmeralda",
    "contenido": {
      "descripcion": "Acompañamos a las organizaciones en la gestión integral de sus impactos ambientales, asegurando el cumplimiento normativo y la sostenibilidad de sus operaciones mediante soluciones estratégicas, analítica avanzada e inteligencia artificial.",
      "tarjetas": [
        {
          "titulo": "Qué gestionamos",
          "icono": "TreePine",
          "items": [
            "Estructuración e implementación de sistemas de gestión ambiental",
            "Cumplimiento normativo y gestión de requisitos legales",
            "Estudios de impacto ambiental",
            "Diseño e implementación de programas de gestión ambiental",
            "Planes de manejo ambiental y medidas de mitigación",
            "Planes de contingencia ambiental",
            "Monitoreo, seguimiento y control de indicadores ambientales",
            "Desarrollo de manuales, procedimientos y documentación",
            "Sensibilización y cultura ambiental organizacional"
          ]
        },
        {
          "titulo": "Cómo generamos valor",
          "icono": "Recycle",
          "items": [
            "Aseguramos el cumplimiento regulatorio y reducimos riesgos sancionatorios",
            "Optimizamos el uso de recursos naturales",
            "Mejoramos el desempeño ambiental de la operación",
            "Fortalecemos la reputación y sostenibilidad empresarial (ESG)",
            "Facilitamos la toma de decisiones basada en información confiable"
          ]
        },
        {
          "titulo": "Potenciado con IA",
          "icono": "LineChart",
          "items": [
            "Monitoreo de indicadores ambientales en tiempo real",
            "Modelos predictivos de impacto ambiental",
            "Análisis de datos para optimización de recursos (agua, energía, residuos)",
            "Automatización de reportes regulatorios",
            "Evaluación de escenarios para toma de decisiones sostenibles"
          ]
        },
        {
          "titulo": "Resultados esperados",
          "icono": "CheckCircle2",
          "items": [
            "Reducción de impactos ambientales",
            "Mayor eficiencia en el uso de recursos",
            "Cumplimiento normativo sólido y trazable",
            "Mejora en indicadores ESG",
            "Operaciones más sostenibles y resilientes"
          ]
        }
      ]
    }
  },
  {
    "slug": "seguridad-salud-trabajo",
    "titulo": "Seguridad y Salud en el Trabajo (SST)",
    "icono": "ShieldCheck",
    "tema": "naranja",
    "contenido": {
      "descripcion": "Protegemos a las personas y fortalecemos el cumplimiento organizacional mediante la gestión integral de la seguridad y salud en el trabajo, combinando experiencia técnica, analítica e innovación para prevenir riesgos y asegurar operaciones sostenibles.",
      "tarjetas": [
        {
          "titulo": "Qué gestionamos",
          "icono": "HardHat",
          "items": [
            "Diseño e implementación del Sistema de Gestión de SST",
            "Identificación y evaluación de peligros y riesgos",
            "Programas de gestión y prevención",
            "Monitoreo y control de condiciones de trabajo",
            "Gestión documental y cumplimiento normativo",
            "Investigación y análisis de incidentes",
            "Desarrollo de manuales, procedimientos y protocolos",
            "Capacitación y sensibilización del personal"
          ]
        },
        {
          "titulo": "Cómo generamos valor",
          "icono": "Activity",
          "items": [
            "Reducción de accidentes y enfermedades laborales",
            "Cumplimiento de la normativa vigente",
            "Fortalecimiento de la cultura de seguridad",
            "Disminución de riesgos operativos y legales",
            "Mejora en la productividad y continuidad del negocio"
          ]
        },
        {
          "titulo": "Potenciado con IA",
          "icono": "Stethoscope",
          "items": [
            "Identificación predictiva de riesgos laborales",
            "Análisis de incidentes y causas raíz con datos",
            "Monitoreo de indicadores de seguridad en tiempo real",
            "Automatización de reportes y cumplimiento normativo",
            "Modelos para priorización de acciones preventivas"
          ]
        },
        {
          "titulo": "Resultados esperados",
          "icono": "CheckCircle2",
          "items": [
            "Disminución de la accidentalidad",
            "Mayor control y trazabilidad de riesgos",
            "Mejora en auditorías y cumplimiento",
            "Cultura organizacional enfocada en seguridad"
          ]
        }
      ]
    }
  },
  {
    "slug": "gestion-talento-humano",
    "titulo": "Gestión del Talento y Relaciones Laborales",
    "icono": "Users",
    "tema": "cian",
    "contenido": {
      "descripcion": "Potenciamos el talento humano como motor de la estrategia organizacional, integrando gestión laboral, desarrollo de personas y cultura organizacional mediante soluciones innovadoras, analítica e inteligencia artificial para mejorar el desempeño y la competitividad.",
      "tarjetas": [
        {
          "titulo": "Qué gestionamos",
          "icono": "UserCheck",
          "items": [
            "Reclutamiento y selección de talento",
            "Inducción e integración de nuevos colaboradores",
            "Gestión de la comunicación interna",
            "Relaciones laborales y gestión sindical",
            "Capacitación, desarrollo y coaching",
            "Evaluación del desempeño",
            "Planeación de carrera y desarrollo del talento",
            "Gestión de cultura organizacional",
            "Gestión del cambio organizacional"
          ]
        },
        {
          "titulo": "Cómo generamos valor",
          "icono": "TrendingUp",
          "items": [
            "Atracción y retención de talento clave",
            "Mejora en la productividad y desempeño organizacional",
            "Fortalecimiento de la cultura y el clima laboral",
            "Reducción de riesgos laborales y conflictos",
            "Alineación del talento con la estrategia del negocio"
          ]
        },
        {
          "titulo": "Potenciado con IA",
          "icono": "BrainCircuit",
          "items": [
            "Analítica de talento para toma de decisiones estratégicas",
            "Modelos predictivos de rotación y ausentismo",
            "Evaluación de desempeño basada en datos",
            "Análisis de clima organizacional en tiempo real",
            "Automatización de procesos de talento humano"
          ]
        },
        {
          "titulo": "Resultados esperados",
          "icono": "CheckCircle2",
          "items": [
            "Mayor compromiso y desempeño del talento",
            "Reducción de rotación y ausentismo",
            "Mejora en la gestión de relaciones laborales",
            "Cultura organizacional alineada y sostenible"
          ]
        }
      ]
    }
  },
  {
    "slug": "gestion-social-rse",
    "titulo": "Gestión Social y Sostenibilidad (ESG)",
    "icono": "HeartHandshake",
    "tema": "violeta",
    "contenido": {
      "descripcion": "Fortalecemos la relación de las organizaciones con su entorno social, promoviendo una gestión responsable, sostenible y alineada con estándares ESG, mediante soluciones estratégicas, analítica e inteligencia artificial que generan valor para el negocio y las comunidades.",
      "tarjetas": [
        {
          "titulo": "Qué gestionamos",
          "icono": "Users2",
          "items": [
            "Gestión social para proyectos",
            "Consultas previas y relacionamiento con comunidades étnicas",
            "Diseño e implementación de planes de gestión social",
            "Interventoría de programas sociales",
            "Relacionamiento con comunidades y grupos de interés",
            "Relacionamiento público y gestión con entidades gubernamentales",
            "Programas de responsabilidad social empresarial (RSE)",
            "Estrategias de gobernanza y derechos humanos",
            "Desarrollo comunitario y fortalecimiento del entorno",
            "Gestión y manejo de conflictos sociales"
          ]
        },
        {
          "titulo": "Cómo generamos valor",
          "icono": "Building2",
          "items": [
            "Fortalecemos la licencia social para operar",
            "Reducciones de riesgos sociales y reputacionales",
            "Mejoramos la relación con comunidades y stakeholders",
            "Aseguramos alineación con estándares ESG",
            "Generamos impacto social sostenible y medible"
          ]
        },
        {
          "titulo": "Potenciado con IA",
          "icono": "BrainCircuit",
          "items": [
            "Análisis de percepción y relacionamiento con stakeholders",
            "Monitoreo de indicadores sociales y de impacto",
            "Identificación de riesgos sociales mediante análisis de datos",
            "Seguimiento y evaluación de programas sociales",
            "Toma de decisiones basada en evidencia"
          ]
        },
        {
          "titulo": "Resultados esperados",
          "icono": "CheckCircle2",
          "items": [
            "Relaciones sostenibles y de confianza con comunidades",
            "Reducción de conflictos sociales",
            "Mayor efectividad de programas sociales",
            "Fortalecimiento de la reputación organizacional",
            "Impacto social medible y alineado con la estrategia"
          ]
        }
      ]
    }
  },
  {
    "slug": "asesoria-legal",
    "titulo": "Gobernanza y Gestión Legal",
    "icono": "Scale",
    "tema": "azul",
    "contenido": {
      "descripcion": "Acompañamos a las organizaciones en la gestión legal y regulatoria de sus operaciones, asegurando cumplimiento, mitigación de riesgos y toma de decisiones estratégicas, mediante soluciones integradas, analítica e inteligencia artificial.",
      "tarjetas": [
        {
          "titulo": "Qué gestionamos",
          "icono": "FileCheck",
          "items": [
            "Asesoría y orientación legal integral",
            "Derecho laboral y de seguridad social",
            "Derecho civil y comercial",
            "Derecho administrativo y regulatorio",
            "Derecho tributario",
            "Derecho ambiental",
            "Protección al consumidor",
            "Derecho urbano",
            "Asesoría en contratación pública y privada",
            "Gestión y estructuración contractual",
            "Acompañamiento en procesos legales y administrativos"
          ]
        },
        {
          "titulo": "Cómo generamos valor",
          "icono": "ShieldAlert",
          "items": [
            "Mitigamos riesgos legales y regulatorios",
            "Aseguramos cumplimiento normativo",
            "Fortalecemos la toma de decisiones estratégicas",
            "Protegemos la operación y continuidad del negocio",
            "Generamos confianza y respaldo jurídico en las organizaciones"
          ]
        },
        {
          "titulo": "Potenciado con IA",
          "icono": "BrainCircuit",
          "items": [
            "Análisis de riesgos legales basado en datos",
            "Automatización y gestión inteligente de contratos",
            "Seguimiento de cumplimiento normativo",
            "Estructuración y consulta de información legal",
            "Soporte a la toma de decisiones mediante analítica"
          ]
        },
        {
          "titulo": "Resultados esperados",
          "icono": "CheckCircle2",
          "items": [
            "Reducción de riesgos legales y contingencias",
            "Mayor control y trazabilidad en la gestión jurídica",
            "Mejora en procesos contractuales",
            "Cumplimiento sólido y sostenible"
          ]
        }
      ]
    }
  }
];

const respaldoPorSlug = new Map(SERVICIOS_RESPALDO.map((s) => [s.slug, s]));

/** Servicio listo para mostrar: todo completo, sin nulls. */
export interface Servicio extends ServicioRespaldo {
  /** null cuando viene del respaldo (la API no respondió) */
  id: number | null;
}

const temaValido = (t: unknown): t is ServicioTema =>
  typeof t === "string" && t in TEMAS;

/** Combina un servicio de la API con su respaldo, campo por campo. */
export function completarServicio(s: ServicioApi): Servicio {
  const r = respaldoPorSlug.get(s.slug);
  const tieneContenido = Boolean(s.contenido?.descripcion && s.contenido.tarjetas?.length);
  return {
    id: s.id,
    slug: s.slug,
    titulo: s.titulo || r?.titulo || s.slug,
    icono: s.icono || r?.icono || "Briefcase",
    tema: temaValido(s.tema) ? s.tema : r?.tema ?? "marca",
    contenido: tieneContenido
      ? (s.contenido as ServicioContenido)
      : r?.contenido ?? { descripcion: "", tarjetas: [] },
  };
}

const respaldoComoServicios = (): Servicio[] =>
  SERVICIOS_RESPALDO.map((r) => ({ ...r, id: null }));

async function obtenerServicios(): Promise<ServicioApi[]> {
  const respuesta = await fetch("/api/servicios.php");
  if (!respuesta.ok) throw new Error(`No se pudieron cargar los servicios (${respuesta.status}).`);
  const json = (await respuesta.json()) as ServiciosPublicoResponse;
  if (!json.success || !json.data) throw new Error(json.message || "Respuesta inválida del servidor.");
  return json.data.servicios;
}

export const CLAVE_SERVICIOS = ["servicios"] as const;

export type EstadoServicios = "cargando" | "api" | "respaldo";

/**
 * Servicios activos para el sitio público.
 * - "cargando": aún no responde la API (se devuelve el respaldo para no dejar huecos).
 * - "api": lista real; solo los activos.
 * - "respaldo": la API falló; se muestran los 6 originales y no hay ids (sin selector).
 */
export function useServicios(): { servicios: Servicio[]; estado: EstadoServicios } {
  const { data, isPending, isError } = useQuery({
    queryKey: CLAVE_SERVICIOS,
    queryFn: obtenerServicios,
    staleTime: 5 * 60 * 1000,
    retry: 1,
  });

  if (data) return { servicios: data.map(completarServicio), estado: "api" };
  return { servicios: respaldoComoServicios(), estado: isError || !isPending ? "respaldo" : "cargando" };
}

export const rutaServicio = (slug: string) => `/servicios/${slug}`;
