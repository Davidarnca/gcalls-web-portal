import { 
  ShieldCheck, 
  HardHat, 
  Activity, 
  Stethoscope, 
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
          <span className="text-amber-400 mr-2 mt-0.5 font-bold">•</span>
          <span className="opacity-90">{line.replace('-', '').trim()}</span>
        </span>
      ) : line}
    </span>
  ));
};

const Sst = () => {
  const sstCards = [
    {
      icon: HardHat,
      title: "Qué gestionamos",
      description: "- Diseño e implementación del Sistema de Gestión de SST\n- Identificación y evaluación de peligros y riesgos\n- Programas de gestión y prevención\n- Monitoreo y control de condiciones de trabajo\n- Gestión documental y cumplimiento normativo\n- Investigación y análisis de incidentes\n- Desarrollo de manuales, procedimientos y protocolos\n- Capacitación y sensibilización del personal"
    },
    {
      icon: Activity,
      title: "Cómo generamos valor",
      description: "- Reducción de accidentes y enfermedades laborales\n- Cumplimiento de la normativa vigente\n- Fortalecimiento de la cultura de seguridad\n- Disminución de riesgos operativos y legales\n- Mejora en la productividad y continuidad del negocio"
    },
    {
      icon: Stethoscope,
      title: "Potenciado con IA",
      description: "- Identificación predictiva de riesgos laborales\n- Análisis de incidentes y causas raíz con datos\n- Monitoreo de indicadores de seguridad en tiempo real\n- Automatización de reportes y cumplimiento normativo\n- Modelos para priorización de acciones preventivas"
    },
    {
      icon: CheckCircle2,
      title: "Resultados esperados",
      description: "- Disminución de la accidentalidad\n- Mayor control y trazabilidad de riesgos\n- Mejora en auditorías y cumplimiento\n- Cultura organizacional enfocada en seguridad"
    }
  ];

  return (
    <section className="relative pt-32 pb-24 lg:pt-40 lg:pb-32 min-h-screen flex items-center overflow-hidden bg-[#0F172A]">
      
      {/* Luces/Glows planos de fondo (Naranja Seguridad + Verde Salud) */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-orange-500/10 blur-[130px] rounded-full pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-[400px] h-[400px] bg-emerald-500/10 blur-[120px] rounded-full pointer-events-none" />

      <div className="container relative z-20 mx-auto px-4 lg:px-8">
        
        <div className="max-w-4xl mx-auto text-center mb-16 animate-fade-in">
          {/* Icono Principal con marco Naranja SST */}
          <div className="flex justify-center mb-8">
            <div className="p-4 bg-orange-500/10 backdrop-blur-lg rounded-2xl border border-orange-500/30 shadow-xl text-orange-400">
              <ShieldCheck size={52} strokeWidth={1.5} />
            </div>
          </div>
          
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-8 tracking-tight drop-shadow-lg leading-tight">
            Seguridad y Salud en el <br className="hidden sm:inline" />
            Trabajo (SST)
          </h1>

          {/* Tarjeta Descriptiva Central */}
          <div className="bg-[#1E293B]/80 backdrop-blur-md border border-slate-700/60 p-6 md:p-8 rounded-2xl mb-10 shadow-2xl text-slate-200">
            <p className="text-lg md:text-xl leading-relaxed">
              Protegemos a las personas y fortalecemos el cumplimiento organizacional mediante la gestión integral de la seguridad y salud en el trabajo, combinando experiencia técnica, analítica e innovación para prevenir riesgos y asegurar operaciones sostenibles.
            </p>
          </div>

          {/* Botones de Acción */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/contactos" className="bg-orange-500 text-white hover:bg-orange-600 font-bold py-3.5 px-8 rounded-xl transition-all shadow-xl flex items-center justify-center gap-2 group">
              Solicitar Información <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link to="/que-gestionamos" className="bg-[#1E293B] border border-slate-700 text-slate-200 hover:bg-slate-800 font-semibold py-3.5 px-8 rounded-xl transition-colors flex items-center justify-center gap-2 group">
              <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" /> Ver Todos los Servicios
            </Link>
          </div>
        </div>

        {/* Cards dinámicas con paleta SST */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
          {sstCards.map((card, index) => {
            const Icon = card.icon;
            return (
              <Card
                key={index}
                className="p-6 md:p-8 bg-[#1E293B]/60 backdrop-blur-md border-slate-700/50 hover:border-orange-500/40 hover:bg-[#1E293B] transition-all duration-300 hover:-translate-y-2 group flex flex-col h-full animate-fade-up shadow-xl"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="w-14 h-14 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center mb-6 text-orange-400 group-hover:bg-orange-500 group-hover:text-white transition-all duration-300 shrink-0 shadow-md">
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

export default Sst;