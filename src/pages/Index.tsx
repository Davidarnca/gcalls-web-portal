import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  type CarouselApi,
} from "@/components/ui/carousel";
import Autoplay from "embla-carousel-autoplay";
import heroImage from "@/assets/hero-city.png";
import { Fragment, useRef, useState, useEffect, useCallback } from "react";
import { lineas, useContenidoInicio } from "@/lib/contenidos";
import { icono } from "@/lib/iconos";
import { rutaServicio, useServicios } from "@/lib/servicios";
import { urlMedio } from "@/lib/medios";

/** Texto multilínea dentro de un mismo párrafo, con <br /> entre renglones. */
const ConSaltos = ({ texto }: { texto: string }) => (
  <>
    {lineas(texto).map((linea, i) => (
      <Fragment key={i}>
        {i > 0 && <br />}
        {linea}
      </Fragment>
    ))}
  </>
);

const Index = () => {
  const [featuresApi, setFeaturesApi] = useState<CarouselApi>();
  const [featuresCurrentSlide, setFeaturesCurrentSlide] = useState(0);
  const [scrollY, setScrollY] = useState(0);

  const autoplayPlugin = useRef(
    Autoplay({ delay: 4000, stopOnInteraction: true, stopOnMouseEnter: true })
  );

  useEffect(() => {
    const handleScroll = () => {
      requestAnimationFrame(() => setScrollY(window.scrollY));
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Contenido editable desde el panel (Contenidos → Página de inicio)
  const inicio = useContenidoInicio();
  const fotoBanner = urlMedio(inicio.hero_imagen);
  const { servicios, estado: estadoServicios } = useServicios();

  // Una tarjeta solo se muestra si su servicio está publicado. Mientras carga o si la
  // API de servicios falla, se muestran todas (no se sabe cuáles están ocultos).
  const slugsActivos = new Set(servicios.map((s) => s.slug));
  const features = inicio.especialidades.filter(
    (e) => estadoServicios !== "api" || slugsActivos.has(e.servicio)
  );

  const onFeaturesSelect = useCallback(() => {
    if (!featuresApi) return;
    setFeaturesCurrentSlide(featuresApi.selectedScrollSnap());
  }, [featuresApi]);

  useEffect(() => {
    if (!featuresApi) return;
    onFeaturesSelect();
    featuresApi.on("select", onFeaturesSelect);
    return () => {
      featuresApi.off("select", onFeaturesSelect);
    };
  }, [featuresApi, onFeaturesSelect]);

  return (
    <>      {/* Hero Section */}
      <section className="relative w-full h-screen flex items-center justify-center overflow-hidden gradient-primary">
        {/* Foto de fondo opcional (panel → Página de inicio), cubierta con el degradado de marca para que el texto se lea */}
        {fotoBanner && (
          <>
            <img src={fotoBanner} alt="" aria-hidden="true" className="absolute inset-0 w-full h-full object-cover" />
            <div className="absolute inset-0 gradient-primary opacity-70" />
          </>
        )}
        <div className="absolute inset-0 opacity-10" style={{ transform: `translateY(${scrollY * 0.3}px)` }}>
          <div className="absolute inset-0 animate-gradient-shift" 
            style={{
              background: "radial-gradient(circle at 20% 50%, rgba(255,255,255,0.3) 0%, transparent 50%), radial-gradient(circle at 80% 50%, rgba(255,255,255,0.3) 0%, transparent 50%)"
            }}
          />
        </div>
        
        <div 
          className="container mx-auto px-4 lg:px-8 relative z-10 text-center pt-8 md:pt-12 lg:pt-16 max-w-[90%] md:max-w-full"
          style={{ transform: `translateY(${scrollY * 0.15}px)`, opacity: Math.max(1 - scrollY / 600, 0) }}
        >
          <h1 className="text-4xl md:text-5xl lg:text-7xl font-bold text-white mb-8 animate-fade-up tracking-tight max-w-[90%] md:max-w-full mx-auto">
            {inicio.hero_antetitulo && (
              <span className="text-white drop-shadow-[0_2px_8px_rgba(255,255,255,0.3)] block mb-6 sm:mb-7 md:mb-4">{inicio.hero_antetitulo}</span>
            )}
            {inicio.hero_titulo && <span className="block">{inicio.hero_titulo}</span>}
            {inicio.hero_titulo_destacado && (
              <span className="text-accent block -mt-1 md:-mt-2">{inicio.hero_titulo_destacado}</span>
            )}
          </h1>
          <p className="text-lg md:text-xl text-white/95 mb-10 max-w-[90%] md:max-w-2xl mx-auto animate-fade-up leading-[1.7] tracking-[-0.01em]">
            <ConSaltos texto={inicio.hero_descripcion} />
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-up">
            <Link to="/quienes-somos">
              <Button size="lg" className="bg-white text-secondary hover:bg-white/95 hover:scale-105 transition-all duration-200 shadow-[0_8px_30px_rgba(0,0,0,0.12)] hover:shadow-[0_12px_40px_rgba(14,119,52,0.2)]">
                {inicio.hero_boton_principal}
                <ArrowRight className="ml-2" size={20} />
              </Button>
            </Link>
            <Link to="/contactos">
              <Button 
                size="lg" 
                variant="outline" 
                className="border-2 border-white bg-white/10 text-white hover:bg-white hover:text-secondary transition-all duration-200 backdrop-blur-sm shadow-[0_8px_30px_rgba(0,0,0,0.12)] hover:shadow-[0_12px_40px_rgba(255,255,255,0.15)]"
              >
                {inicio.hero_boton_secundario}
              </Button>
            </Link>
          </div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent z-10" />
      </section>

      {/* Features Section — oculta si ninguna tarjeta tiene servicio publicado */}
      {features.length > 0 && (
        <section className="py-24 bg-gradient-subtle">
          <div className="container mx-auto px-4 lg:px-8">
            <div className="text-center mb-20 animate-fade-in">
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6 tracking-tight">
                {inicio.especialidades_titulo} <span className="text-gradient">{inicio.especialidades_destacado}</span>
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-[1.6]">
                <ConSaltos texto={inicio.especialidades_descripcion} />
              </p>
            </div>

            <div className="relative max-w-7xl mx-auto">
              <Carousel
                opts={{
                  align: "start",
                  loop: true,
                }}
                plugins={[autoplayPlugin.current]}
                setApi={setFeaturesApi}
                className="w-full"
              >
                <CarouselContent className="-ml-4">
                  {features.map((feature, index) => {
                    const Icon = icono(feature.icono);
                    return (
                      <CarouselItem key={`${feature.servicio}-${index}`} className="pl-4 md:basis-1/2 lg:basis-1/3">
                        <Link
                          to={rutaServicio(feature.servicio)}
                          onClick={() => window.scrollTo(0, 0)}
                          className="block h-full"
                        >
                          <Card className="p-8 h-full hover:shadow-primary transition-all duration-200 ease-in-out hover:-translate-y-1 group cursor-pointer border-2 hover:scale-[1.015] rounded-xl flex flex-col">
                            <div className="flex flex-col items-center text-center flex-1">
                              <div className="w-16 h-16 rounded-xl gradient-primary flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-200">
                                <Icon className="text-primary-foreground" size={32} strokeWidth={2} />
                              </div>
                              <h3 className="text-lg font-semibold mb-2 group-hover:text-primary transition-colors duration-200 leading-snug min-h-[3.5rem] flex items-center">
                                {feature.titulo}
                              </h3>
                              <div className="w-12 h-0.5 bg-gradient-primary mb-3 opacity-50"></div>
                              <p className="text-muted-foreground leading-[1.6] text-[15px] flex-1">
                                {feature.descripcion}
                              </p>
                            </div>
                            <div className="mt-6 flex justify-center">
                              <span className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-primary/10 text-primary font-semibold text-sm group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-200">
                                Ir
                                <ArrowRight size={16} className="transition-transform duration-200 group-hover:translate-x-1" />
                              </span>
                            </div>
                          </Card>
                        </Link>
                      </CarouselItem>
                    );
                  })}
                </CarouselContent>
                <CarouselPrevious className="hidden md:flex -left-4 lg:-left-12" />
                <CarouselNext className="hidden md:flex -right-4 lg:-right-12" />

                {/* Dots indicators */}
                <div className="flex justify-center gap-2 mt-8">
                  {features.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => featuresApi?.scrollTo(index)}
                      className={`rounded-full transition-all duration-300 ${
                        index === featuresCurrentSlide
                          ? "w-3 h-3 bg-primary border-2 border-primary scale-110"
                          : "w-2 h-2 bg-primary/30 border border-primary/40 hover:bg-primary/50"
                      }`}
                      aria-label={`Go to slide ${index + 1}`}
                    />
                  ))}
                </div>
              </Carousel>
            </div>
          </div>
        </section>
      )}

      {/* CTA Section */}
      <section className="py-24 gradient-primary relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0 animate-gradient-shift" 
            style={{
              background: "radial-gradient(circle at 20% 50%, rgba(255,255,255,0.3) 0%, transparent 50%), radial-gradient(circle at 80% 50%, rgba(255,255,255,0.3) 0%, transparent 50%)"
            }}
          />
        </div>
        <div className="container mx-auto px-4 lg:px-8 text-center relative z-10">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-8 animate-fade-in tracking-tight">
            {inicio.cta_titulo}
          </h2>
          <p className="text-lg text-white/95 mb-10 max-w-2xl mx-auto animate-fade-up leading-[1.7]">
            <ConSaltos texto={inicio.cta_descripcion} />
          </p>
          <Link to="/contactos">
            <Button 
              size="lg" 
              className="bg-white text-primary hover:bg-white/95 hover:scale-105 transition-all duration-200 shadow-[0_8px_30px_rgba(0,0,0,0.15)] hover:shadow-[0_12px_40px_rgba(255,255,255,0.3)] animate-scale-in"
            >
              {inicio.cta_boton}
              <ArrowRight className="ml-2" size={20} />
            </Button>
          </Link>
        </div>
      </section>
    </>  );
};

export default Index;