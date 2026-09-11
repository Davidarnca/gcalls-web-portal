import { 
  Leaf, 
  TreePine, 
  Recycle, 
  LineChart, 
  CheckCircle2,
  ArrowRight,
  ArrowLeft
} from "lucide-react";
import { Link } from "react-router-dom";
import { Card } from "@/components/ui/card";

const highlightBullets = (text: string) => {
  return text.split('\n').map((line, i) => (
    <span key={i} className="block mb-3">
      {line.startsWith('-') ? (
        <span className="flex items-start">
          <span className="text-emerald-400 mr-2 mt-0.5 font-bold">•</span>
          <span className="opacity-90">{line.replace('-', '').trim()}</span>
        </span>
      ) : line}
    </span>
  ));
};

const GestionAmbientalEsg = () => {
  const esgCards = [
    {
      icon: TreePine,
      title: "Qué gestionamos",
      description: "- Estructuración e implementación de sistemas de gestión ambiental\n- Cumplimiento normativo y gestión de requisitos legales\n- Estudios de impacto ambiental\n- Diseño e implementación de programas de gestión ambiental\n- Planes de manejo ambiental y medidas de mitigación\n- Planes de contingencia ambiental\n- Monitoreo, seguimiento y control de indicadores ambientales\n- Desarrollo de manuales, procedimientos y documentación\n- Sensibilización y cultura ambiental organizacional"
    },
    {
      icon: Recycle,
      title: "Cómo generamos valor",
      description: "- Aseguramos el cumplimiento regulatorio y reducimos riesgos sancionatorios\n- Optimizamos el uso de recursos naturales\n- Mejoramos el desempeño ambiental de la operación\n- Fortalecemos la reputación y sostenibilidad empresarial (ESG)\n- Facilitamos la toma de decisiones basada en información confiable"
    },
    {
      icon: LineChart,
      title: "Potenciado con IA",
      description: "- Monitoreo de indicadores ambientales en tiempo real\n- Modelos predictivos de impacto ambiental\n- Análisis de datos para optimización de recursos (agua, energía, residuos)\n- Automatización de reportes regulatorios\n- Evaluación de escenarios para toma de decisiones sostenibles"
    },
    {
      icon: CheckCircle2,
      title: "Resultados esperados",
      description: "- Reducción de impactos ambientales\n- Mayor eficiencia en el uso de recursos\n- Cumplimiento normativo sólido y trazable\n- Mejora en indicadores ESG\n- Operaciones más sostenibles y resilientes"
    }
  ];

  return (
    <section className="relative pt-32 pb-24 lg:pt-40 lg:pb-32 min-h-screen flex items-center overflow-hidden bg-[#0F172A]">
      
      {/* Glows de fondo con tonos Esmeralda / Verde Ambiental de G-Calls */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-emerald-500/10 blur-[130px] rounded-full pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-[400px] h-[400px] bg-teal-500/10 blur-[120px] rounded-full pointer-events-none" />

      <div className="container relative z-20 mx-auto px-4 lg:px-8">
        
        <div className="max-w-4xl mx-auto text-center mb-16 animate-fade-in">
          {/* Icono Principal con marco Esmeralda ESG */}
          <div className="flex justify-center mb-8">
            <div className="p-4 bg-emerald-500/10 backdrop-blur-lg rounded-2xl border border-emerald-500/30 shadow-xl text-emerald-400">
              <Leaf size={52} strokeWidth={1.5} />
            </div>
          </div>
          
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-8 tracking-tight drop-shadow-lg leading-tight">
            Gestión Ambiental y <br className="hidden sm:inline" />
            Sostenibilidad (ESG)
          </h1>

          {/* Tarjeta Descriptiva Central */}
          <div className="bg-[#1E293B]/80 backdrop-blur-md border border-slate-700/60 p-6 md:p-8 rounded-2xl mb-10 shadow-2xl text-slate-200">
            <p className="text-lg md:text-xl leading-relaxed">
              Acompañamos a las organizaciones en la gestión integral de sus impactos ambientales, asegurando el cumplimiento normativo y la sostenibilidad de sus operaciones mediante soluciones estratégicas, analítica avanzada e inteligencia artificial.
            </p>
          </div>

          {/* Botones de Acción */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/contactos" className="bg-emerald-500 text-white hover:bg-emerald-600 font-bold py-3.5 px-8 rounded-xl transition-all shadow-xl flex items-center justify-center gap-2 group">
              Solicitar Información <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link to="/que-gestionamos" className="bg-[#1E293B] border border-slate-700 text-slate-200 hover:bg-slate-800 font-semibold py-3.5 px-8 rounded-xl transition-colors flex items-center justify-center gap-2 group">
              <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" /> Ver Todos los Servicios
            </Link>
          </div>
        </div>

        {/* Cards dinámicas con paleta Esmeralda/ESG */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
          {esgCards.map((card, index) => {
            const Icon = card.icon;
            return (
              <Card
                key={index}
                className="p-6 md:p-8 bg-[#1E293B]/60 backdrop-blur-md border-slate-700/50 hover:border-emerald-500/40 hover:bg-[#1E293B] transition-all duration-300 hover:-translate-y-2 group flex flex-col h-full animate-fade-up shadow-xl"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="w-14 h-14 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center mb-6 text-emerald-400 group-hover:bg-emerald-500 group-hover:text-white transition-all duration-300 shrink-0 shadow-md">
                  <Icon size={28} />
                </div>

                <h3 className="text-xl font-bold mb-4 text-white">
                  {card.title}
                </h3>

                <div className="text-slate-300 text-sm leading-relaxed tracking-tight">
                  {highlightBullets(card.description)}
                </div>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default GestionAmbientalEsg;