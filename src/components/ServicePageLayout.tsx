import { ReactNode } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import logoWhite from "@/assets/logo-white.svg";
import heroBg from "@/assets/hero-city.png";

interface ServicePageLayoutProps {
  title: string;
  description: string;
  icon?: ReactNode;
  children?: ReactNode;
}

const ServicePageLayout = ({ title, description, icon, children }: ServicePageLayoutProps) => {
  return (
    <>      {/* Hero Section */}
      <section
        className="relative w-full min-h-[80vh] flex items-center justify-center overflow-hidden"
        style={{
          backgroundImage: `url(${heroBg})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        {/* Dark overlay for legibility */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/55 to-black/75" />
        <div className="absolute inset-0 gradient-primary opacity-40" />

        <div className="container mx-auto px-4 lg:px-8 relative z-10 pt-32 md:pt-40 lg:pt-44 pb-16 md:pb-20">
          <div className="max-w-4xl mx-auto text-center animate-fade-up">
            <img
              src={logoWhite}
              alt="G-Calls S.A.S Logo"
              className="h-20 w-20 md:h-24 md:w-24 mx-auto mb-6 drop-shadow-[0_4px_12px_rgba(0,0,0,0.5)]"
            />
            {icon && (
              <div className="flex justify-center mb-4">{icon}</div>
            )}
            <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold text-white mb-8 tracking-tight drop-shadow-[0_2px_8px_rgba(0,0,0,0.6)] leading-tight max-w-[90%] mx-auto">
              {title}
            </h1>
            <p className="text-base md:text-lg lg:text-xl text-white/95 leading-[1.7] max-w-3xl mx-auto bg-black/30 backdrop-blur-sm rounded-xl px-6 py-5 md:px-8 md:py-6 border border-white/10 shadow-2xl">
              {description}
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center mt-10">
              <Link to="/contactos" onClick={() => window.scrollTo(0, 0)}>
                <Button
                  size="lg"
                  className="bg-white text-primary hover:bg-white/95 hover:scale-105 transition-all duration-200 shadow-[0_8px_30px_rgba(0,0,0,0.25)]"
                >
                  Solicitar Información
                  <ArrowRight className="ml-2" size={20} />
                </Button>
              </Link>
              <Link to="/que-gestionamos" onClick={() => window.scrollTo(0, 0)}>
                <Button
                  size="lg"
                  variant="outline"
                  className="border-2 border-white bg-white/10 text-white hover:bg-white hover:text-primary transition-all duration-200 backdrop-blur-sm"
                >
                  <ArrowLeft className="mr-2" size={20} />
                  Ver Todos los Servicios
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {children}
    </>  );
};

export default ServicePageLayout;