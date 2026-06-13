import { 
  TrendingUp, 
  Settings, 
  Award, 
  BrainCircuit, 
  BarChart3,
  ArrowRight,
  ArrowLeft,
  Container // Icono más representativo de Supply Chain
} from "lucide-react";
import { Card } from "@/components/ui/card";

const highlightBullets = (text: string) => {
  return text.split('\n').map((line, i) => (
    <span key={i} className="block mb-3">
      {line.startsWith('-') ? (
        <span className="flex items-start">
          <span className="text-white mr-2 mt-0.5 font-bold">•</span>
          <span className="opacity-90">{line.replace('-', '').trim()}</span>
        </span>
      ) : line}
    </span>
  ));
};

const SupplyChain = () => {
  const supplyCards = [
    {
      icon: Settings,
      title: "Qué gestionamos",
      description: "- Planeación estratégica de la cadena\n- Abastecimiento estratégico (Sourcing)\n- Gestión y desarrollo de proveedores\n- Operación de compras y procesos P2P\n- Gerenciamiento de contratos\n- Gestión logística y transporte\n- Optimización de inventarios\n- Estandarización de procesos"
    },
    {
      icon: Award,
      title: "Cómo generamos valor",
      description: "- Optimización de costos en compras y logística\n- Mejora en niveles de servicio y cumplimiento\n- Mayor control y visibilidad de la cadena\n- Reducción de riesgos operativos\n- Alineación operativa y estratégica"
    },
    {
      icon: BrainCircuit,
      title: "Potenciado con IA",
      description: "- Modelos predictivos de demanda\n- Optimización de stock inteligente\n- Evaluación de proveedores con datos\n- Automatización de procesos P2P\n- Análisis de escenarios estratégicos"
    },
    {
      icon: BarChart3,
      title: "Resultados esperados",
      description: "- Reducción de costos operativos\n- Eficiencia en gestión de compras\n- Optimización del capital de trabajo\n- Incremento en trazabilidad y confianza"
    }
  ];

  return (
    <>      {/* SECCIÓN HERO CON DEGRADADO BASADO EN LA PALETA G-CALLS */}
      <section className="relative pt-32 pb-24 lg:pt-40 lg:pb-32 min-h-screen flex items-center overflow-hidden">
        
        {/* Fondo con degradado cromático: Verde -> Azul -> Naranja sutil */}
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-gradient-to-br from-[#0e7734] via-[#2b358e] to-[#1a237e] z-10 opacity-95" />
          
          {/* Brillo naranja en la esquina para representar energía operativa */}
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#e84e1b]/10 blur-[120px] rounded-full z-10" />
          
          <img 
            src="https://images.unsplash.com/photo-1586528116311-ad8ed7c80a30?q=80&w=2070" 
            alt="Logística Inteligente" 
            className="w-full h-full object-cover opacity-20 mix-blend-overlay"
          />
        </div>

        <div className="container relative z-20 mx-auto px-4 lg:px-8">
          
          <div className="max-w-4xl mx-auto text-center mb-16 animate-fade-in">
            {/* ICONO: Container para Supply Chain */}
            <div className="flex justify-center mb-8">
              <div className="p-4 bg-white/10 backdrop-blur-lg rounded-2xl border border-white/20 shadow-xl">
                <Container className="text-white" size={52} strokeWidth={1.5} />
              </div>
            </div>
            
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-8 tracking-tight drop-shadow-lg">
              Cadena de Abastecimiento Inteligente
            </h1>

            <div className="bg-black/20 backdrop-blur-md border border-white/10 p-6 md:p-8 rounded-2xl mb-10 shadow-2xl">
              <p className="text-lg md:text-xl text-white/95 leading-relaxed">
                Transformamos la gestión de la cadena de abastecimiento de punta a punta, integrando estrategia, operación y tecnología para lograr eficiencia, control y resultados medibles.
              </p>
            </div>

            {/* Botones con los colores de la marca */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="bg-white text-[#2b358e] hover:bg-slate-100 font-bold py-3.5 px-8 rounded-xl transition-all shadow-xl flex items-center justify-center gap-2 group">
                Solicitar Información <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
              </button>
              <button className="bg-transparent border border-white/30 text-white hover:bg-white/10 font-semibold py-3.5 px-8 rounded-xl transition-colors flex items-center justify-center gap-2 group">
                <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" /> Ver Todos los Servicios
              </button>
            </div>
          </div>

          {/* Cards con Glassmorphism sobre el nuevo fondo azul/verde */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
            {supplyCards.map((card, index) => {
              const Icon = card.icon;
              return (
                <Card
                  key={index}
                  className="p-6 md:p-8 bg-white/10 backdrop-blur-md border-white/10 hover:bg-white/20 transition-all duration-300 hover:-translate-y-2 group flex flex-col h-full animate-fade-up shadow-2xl"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className="w-14 h-14 rounded-xl bg-white/20 flex items-center justify-center mb-6 group-hover:bg-[#e84e1b] transition-all duration-500 shrink-0 shadow-lg">
                    <Icon className="text-white" size={28} />
                  </div>

                  <h3 className="text-xl font-bold mb-4 text-white">
                    {card.title}
                  </h3>

                  <div className="text-white/80 text-sm leading-relaxed tracking-tight">
                    {highlightBullets(card.description)}
                  </div>
                </Card>
              );
            })}
          </div>
        </div>
      </section>
    </>  );
};

export default SupplyChain;