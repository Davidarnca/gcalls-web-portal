import { Users } from "lucide-react";
import ServicePageLayout from "@/components/ServicePageLayout";

const TalentoHumano = () => {
  return (
    <ServicePageLayout
      title="Gestión del Talento Humano y Relaciones Industriales"
      icon={<Users className="text-white drop-shadow-lg" size={56} strokeWidth={1.8} />}
      description="G-CALLS dentro de su portafolio de servicios le ofrece la alternativa de prestarle servicios integrales en la gestión del talento humano y de las relaciones industriales de manera estratégica que le permita obtener el mejor valor, aplicando las mejores prácticas para la organización y garantizando el cumplimiento de las metas y la entrega de los proyectos."
    />
  );
};

export default TalentoHumano;