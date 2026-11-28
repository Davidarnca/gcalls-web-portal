import { useState, useRef } from "react";
import { Target, Eye, Award, Users, ChevronLeft, ChevronRight, type LucideIcon } from "lucide-react";
import { Card } from "@/components/ui/card";
import { useContenidoQuienesSomos } from "@/lib/contenidos";

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

type Tarjeta = { icon: LucideIcon; title: string } & (
  | { description: string }
  | { carouselItems: { title: string; text: string }[] }
);

const QuienesSomos = () => {
  const c = useContenidoQuienesSomos();

  // Una tarjeta sin texto no se muestra; los pasos se numeran aquí
  const values: Tarjeta[] = [];
  if (c.mision) values.push({ icon: Target, title: c.mision_titulo, description: c.mision });
  if (c.vision) values.push({ icon: Eye, title: c.vision_titulo, description: c.vision });
  if (c.valor) values.push({ icon: Award, title: c.valor_titulo, description: c.valor });
  if (c.pasos.length > 0) {
    values.push({
      icon: Users,
      title: c.metodo_titulo,
      carouselItems: c.pasos.map((paso, i) => ({ title: `${i + 1}. ${paso.titulo}:`, text: paso.descripcion })),
    });
  }

  return (
    <>      <section className="pt-28 md:pt-32 lg:pt-36 pb-20 gradient-primary text-white">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="max-w-4xl mx-auto text-center animate-fade-in">
            {c.encabezado_titulo && (
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">{c.encabezado_titulo}</h1>
            )}
            {c.encabezado_descripcion && (
              <p className="text-lg md:text-xl text-white/90 leading-relaxed whitespace-pre-line">
                {c.encabezado_descripcion}
              </p>
            )}
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

                  {value.title && (
                    <h3 className="text-2xl font-semibold mb-4 group-hover:text-primary transition-colors shrink-0">
                      {value.title}
                    </h3>
                  )}

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