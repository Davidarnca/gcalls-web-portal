import { Link } from "react-router-dom";
import { ArrowRight, Leaf, Users, TrendingUp, Heart, Scale } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
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
import { useRef, useState, useEffect, useCallback } from "react";

const Index = () => {
  const [featuresApi, setFeaturesApi] = useState<CarouselApi>();
  const [testimonialsApi, setTestimonialsApi] = useState<CarouselApi>();
  const [featuresCurrentSlide, setFeaturesCurrentSlide] = useState(0);
  const [testimonialsCurrentSlide, setTestimonialsCurrentSlide] = useState(0);
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

  const features = [
    {
      icon: TrendingUp,
      title: "Supply Chain Management",
      description: "Soluciones integrales de clase mundial en la gestión estratégica de la cadena de abastecimiento, generando valor a nuestros clientes.",
      path: "/servicios/supply-chain-management",
    },
    {
      icon: Leaf,
      title: "Gestión Ambiental; Seguridad Industrial y Salud Ocupacional",
      description: "Consultoría estratégica en servicios ambientales, seguridad industrial y salud ocupacional con soluciones completas y ejecutables.",
      path: "/servicios/gestion-ambiental-sostenibilidad",
    },
    {
      icon: Users,
      title: "Gestión del Talento Humano y Relaciones Industriales",
      description: "Servicios integrales en la gestión del talento humano y relaciones industriales aplicando las mejores prácticas para su organización.",
      path: "/servicios/gestion-talento-humano",
    },
    {
      icon: Heart,
      title: "Gestión Social y Responsabilidad Social Empresarial",
      description: "Soluciones estratégicas en gestión social y RSE, acompañando a las organizaciones en sus áreas de influencia y partes interesadas.",
      path: "/servicios/gestion-social-rse",
    },
    {
      icon: Scale,
      title: "Gestión y Asesoría Legal en las líneas de Servicio Ofrecidas",
      description: "Asesoría y orientación legal con calidad, ética y eficiencia en las líneas de servicio que ofrecemos siendo socialmente responsables.",
      path: "/servicios/asesoria-legal",
    },
  ];

  const onFeaturesSelect = useCallback(() => {
    if (!featuresApi) return;
    setFeaturesCurrentSlide(featuresApi.selectedScrollSnap());
  }, [featuresApi]);

  const onTestimonialsSelect = useCallback(() => {
    if (!testimonialsApi) return;
    setTestimonialsCurrentSlide(testimonialsApi.selectedScrollSnap());
  }, [testimonialsApi]);

  useEffect(() => {
    if (!featuresApi) return;
    onFeaturesSelect();
    featuresApi.on("select", onFeaturesSelect);
    return () => {
      featuresApi.off("select", onFeaturesSelect);
    };
  }, [featuresApi, onFeaturesSelect]);

  useEffect(() => {
    if (!testimonialsApi) return;
    onTestimonialsSelect();
    testimonialsApi.on("select", onTestimonialsSelect);
    return () => {
      testimonialsApi.off("select", onTestimonialsSelect);
    };
  }, [testimonialsApi, onTestimonialsSelect]);

  return (
    <>      {/* Hero Section */}
      <section className="relative w-full h-screen flex items-center justify-center overflow-hidden gradient-primary">
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
            <span className="text-white drop-shadow-[0_2px_8px_rgba(255,255,255,0.3)] block mb-6 sm:mb-7 md:mb-4">G-Calls S.A.S</span>
            <span className="block">Gestión Sostenible</span>
            <span className="text-accent block -mt-1 md:-mt-2">Para el Futuro</span>
          </h1>
          <p className="text-lg md:text-xl text-white/95 mb-10 max-w-[90%] md:max-w-2xl mx-auto animate-fade-up leading-[1.7] tracking-[-0.01em]">
            Expertos en cadena de abastecimiento, gestión ambiental, seguridad, 
            salud ocupacional y responsabilidad social empresarial.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-up">
            <Link to="/quienes-somos">
              <Button size="lg" className="bg-white text-secondary hover:bg-white/95 hover:scale-105 transition-all duration-200 shadow-[0_8px_30px_rgba(0,0,0,0.12)] hover:shadow-[0_12px_40px_rgba(14,119,52,0.2)]">
                Conozca Más
                <ArrowRight className="ml-2" size={20} />
              </Button>
            </Link>
            <Link to="/contactos">
              <Button 
                size="lg" 
                variant="outline" 
                className="border-2 border-white bg-white/10 text-white hover:bg-white hover:text-secondary transition-all duration-200 backdrop-blur-sm shadow-[0_8px_30px_rgba(0,0,0,0.12)] hover:shadow-[0_12px_40px_rgba(255,255,255,0.15)]"
              >
                Contáctenos
              </Button>
            </Link>
          </div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent z-10" />
      </section>

      {/* Features Section */}
      <section className="py-24 bg-gradient-subtle">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="text-center mb-20 animate-fade-in">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6 tracking-tight">
              Nuestras <span className="text-gradient">Especialidades</span>
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-[1.6]">
              Soluciones integrales para transformar su empresa hacia la sostenibilidad y excelencia operacional.
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
                  const Icon = feature.icon;
                  return (
                    <CarouselItem key={index} className="pl-4 md:basis-1/2 lg:basis-1/3">
                      <Link
                        to={feature.path}
                        onClick={() => window.scrollTo(0, 0)}
                        className="block h-full"
                      >
                        <Card className="p-8 h-full hover:shadow-primary transition-all duration-200 ease-in-out hover:-translate-y-1 group cursor-pointer border-2 hover:scale-[1.015] rounded-xl flex flex-col">
                          <div className="flex flex-col items-center text-center flex-1">
                            <div className="w-16 h-16 rounded-xl gradient-primary flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-200">
                              <Icon className="text-primary-foreground" size={32} strokeWidth={2} />
                            </div>
                            <h3 className="text-lg font-semibold mb-2 group-hover:text-primary transition-colors duration-200 leading-snug min-h-[3.5rem] flex items-center">
                              {feature.title}
                            </h3>
                            <div className="w-12 h-0.5 bg-gradient-primary mb-3 opacity-50"></div>
                            <p className="text-muted-foreground leading-[1.6] text-[15px] flex-1">
                              {feature.description}
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

      {/* Clients Section - Redesigned */}
      <section className="py-24 bg-gradient-to-b from-background via-secondary/20 to-background relative overflow-hidden">
        {/* Decorative Elements */}
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl"></div>
        
        <div className="container mx-auto px-4 lg:px-8 relative z-10">
          <div className="text-center mb-16 animate-fade-in">
            <div className="inline-block px-4 py-2 bg-primary/10 rounded-full mb-6">
              <p className="text-sm font-semibold text-primary">Nuestros Aliados</p>
            </div>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6 tracking-tight">
              Empresas que <span className="text-gradient">Transforman con Nosotros</span>
            </h2>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto leading-[1.6]">
              Más de 50+ empresas líderes confían en nuestras soluciones para alcanzar 
              sus objetivos de sostenibilidad y excelencia operacional.
            </p>
          </div>

          {/* Stats Banner */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
            <div className="text-center p-8 rounded-2xl bg-card border border-border hover:border-primary/50 transition-all duration-300">
              <div className="text-4xl md:text-5xl font-bold text-gradient mb-2">50+</div>
              <p className="text-muted-foreground">Clientes Activos</p>
            </div>
            <div className="text-center p-8 rounded-2xl bg-card border border-border hover:border-primary/50 transition-all duration-300">
              <div className="text-4xl md:text-5xl font-bold text-gradient mb-2">15+</div>
              <p className="text-muted-foreground">Años de Experiencia</p>
            </div>
            <div className="text-center p-8 rounded-2xl bg-card border border-border hover:border-primary/50 transition-all duration-300">
              <div className="text-4xl md:text-5xl font-bold text-gradient mb-2">98%</div>
              <p className="text-muted-foreground">Satisfacción del Cliente</p>
            </div>
          </div>

          {/* Client Logos Grid */}
          <div className="mb-16">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
              {[
                "Ecopetrol",
                "Cementos Argos",
                "Grupo Nutresa",
                "ISA",
                "Bancolombia",
                "Corona",
                "Celsia",
                "Postobón"
              ].map((client, index) => (
                <div 
                  key={index} 
                  className="group relative p-8 rounded-xl bg-card border border-border hover:border-primary/50 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg flex items-center justify-center h-32"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/0 to-primary/0 group-hover:from-primary/5 group-hover:to-primary/10 rounded-xl transition-all duration-300"></div>
                  <p className="relative text-base md:text-lg font-bold text-muted-foreground group-hover:text-primary transition-colors duration-200">
                    {client}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Testimonials Carousel */}
          <div className="max-w-4xl mx-auto">
            <Carousel
              opts={{
                align: "start",
                loop: true,
              }}
              setApi={setTestimonialsApi}
              className="w-full"
            >
              <CarouselContent className="-ml-2 md:-ml-4">
                {/* Testimonial 1 */}
                <CarouselItem className="pl-2 md:pl-4 md:basis-1/2">
                  <Card className="relative overflow-hidden border hover:border-primary/50 transition-all duration-300 h-full">
                    <CardContent className="p-6">
                      <div className="flex flex-col h-full">
                        <div className="text-3xl text-primary mb-3 opacity-50">"</div>
                        <p className="text-sm text-foreground mb-4 leading-relaxed italic flex-1">
                          G-Calls S.A.S ha sido clave en nuestra transformación sostenible. Su expertise nos permitió superar regulaciones y convertirnos en referentes del sector.
                        </p>
                        <div className="flex items-center gap-3 mt-auto">
                          <div className="w-12 h-12 rounded-full gradient-primary p-0.5">
                            <div className="w-full h-full rounded-full bg-background flex items-center justify-center">
                              <Users className="text-primary" size={20} />
                            </div>
                          </div>
                          <div>
                            <p className="font-bold text-foreground text-sm">María González</p>
                            <p className="text-muted-foreground text-xs">Dir. Sostenibilidad - Ecopetrol</p>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </CarouselItem>

                {/* Testimonial 2 */}
                <CarouselItem className="pl-2 md:pl-4 md:basis-1/2">
                  <Card className="relative overflow-hidden border hover:border-primary/50 transition-all duration-300 h-full">
                    <CardContent className="p-6">
                      <div className="flex flex-col h-full">
                        <div className="text-3xl text-primary mb-3 opacity-50">"</div>
                        <p className="text-sm text-foreground mb-4 leading-relaxed italic flex-1">
                          La implementación de sus soluciones en gestión ambiental mejoró significativamente nuestros procesos operativos y nos ayudó a alcanzar nuestros objetivos de responsabilidad social.
                        </p>
                        <div className="flex items-center gap-3 mt-auto">
                          <div className="w-12 h-12 rounded-full gradient-primary p-0.5">
                            <div className="w-full h-full rounded-full bg-background flex items-center justify-center">
                              <Users className="text-primary" size={20} />
                            </div>
                          </div>
                          <div>
                            <p className="font-bold text-foreground text-sm">Carlos Rodríguez</p>
                            <p className="text-muted-foreground text-xs">Gerente de Operaciones - Cementos Argos</p>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </CarouselItem>
              </CarouselContent>
              
              <CarouselPrevious className="hidden md:flex -left-12" />
              <CarouselNext className="hidden md:flex -right-12" />
              
              {/* Dots indicators */}
              <div className="flex justify-center gap-2 mt-8">
                {[0, 1].map((index) => (
                  <button
                    key={index}
                    onClick={() => testimonialsApi?.scrollTo(index)}
                    className={`rounded-full transition-all duration-300 ${
                      index === testimonialsCurrentSlide
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
            ¿Listo para Transformar su Empresa?
          </h2>
          <p className="text-lg text-white/95 mb-10 max-w-2xl mx-auto animate-fade-up leading-[1.7]">
            Descubra cómo nuestras soluciones pueden impulsar la sostenibilidad 
            y eficiencia de su organización.
          </p>
          <Link to="/contactos">
            <Button 
              size="lg" 
              className="bg-white text-primary hover:bg-white/95 hover:scale-105 transition-all duration-200 shadow-[0_8px_30px_rgba(0,0,0,0.15)] hover:shadow-[0_12px_40px_rgba(255,255,255,0.3)] animate-scale-in"
            >
              Solicite una Consulta
              <ArrowRight className="ml-2" size={20} />
            </Button>
          </Link>
        </div>
      </section>
    </>  );
};

export default Index;