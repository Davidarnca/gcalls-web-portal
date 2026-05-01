import { Heart } from "lucide-react";
import ServicePageLayout from "@/components/ServicePageLayout";

const GestionSocial = () => {
  return (
    <ServicePageLayout
      title="Gestión Social y Responsabilidad Social Empresarial"
      icon={<Heart className="text-white drop-shadow-lg" size={56} strokeWidth={1.8} />}
      description="En G-CALLS brindamos soluciones estratégicas en la gestión social y la responsabilidad social empresarial generando valor a nuestros clientes; acompañamos a las organizaciones en la ejecución estratégica de sus proyectos y actividades co-ayudando al manejo del entorno interna y externamente en las áreas de influencia y elaborando prácticas y procesos que permitan mejorar la interacción con las diferentes partes interesadas."
    />
  );
};

export default GestionSocial;