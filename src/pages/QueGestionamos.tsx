import { TrendingUp, Leaf, Shield, Heart, Users, FileCheck } from "lucide-react";
import { Card } from "@/components/ui/card";
import Layout from "@/components/Layout";

const QueGestionamos = () => {
  const services = [
    {
      icon: TrendingUp,
      title: "Gestión de Cadena de Abastecimiento",
      description:
        "Optimización integral de procesos logísticos, planificación estratégica, reducción de costos operativos y mejora de la eficiencia en toda la cadena de valor.",
      features: [
        "Diseño y optimización de redes logísticas",
        "Gestión de inventarios y almacenes",
        "Planificación de la demanda y suministro",
        "Implementación de tecnologías de trazabilidad",
      ],
    },
    {
      icon: Leaf,
      title: "Gestión Ambiental",
      description:
        "Desarrollo e implementación de sistemas de gestión ambiental, evaluación de impactos, programas de reducción de huella de carbono y economía circular.",
      features: [
        "Estudios de impacto ambiental",
        "Certificaciones ISO 14001",
        "Gestión de residuos y economía circular",
        "Programas de eficiencia energética",
      ],
    },
    {
      icon: Shield,
      title: "Seguridad Industrial",
      description:
        "Implementación de sistemas de gestión de seguridad, identificación de riesgos, planes de prevención y cumplimiento de normativas de seguridad laboral.",
      features: [
        "Evaluación de riesgos operacionales",
        "Diseño de protocolos de seguridad",
        "Auditorías de seguridad industrial",
        "Planes de emergencia y contingencia",
      ],
    },
    {
      icon: Heart,
      title: "Salud Ocupacional",
      description:
        "Programas integrales de salud laboral, prevención de enfermedades ocupacionales, vigilancia epidemiológica y promoción del bienestar en el trabajo.",
      features: [
        "Exámenes médicos ocupacionales",
        "Programas de vigilancia epidemiológica",
        "Evaluación de riesgos ergonómicos",
        "Promoción de estilos de vida saludable",
      ],
    },
    {
      icon: Users,
      title: "Responsabilidad Social Empresarial",
      description:
        "Desarrollo de estrategias de RSE, programas de relacionamiento comunitario, voluntariado corporativo y medición de impacto social.",
      features: [
        "Diseño de programas de RSE",
        "Relacionamiento con stakeholders",
        "Medición de impacto social",
        "Reportes de sostenibilidad",
      ],
    },
    {
      icon: FileCheck,
      title: "Consultoría y Auditoría",
      description:
        "Servicios especializados de consultoría estratégica, auditorías de cumplimiento, diagnósticos organizacionales y planes de mejora continua.",
      features: [
        "Auditorías de sistemas de gestión",
        "Diagnósticos organizacionales",
        "Planes de mejora continua",
        "Capacitación y formación",
      ],
    },
  ];

  return (
    <Layout>
      {/* Hero Section */}
      <section className="pt-28 md:pt-32 lg:pt-36 pb-20 gradient-accent text-white">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="max-w-4xl mx-auto text-center animate-fade-in">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
              ¿Qué Gestionamos?
            </h1>
            <p className="text-lg md:text-xl text-white/90 leading-relaxed">
              Ofrecemos servicios integrales en seis áreas clave para transformar 
              su organización hacia la sostenibilidad y la excelencia operacional.
            </p>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="py-20 bg-gradient-subtle">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="space-y-12">
            {services.map((service, index) => {
              const Icon = service.icon;
              return (
                <Card
                  key={index}
                  className="overflow-hidden hover:shadow-primary transition-all duration-300 animate-fade-up"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 p-8 lg:p-10">
                    {/* Icon and Title */}
                    <div className="lg:col-span-1">
                      <div className="w-20 h-20 rounded-xl gradient-primary flex items-center justify-center mb-4 animate-float">
                        <Icon className="text-primary-foreground" size={40} />
                      </div>
                      <h3 className="text-2xl md:text-3xl font-semibold mb-3 hover:text-primary transition-colors">
                        {service.title}
                      </h3>
                      <p className="text-muted-foreground leading-relaxed">
                        {service.description}
                      </p>
                    </div>

                    {/* Features */}
                    <div className="lg:col-span-2">
                      <h4 className="text-xl font-semibold mb-4">Servicios Incluidos:</h4>
                      <ul className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {service.features.map((feature, featureIndex) => (
                          <li
                            key={featureIndex}
                            className="flex items-start gap-3 group"
                          >
                            <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center mt-0.5 group-hover:bg-primary/20 transition-colors">
                              <div className="w-2 h-2 rounded-full bg-primary" />
                            </div>
                            <span className="text-muted-foreground group-hover:text-foreground transition-colors">
                              {feature}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Methodology Section */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              Nuestra <span className="text-gradient">Metodología</span>
            </h2>
            <p className="text-lg text-muted-foreground leading-relaxed mb-12">
              Aplicamos un enfoque sistemático y personalizado en cada proyecto, 
              asegurando resultados medibles y sostenibles en el tiempo.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {["Diagnóstico", "Planificación", "Implementación", "Seguimiento"].map(
                (step, index) => (
                  <Card
                    key={index}
                    className="p-6 hover:shadow-primary transition-all duration-300 hover:-translate-y-2"
                  >
                    <div className="text-4xl font-bold text-primary mb-2">
                      {index + 1}
                    </div>
                    <div className="font-semibold">{step}</div>
                  </Card>
                )
              )}
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default QueGestionamos;
