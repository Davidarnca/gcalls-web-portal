import { Scale } from "lucide-react";
import ServicePageLayout from "@/components/ServicePageLayout";

const AsesoriaLegal = () => {
  return (
    <ServicePageLayout
      title="Gestión y Asesoría Legal en las líneas de Servicio Ofrecidas"
      icon={<Scale className="text-white drop-shadow-lg" size={56} strokeWidth={1.8} />}
      description="En G-CALLS estamos en la capacidad de brindar asesoría y orientación legal a nuestros clientes en las líneas de servicio que ofrecemos, nos caracteriza la calidad, ética eficiencia y la confianza en la resolución de solicitudes de asesoramiento, nuestro objetivo es ofrecer soluciones acordes a las necesidades; acompañamos a nuestros clientes en buscar soluciones a sus problemáticas desde el punto de vista legal siendo socialmente responsables."
    />
  );
};

export default AsesoriaLegal;