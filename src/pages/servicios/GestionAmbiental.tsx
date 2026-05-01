import { Leaf } from "lucide-react";
import ServicePageLayout from "@/components/ServicePageLayout";

const GestionAmbiental = () => {
  return (
    <ServicePageLayout
      title="Gestión Ambiental; Seguridad Industrial y Salud Ocupacional"
      icon={<Leaf className="text-white drop-shadow-lg" size={56} strokeWidth={1.8} />}
      description="G-CALLS es una compañía dedicada a gestión y consultoría estratégica en la prestación de servicios ambientales; seguridad industrial y salud ocupacional, enfocada en entregar soluciones completas, confiables, innovadoras y sobre todo ejecutables."
    />
  );
};

export default GestionAmbiental;