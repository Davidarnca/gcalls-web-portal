import {
  Activity, Award, BarChart3, BrainCircuit, Briefcase, Building2, CheckCircle2,
  ClipboardCheck, Container, Factory, FileCheck, Gavel, Globe, Handshake, HardHat,
  HeartHandshake, Landmark, Leaf, Lightbulb, LineChart, Recycle, Scale, Settings,
  ShieldAlert, ShieldCheck, Sprout, Stethoscope, Target, TreePine, TrendingUp,
  Truck, UserCheck, Users, Users2,
  type LucideIcon,
} from "lucide-react";

/**
 * Íconos que el panel puede asignar a servicios y tarjetas.
 * Debe coincidir con SERVICIOS_ICONOS en public/api/config/servicios.php.
 */
export const ICONOS: Record<string, LucideIcon> = {
  Activity, Award, BarChart3, BrainCircuit, Briefcase, Building2, CheckCircle2,
  ClipboardCheck, Container, Factory, FileCheck, Gavel, Globe, Handshake, HardHat,
  HeartHandshake, Landmark, Leaf, Lightbulb, LineChart, Recycle, Scale, Settings,
  ShieldAlert, ShieldCheck, Sprout, Stethoscope, Target, TreePine, TrendingUp,
  Truck, UserCheck, Users, Users2,
};

export const NOMBRES_ICONOS = Object.keys(ICONOS).sort();

/** Devuelve el ícono por nombre, o uno genérico si no existe. */
export const icono = (nombre: string | null | undefined): LucideIcon =>
  (nombre && ICONOS[nombre]) || Briefcase;
