import { Target, Eye, Award, Users } from "lucide-react";
import { Card } from "@/components/ui/card";
import Layout from "@/components/Layout";

const QuienesSomos = () => {
  const values = [
    {
      icon: Target,
      title: "Nuestra Misión",
      description:
        "Proporcionar soluciones integrales en gestión de cadena de abastecimiento, ambiental, seguridad y responsabilidad social, ayudando a las empresas a alcanzar sus objetivos de sostenibilidad y excelencia operacional.",
    },
    {
      icon: Eye,
      title: "Nuestra Visión",
      description:
        "Ser la empresa líder reconocida a nivel nacional e internacional por nuestra innovación, compromiso con la sostenibilidad y la transformación positiva de las organizaciones.",
    },
    {
      icon: Award,
      title: "Nuestros Valores",
      description:
        "Integridad, excelencia, innovación, responsabilidad ambiental y social, trabajo en equipo, y compromiso con la mejora continua en todos nuestros servicios.",
    },
    {
      icon: Users,
      title: "Nuestro Equipo",
      description:
        "Profesionales altamente capacitados con amplia experiencia en sus áreas de especialización, comprometidos con brindar soluciones personalizadas y efectivas.",
    },
  ];

  const stats = [
    { number: "15+", label: "Años de Experiencia" },
    { number: "500+", label: "Proyectos Completados" },
    { number: "200+", label: "Clientes Satisfechos" },
    { number: "50+", label: "Profesionales Expertos" },
  ];

  return (
    <Layout>
      {/* Hero Section */}
      <section className="pt-28 md:pt-32 lg:pt-36 pb-20 gradient-primary text-white">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="max-w-4xl mx-auto text-center animate-fade-in">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
              ¿Quiénes Somos?
            </h1>
            <p className="text-lg md:text-xl text-white/90 leading-relaxed">
              Somos una empresa especializada en proporcionar soluciones innovadoras 
              y sostenibles en gestión de cadena de abastecimiento, ambiental, seguridad, 
              salud ocupacional y responsabilidad social empresarial.
            </p>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-20 bg-gradient-subtle">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-6xl mx-auto">
            {values.map((value, index) => {
              const Icon = value.icon;
              return (
                <Card
                  key={index}
                  className="p-8 hover:shadow-primary transition-all duration-300 hover:-translate-y-2 group animate-fade-up"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className="w-16 h-16 rounded-xl gradient-primary flex items-center justify-center mb-6 group-hover:animate-float">
                    <Icon className="text-primary-foreground" size={32} />
                  </div>
                  <h3 className="text-2xl font-semibold mb-4 group-hover:text-primary transition-colors">
                    {value.title}
                  </h3>
                  <p className="text-muted-foreground leading-relaxed text-lg">
                    {value.description}
                  </p>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-secondary text-secondary-foreground">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Nuestra Trayectoria en Números
            </h2>
            <p className="text-secondary-foreground/80 text-lg">
              Resultados que respaldan nuestra experiencia y compromiso
            </p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-5xl mx-auto">
            {stats.map((stat, index) => (
              <div
                key={index}
                className="text-center animate-scale-in"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="text-4xl md:text-5xl font-bold mb-2 text-accent">
                  {stat.number}
                </div>
                <div className="text-sm md:text-base text-secondary-foreground/80">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* About Section */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="max-w-4xl mx-auto animate-fade-in">
            <h2 className="text-3xl md:text-4xl font-bold mb-8 text-center">
              Nuestra <span className="text-gradient">Historia</span>
            </h2>
            <div className="space-y-6 text-lg text-muted-foreground leading-relaxed">
              <p>
                Fundada con el propósito de revolucionar la gestión empresarial sostenible, 
                hemos crecido hasta convertirnos en un referente en el sector. Nuestra pasión 
                por la innovación y el compromiso con el medio ambiente nos impulsa a ofrecer 
                soluciones que generan valor real para nuestros clientes.
              </p>
              <p>
                A lo largo de los años, hemos desarrollado metodologías propias y alianzas 
                estratégicas que nos permiten abordar los desafíos más complejos con 
                creatividad y eficacia. Nuestro equipo multidisciplinario combina experiencia 
                técnica con una profunda comprensión de las necesidades del negocio.
              </p>
              <p>
                Hoy, continuamos expandiendo nuestro alcance y perfeccionando nuestros 
                servicios para ayudar a más organizaciones a alcanzar sus objetivos de 
                sostenibilidad y excelencia operacional.
              </p>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default QuienesSomos;
