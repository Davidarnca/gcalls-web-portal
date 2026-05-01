import { TrendingUp } from "lucide-react";
import ServicePageLayout from "@/components/ServicePageLayout";

const SupplyChain = () => {
  return (
    <ServicePageLayout
      title="Supply Chain Management"
      icon={<TrendingUp className="text-white drop-shadow-lg" size={56} strokeWidth={1.8} />}
      description="En G-CALLS Gestión y Consultoría proveemos soluciones integrales de clase mundial con el mejor talento humano; calidad; eficiencia; servicio al cliente y ética en la gestión estratégica de la cadena de abastecimiento; generando valor a nuestros clientes alineados con las metas y objetivos corporativos de las organizaciones."
    />
  );
};

export default SupplyChain;