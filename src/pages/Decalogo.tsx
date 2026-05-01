import { CheckCircle2, ChevronDown } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Layout from "@/components/Layout";
import { useState } from "react";

const Decalogo = () => {
  const [showAll, setShowAll] = useState(false);
  
  const principles = [
    {
      title: "Compromiso con la Sostenibilidad",
      description: "Integramos prácticas sostenibles en cada aspecto de nuestra gestión empresarial.",
    },
    {
      title: "Transparencia Operacional",
      description: "Mantenemos comunicación clara y honesta con todos nuestros stakeholders.",
    },
    {
      title: "Mejora Continua",
      description: "Buscamos constantemente innovar y optimizar nuestros procesos y servicios.",
    },
    {
      title: "Respeto al Medio Ambiente",
      description: "Priorizamos la protección ambiental en todas nuestras operaciones.",
    },
    {
      title: "Seguridad Integral",
      description: "Garantizamos ambientes laborales seguros y saludables para todos.",
    },
    {
      title: "Ética Profesional",
      description: "Actuamos con integridad, honestidad y responsabilidad en cada decisión.",
    },
    {
      title: "Desarrollo del Talento",
      description: "Invertimos en la capacitación y crecimiento profesional de nuestro equipo.",
    },
    {
      title: "Responsabilidad Social",
      description: "Contribuimos activamente al bienestar de las comunidades donde operamos.",
    },
    {
      title: "Innovación Constante",
      description: "Adoptamos nuevas tecnologías y metodologías para mejorar nuestros servicios.",
    },
    {
      title: "Colaboración Estratégica",
      description: "Fomentamos alianzas que generen valor compartido y beneficios mutuos.",
    },
  ];

  const displayedPrinciples = showAll ? principles : principles.slice(0, 4);

  return (
    <Layout>
      <section className="pt-28 md:pt-32 lg:pt-36 pb-20 bg-gradient-subtle">
        <div className="container mx-auto px-4 lg:px-8">
          {/* Header */}
          <div className="text-center mb-20 animate-fade-in">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 tracking-tight">
              Nuestro <span className="text-gradient">Decálogo</span>
            </h1>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto leading-[1.6]">
              Diez principios fundamentales que guían nuestro compromiso con la excelencia, 
              la sostenibilidad y la responsabilidad corporativa.
            </p>
          </div>

          {/* Principles Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-6xl mx-auto">
            {displayedPrinciples.map((principle, index) => (
              <Card
                key={index}
                className="p-8 hover:shadow-primary transition-all duration-200 ease-in-out hover:-translate-y-1 group animate-fade-up border-l-4 border-l-primary rounded-xl"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <div className="flex items-start gap-5">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 rounded-full gradient-primary flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
                      <CheckCircle2 className="text-primary-foreground" size={24} />
                    </div>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold mb-3 group-hover:text-primary transition-colors duration-200">
                      {index + 1}. {principle.title}
                    </h3>
                    <p className="text-muted-foreground leading-[1.6]">
                      {principle.description}
                    </p>
                  </div>
                </div>
              </Card>
            ))}
          </div>

          {/* Show More Button */}
          {!showAll && (
            <div className="mt-12 text-center animate-fade-up">
              <Button
                size="lg"
                onClick={() => setShowAll(true)}
                className="gradient-primary text-white hover:opacity-90 transition-opacity duration-200"
              >
                Ver Todos los Principios
                <ChevronDown className="ml-2" size={20} />
              </Button>
            </div>
          )}

          {/* Bottom CTA */}
          {showAll && (
            <div className="mt-20 text-center animate-fade-up">
              <div className="inline-block p-10 rounded-2xl gradient-primary max-w-3xl">
                <h3 className="text-2xl md:text-3xl font-bold text-white mb-4 tracking-tight">
                  Principios que Transforman
                </h3>
                <p className="text-white/95 text-lg leading-[1.7]">
                  Cada uno de estos principios se refleja en nuestro trabajo diario 
                  y en el compromiso con nuestros clientes y el medio ambiente.
                </p>
              </div>
            </div>
          )}
        </div>
      </section>
    </Layout>
  );
};

export default Decalogo;
