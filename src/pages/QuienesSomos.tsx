import { useState, useRef } from "react";
import { Target, Eye, Award, Users, ChevronLeft, ChevronRight } from "lucide-react";
import { Card } from "@/components/ui/card";

// 1. FUNCIÓN HIGHLIGHTER
const highlightText = (text: string) => {
  const parts = text.split(/(\d+\.\s.*?:)/g);
  return parts.map((part, index) => {
    if (/^\d+\.\s.*?:$/.test(part)) {
      return <span key={index} className="font-bold text-primary">{part}</span>;
    }
    return part;
  });
};

// Componente del Carrusel Corregido
const StepCarousel = ({ items }: { items: { title: string, text: string }[] }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const handleScroll = () => {
    if (scrollContainerRef.current) {
      const scrollPosition = scrollContainerRef.current.scrollLeft;
      const width = scrollContainerRef.current.offsetWidth;
      const newIndex = Math.round(scrollPosition / width);
      if (newIndex !== currentIndex) {
        setCurrentIndex(newIndex);
      }
    }
  };

  const scrollToSlide = (index: number) => {
    if (scrollContainerRef.current) {
      const width = scrollContainerRef.current.offsetWidth;
      scrollContainerRef.current.scrollTo({
        left: index * width,
        behavior: 'smooth'
      });
    }
  };

  const nextSlide = () => scrollToSlide((currentIndex + 1) % items.length);
  const prevSlide = () => scrollToSlide((currentIndex - 1 + items.length) % items.length);

  return (
    <div className="flex flex-col h-full w-full min-w-0">
      
      {/* Contenedor de Slide */}
      <div 
        ref={scrollContainerRef}
        onScroll={handleScroll}
        className="flex overflow-x-auto snap-x snap-mandatory scroll-smooth w-full pb-4 [&::-webkit-scrollbar]:hidden"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {items.map((item, i) => (
          <div key={i} className="w-full shrink-0 snap-center pr-4">
            <span className="font-bold text-primary block mb-2 text-lg">
              {item.title}
            </span>
            <p className="text-muted-foreground text-lg leading-relaxed whitespace-normal break-words">
              {item.text}
            </p>
          </div>
        ))}
      </div>

      {/* Controles: Se eliminó border-t y se ocultaron flechas en móvil */}
      <div className="flex items-center justify-between mt-auto w-full">
        {/* Flecha Izquierda: Solo visible en Desktop (md) */}
        <button 
          onClick={prevSlide} 
          className="hidden md:flex p-2 text-slate-400 hover:text-primary transition-colors rounded-full hover:bg-slate-50"
        >
          <ChevronLeft size={20} />
        </button>
        
        {/* Puntos Indicadores: Siempre visibles para feedback táctil */}
        <div className="flex gap-1.5 mx-auto md:mx-0">
          {items.map((_, i) => (
            <button 
              key={i} 
              onClick={() => scrollToSlide(i)}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                i === currentIndex ? 'bg-primary w-5' : 'bg-slate-200 w-1.5'
              }`} 
              aria-label={`Ir al paso ${i + 1}`}
            />
          ))}
        </div>

        {/* Flecha Derecha: Solo visible en Desktop (md) */}
        <button 
          onClick={nextSlide} 
          className="hidden md:flex p-2 text-slate-400 hover:text-primary transition-colors rounded-full hover:bg-slate-50"
        >
          <ChevronRight size={20} />
        </button>
      </div>
    </div>
  );
};

const QuienesSomos = () => {
  const values = [
    {
      icon: Target,
      title: "Nuestra Misión",
      description: "Impulsamos la transformación sostenible de organizaciones de múltiples industrias, generando valor tangible mediante soluciones integrales en cadena de abastecimiento y gestión ambiental, laboral y legal, apalancadas en analítica avanzada, inteligencia artificial e innovación, para optimizar el desempeño, fortalecer la competitividad y asegurar un crecimiento responsable."
    },
    {
      icon: Eye,
      title: "Nuestra Visión",
      description: "Ser la firma líder en Colombia y América Latina en transformación sostenible y gestión integral del negocio, reconocida por integrar inteligencia artificial, analítica y mejores prácticas de clase mundial, para generar impacto medible y relaciones de largo plazo."
    },
    {
      icon: Award,
      title: "Cómo generamos valor",
      description: "• Entendemos su negocio y sus retos\n• Analizamos datos con IA para identificar oportunidades\n• Diseñamos soluciones a la medida\n• Implementamos con foco en resultados\n• Aseguramos mejora continua"
    },
    {
      icon: Users,
      title: "Cómo lo hacemos",
      carouselItems: [
        { 
          title: "1. Entendimiento estratégico:", 
          text: "Analizamos a profundidad el negocio, su contexto y sus desafíos para identificar oportunidades reales de mejora y generación de valor." 
        },
        { 
          title: "2. Diagnóstico basado en datos:", 
          text: "Utilizamos analítica avanzada e inteligencia artificial para evaluar procesos, identificar riesgos y descubrir oportunidades de optimización." 
        },
        { 
          title: "3. Diseño de soluciones a la medida:", 
          text: "Estructuramos soluciones integrales alineadas con la estrategia del cliente, incorporando mejores prácticas de clase mundial." 
        },
        { 
          title: "4. Implementación con impacto:", 
          text: "Acompañamos la ejecución asegurando adopción, eficiencia operativa y resultados medibles." 
        },
        { 
          title: "5. Seguimiento y mejora continua:", 
          text: "Monitoreamos indicadores, ajustamos estrategias y garantizamos sostenibilidad en el tiempo." 
        }
      ]
    },
  ];

  return (
    <>      <section className="pt-28 md:pt-32 lg:pt-36 pb-20 gradient-primary text-white">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="max-w-4xl mx-auto text-center animate-fade-in">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">¿Transformamos su negocio?</h1>
            <p className="text-lg md:text-xl text-white/90 leading-relaxed">
              Combinamos experiencia sectorial, analítica avanzada e inteligencia artificial para diseñar e implementar soluciones a la medida que optimizan el desempeño, fortalecen la competitividad y generan resultados tangibles y sostenibles.
            </p>
          </div>
        </div>
      </section>

      <section className="py-20 bg-gradient-subtle">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-6xl mx-auto">
            {values.map((value, index) => {
              const Icon = value.icon;
              return (
                <Card
                  key={index}
                  // AÑADIDO: overflow-hidden y min-w-0 para contener el layout estrictamente
                  className="p-6 md:p-8 hover:shadow-primary transition-all duration-300 hover:-translate-y-2 group animate-fade-up flex flex-col h-full min-w-0 overflow-hidden"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className="w-16 h-16 rounded-xl gradient-primary flex items-center justify-center mb-6 group-hover:animate-float shrink-0">
                    <Icon className="text-primary-foreground" size={32} />
                  </div>

                  <h3 className="text-2xl font-semibold mb-4 group-hover:text-primary transition-colors shrink-0">
                    {value.title}
                  </h3>

                  {/* AÑADIDO: min-w-0 obliga a que los hijos Flexbox respeten el ancho y envuelvan el texto */}
                  <div className="flex-grow flex flex-col w-full min-w-0">
                    { 'carouselItems' in value ? (
                      <StepCarousel items={value.carouselItems} />
                    ) : (
                      <p className="text-muted-foreground leading-relaxed text-lg whitespace-pre-line tracking-tight">
                        { 'description' in value && highlightText(value.description as string)}
                      </p>
                    )}
                  </div>
                </Card>
              );
            })}
          </div>
        </div>
      </section>
    </>  );
};

export default QuienesSomos;