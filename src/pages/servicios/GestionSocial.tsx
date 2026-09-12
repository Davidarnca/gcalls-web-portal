import { 
  HeartHandshake, 
  Users2, 
  Building2, 
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
          <span className="text-violet-400 mr-2 mt-0.5 font-bold">•</span>
          <span className="opacity-90">{line.replace('-', '').trim()}</span>
        </span>
      ) : line}
    </span>
  ));
};

const GestionSocial = () => {
  const socialCards = [
    {
      icon: Users2,
      title: "Qué gestionamos",
      description: "- Gestión social para proyectos\n- Consultas previas y relacionamiento con comunidades étnicas\n- Diseño e implementación de planes de gestión social\n- Interventoría de programas sociales\n- Relacionamiento con comunidades y grupos de interés\n- Relacionamiento público y gestión con entidades gubernamentales\n- Programas de responsabilidad social empresarial (RSE)\n- Estrategias de gobernanza y derechos humanos\n- Desarrollo comunitario y fortalecimiento del entorno\n- Gestión y manejo de conflictos sociales"
    },
    {
      icon: Building2,
      title: "Cómo generamos valor",
      description: "- Fortalecemos la licencia social para operar\n- Reducciones de riesgos sociales y reputacionales\n- Mejoramos la relación con comunidades y stakeholders\n- Aseguramos alineación con estándares ESG\n- Generamos impacto social sostenible y medible"
    },
    {
      icon: BrainCircuit,
      title: "Potenciado con IA",
      description: "- Análisis de percepción y relacionamiento con stakeholders\n- Monitoreo de indicadores sociales y de impacto\n- Identificación de riesgos sociales mediante análisis de datos\n- Seguimiento y evaluación de programas sociales\n- Toma de decisiones basada en evidencia"
    },
    {
      icon: CheckCircle2,
      title: "Resultados esperados",
      description: "- Relaciones sostenibles y de confianza con comunidades\n- Reducción de conflictos sociales\n- Mayor efectividad de programas sociales\n- Fortalecimiento de la reputación organizacional\n- Impacto social medible y alineado con la estrategia"
    }
  ];

  return (
    <section className="relative pt-32 pb-24 lg:pt-40 lg:pb-32 min-h-screen flex items-center overflow-hidden bg-[#0F172A]">
      
      {/* Glows de fondo con tonos Violeta / Magenta corporativos de G-Calls */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-violet-500/10 blur-[130px] rounded-full pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-[400px] h-[400px] bg-pink-500/10 blur-[120px] rounded-full pointer-events-none" />

      <div className="container relative z-20 mx-auto px-4 lg:px-8">
        
        <div className="max-w-4xl mx-auto text-center mb-16 animate-fade-in">
          {/* Icono Principal con marco Violeta/Social */}
          <div className="flex justify-center mb-8">
            <div className="p-4 bg-violet-500/10 backdrop-blur-lg rounded-2xl border border-violet-500/30 shadow-xl text-violet-400">
              <HeartHandshake size={52} strokeWidth={1.5} />
            </div>
          </div>
          
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-8 tracking-tight drop-shadow-lg leading-tight">
            Gestión Social y <br className="hidden sm:inline" />
            Sostenibilidad (ESG)
          </h1>

          {/* Tarjeta Descriptiva Central */}
          <div className="bg-[#1E293B]/80 backdrop-blur-md border border-slate-700/60 p-6 md:p-8 rounded-2xl mb-10 shadow-2xl text-slate-200">
            <p className="text-lg md:text-xl leading-relaxed">
              Fortalecemos la relación de las organizaciones con su entorno social, promoviendo una gestión responsable, sostenible y alineada con estándares ESG, mediante soluciones estratégicas, analítica e inteligencia artificial que generan valor para el negocio y las comunidades.
            </p>
          </div>

          {/* Botones de Acción */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/contactos" className="bg-violet-600 text-white hover:bg-violet-500 font-bold py-3.5 px-8 rounded-xl transition-all shadow-xl flex items-center justify-center gap-2 group">
              Solicitar Información <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link to="/que-gestionamos" className="bg-[#1E293B] border border-slate-700 text-slate-200 hover:bg-slate-800 font-semibold py-3.5 px-8 rounded-xl transition-colors flex items-center justify-center gap-2 group">
              <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" /> Ver Todos los Servicios
            </Link>
          </div>
        </div>

        {/* Cards dinámicas con paleta Violeta/Magenta */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
          {socialCards.map((card, index) => {
            const Icon = card.icon;
            return (
              <Card
                key={index}
                className="p-6 md:p-8 bg-[#1E293B]/60 backdrop-blur-md border-slate-700/50 hover:border-violet-500/40 hover:bg-[#1E293B] transition-all duration-300 hover:-translate-y-2 group flex flex-col h-full animate-fade-up shadow-xl"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="w-14 h-14 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center mb-6 text-violet-400 group-hover:bg-violet-500 group-hover:text-white transition-all duration-300 shrink-0 shadow-md">
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

export default GestionSocial;