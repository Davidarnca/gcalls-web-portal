import { 
  Users, 
  UserCheck, 
  TrendingUp, 
  BrainCircuit, 
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
          <span className="text-cyan-400 mr-2 mt-0.5 font-bold">•</span>
          <span className="opacity-90">{line.replace('-', '').trim()}</span>
        </span>
      ) : line}
    </span>
  ));
};

const TalentoHumano = () => {
  const talentoCards = [
    {
      icon: UserCheck,
      title: "Qué gestionamos",
      description: "- Reclutamiento y selección de talento\n- Inducción e integración de nuevos colaboradores\n- Gestión de la comunicación interna\n- Relaciones laborales y gestión sindical\n- Capacitación, desarrollo y coaching\n- Evaluación del desempeño\n- Planeación de carrera y desarrollo del talento\n- Gestión de cultura organizacional\n- Gestión del cambio organizacional"
    },
    {
      icon: TrendingUp,
      title: "Cómo generamos valor",
      description: "- Atracción y retención de talento clave\n- Mejora en la productividad y desempeño organizacional\n- Fortalecimiento de la cultura y el clima laboral\n- Reducción de riesgos laborales y conflictos\n- Alineación del talento con la estrategia del negocio"
    },
    {
      icon: BrainCircuit,
      title: "Potenciado con IA",
      description: "- Analítica de talento para toma de decisiones estratégicas\n- Modelos predictivos de rotación y ausentismo\n- Evaluación de desempeño basada en datos\n- Análisis de clima organizacional en tiempo real\n- Automatización de procesos de talento humano"
    },
    {
      icon: CheckCircle2,
      title: "Resultados esperados",
      description: "- Mayor compromiso y desempeño del talento\n- Reducción de rotación y ausentismo\n- Mejora en la gestión de relaciones laborales\n- Cultura organizacional alineada y sostenible"
    }
  ];

  return (
    <section className="relative pt-32 pb-24 lg:pt-40 lg:pb-32 min-h-screen flex items-center overflow-hidden bg-[#0F172A]">
      
      {/* Glows de fondo con tonos Azul Índigo / Cian corporativos de G-Calls */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-indigo-500/10 blur-[130px] rounded-full pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-[400px] h-[400px] bg-cyan-500/10 blur-[120px] rounded-full pointer-events-none" />

      <div className="container relative z-20 mx-auto px-4 lg:px-8">
        
        <div className="max-w-4xl mx-auto text-center mb-16 animate-fade-in">
          {/* Icono Principal con marco Índigo/Cian */}
          <div className="flex justify-center mb-8">
            <div className="p-4 bg-cyan-500/10 backdrop-blur-lg rounded-2xl border border-cyan-500/30 shadow-xl text-cyan-400">
              <Users size={52} strokeWidth={1.5} />
            </div>
          </div>
          
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-8 tracking-tight drop-shadow-lg leading-tight">
            Gestión del Talento y <br className="hidden sm:inline" />
            Relaciones Laborales
          </h1>

          {/* Tarjeta Descriptiva Central */}
          <div className="bg-[#1E293B]/80 backdrop-blur-md border border-slate-700/60 p-6 md:p-8 rounded-2xl mb-10 shadow-2xl text-slate-200">
            <p className="text-lg md:text-xl leading-relaxed">
              Potenciamos el talento humano como motor de la estrategia organizacional, integrando gestión laboral, desarrollo de personas y cultura organizacional mediante soluciones innovadoras, analítica e inteligencia artificial para mejorar el desempeño y la competitividad.
            </p>
          </div>

          {/* Botones de Acción */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/contactos" className="bg-cyan-600 text-white hover:bg-cyan-500 font-bold py-3.5 px-8 rounded-xl transition-all shadow-xl flex items-center justify-center gap-2 group">
              Solicitar Información <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link to="/que-gestionamos" className="bg-[#1E293B] border border-slate-700 text-slate-200 hover:bg-slate-800 font-semibold py-3.5 px-8 rounded-xl transition-colors flex items-center justify-center gap-2 group">
              <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" /> Ver Todos los Servicios
            </Link>
          </div>
        </div>

        {/* Cards dinámicas con paleta Índigo/Cian */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
          {talentoCards.map((card, index) => {
            const Icon = card.icon;
            return (
              <Card
                key={index}
                className="p-6 md:p-8 bg-[#1E293B]/60 backdrop-blur-md border-slate-700/50 hover:border-cyan-500/40 hover:bg-[#1E293B] transition-all duration-300 hover:-translate-y-2 group flex flex-col h-full animate-fade-up shadow-xl"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="w-14 h-14 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center mb-6 text-cyan-400 group-hover:bg-cyan-500 group-hover:text-white transition-all duration-300 shrink-0 shadow-md">
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

export default TalentoHumano;