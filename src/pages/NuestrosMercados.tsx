import { Factory, Building2, Truck, Waves, Zap, ShoppingBag } from "lucide-react";
import { Card } from "@/components/ui/card";
import Layout from "@/components/Layout";

const NuestrosMercados = () => {
  const markets = [
    {
      icon: Factory,
      title: "Industria Manufacturera",
      description:
        "Optimización de procesos productivos, gestión de residuos industriales, seguridad operacional y certificaciones ambientales para plantas de manufactura.",
    },
    {
      icon: Building2,
      title: "Construcción e Infraestructura",
      description:
        "Gestión de proyectos sostenibles, manejo de materiales, seguridad en obra, evaluación de impacto ambiental y cumplimiento normativo.",
    },
    {
      icon: Truck,
      title: "Logística y Transporte",
      description:
        "Optimización de cadenas de suministro, reducción de huella de carbono en transporte, gestión de flotas y trazabilidad de productos.",
    },
    {
      icon: Waves,
      title: "Sector Energético",
      description:
        "Transición energética, gestión de residuos energéticos, evaluaciones de impacto ambiental y programas de eficiencia energética.",
    },
    {
      icon: Zap,
      title: "Minería y Recursos Naturales",
      description:
        "Gestión ambiental minera, planes de cierre de minas, rehabilitación de áreas intervenidas y relaciones con comunidades.",
    },
    {
      icon: ShoppingBag,
      title: "Retail y Distribución",
      description:
        "Gestión sostenible de inventarios, economía circular, reducción de desperdicios y programas de responsabilidad social corporativa.",
    },
  ];

  return (
    <Layout>
      {/* Hero Section */}
      <section className="pt-28 md:pt-32 lg:pt-36 pb-20 gradient-secondary text-white">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="max-w-4xl mx-auto text-center animate-fade-in">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
              Nuestros Mercados
            </h1>
            <p className="text-lg md:text-xl text-white/90 leading-relaxed">
              Atendemos diversos sectores industriales con soluciones personalizadas 
              que impulsan la sostenibilidad y la eficiencia operacional.
            </p>
          </div>
        </div>
      </section>

      {/* Markets Grid */}
      <section className="py-20 bg-gradient-subtle">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {markets.map((market, index) => {
              const Icon = market.icon;
              return (
                <Card
                  key={index}
                  className="p-8 hover:shadow-primary transition-all duration-300 hover:-translate-y-2 group animate-fade-up"
                  style={{ animationDelay: `${index * 80}ms` }}
                >
                  <div className="w-16 h-16 rounded-xl gradient-primary flex items-center justify-center mb-6 group-hover:animate-float">
                    <Icon className="text-primary-foreground" size={32} />
                  </div>
                  <h3 className="text-2xl font-semibold mb-4 group-hover:text-primary transition-colors">
                    {market.title}
                  </h3>
                  <p className="text-muted-foreground leading-relaxed">
                    {market.description}
                  </p>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Capabilities Section */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-12 animate-fade-in">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Experiencia <span className="text-gradient">Multisectorial</span>
              </h2>
              <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
                Nuestra experiencia en diversos sectores nos permite ofrecer perspectivas 
                únicas y soluciones innovadoras adaptadas a cada industria.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <Card className="p-8 border-l-4 border-l-primary">
                <h3 className="text-xl font-semibold mb-4">Alcance Nacional</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Operamos en todo el país, brindando servicios de calidad con presencia 
                  local y estándares internacionales en cada proyecto que emprendemos.
                </p>
              </Card>

              <Card className="p-8 border-l-4 border-l-secondary">
                <h3 className="text-xl font-semibold mb-4">Proyección Internacional</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Contamos con alianzas estratégicas internacionales que nos permiten 
                  incorporar las mejores prácticas globales en nuestras soluciones locales.
                </p>
              </Card>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default NuestrosMercados;
