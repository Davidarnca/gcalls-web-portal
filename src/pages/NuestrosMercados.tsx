import { Factory, Building2, Truck, Waves, Zap, ShoppingBag, Droplets, Pickaxe, Leaf, Plane, } from "lucide-react";
import { Card } from "@/components/ui/card";

const NuestrosMercados = () => {
  const markets = [
    {
    icon: Droplets,
    title: "Oil & Gas",
    description: "Optimización de operaciones, abastecimiento y cumplimiento regulatorio."
  },
  {
    icon: Zap,
    title: "Energía",
    description: "Eficiencia operativa, sostenibilidad y gestión de activos."
  },
  {
    icon: Pickaxe,
    title: "Minería",
    description: "Optimización de la cadena de suministro y gestión ambiental."
  },
  {
    icon: Leaf,
    title: "Medio Ambiente y Sostenibilidad",
    description: "Estrategias ESG, cumplimiento y gestión de impacto."
  },
  {
    icon: Waves,
    title: "Agua y Saneamiento",
    description: "Eficiencia operativa y gestión sostenible de recursos."
  },
  {
    icon: Truck,
    title: "Transporte y Logística",
    description: "Optimización de redes, costos y niveles de servicio."
  },
  {
    icon: Building2,
    title: "Infraestructura",
    description: "Gestión integral de proyectos y riesgos."
  },
  {
    icon: Plane,
    title: "Aeropuertos",
    description: "Eficiencia operativa, cumplimiento y experiencia del usuario."
  }
  ];

  return (
    <>      {/* Hero Section */}
      <section className="pt-28 md:pt-32 lg:pt-36 pb-20 gradient-secondary text-white">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="max-w-4xl mx-auto text-center animate-fade-in">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
              Industrias que Atendemos
            </h1>
            <p className="text-lg md:text-xl text-white/90 leading-relaxed">
              Trabajamos con organizaciones de sectores estratégicos, aportando soluciones especializadas que combinan experiencia, analítica e inteligencia artificial para optimizar su desempeño. Nuestra misión es impulsar la sostenibilidad y la responsabilidad corporativa en cada industria que servimos.
            </p>
          </div>
        </div>
      </section>

      {/* Markets Grid */}
      <section className="py-20 bg-gradient-subtle">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
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
    </>  );
};

export default NuestrosMercados;
