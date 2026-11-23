import { useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, ArrowRight, Loader2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { icono } from "@/lib/iconos";
import { LUCES, TEMAS, useServicios } from "@/lib/servicios";
import { urlMedio } from "@/lib/medios";
import NotFound from "./NotFound";

/**
 * Plantilla única de las páginas /servicios/:slug.
 * Contenido desde el panel (Servicios) con respaldo al contenido original.
 * Un servicio inactivo o inexistente muestra la página 404.
 */
const ServicioDetalle = () => {
  const { slug } = useParams<{ slug: string }>();
  const { servicios, estado } = useServicios();
  const servicio = servicios.find((s) => s.slug === slug);

  useEffect(() => {
    if (servicio) document.title = `${servicio.titulo} | G-Calls S.A.S`;
  }, [servicio]);

  if (estado === "cargando") {
    return (
      <section className="min-h-screen flex items-center justify-center bg-[#0F172A]" aria-busy="true">
        <Loader2 className="h-10 w-10 animate-spin text-slate-500" aria-label="Cargando servicio" />
      </section>
    );
  }

  if (!servicio) return <NotFound />;

  const tema = TEMAS[servicio.tema];
  // Foto de fondo opcional subida desde el panel (Servicios → Editar)
  const foto = urlMedio(servicio.contenido.imagen);
  const IconoPrincipal = icono(servicio.icono);

  return (
    <section
      className={`relative pt-32 pb-24 lg:pt-40 lg:pb-32 min-h-screen flex items-center overflow-hidden ${tema.seccion}`}
    >
      {/* Fondo del tema */}
      {servicio.tema === "marca" ? (
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-gradient-to-br from-[#0e7734] via-[#2b358e] to-[#1a237e] z-10 opacity-95" />
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#e84e1b]/10 blur-[120px] rounded-full z-10" />
          {foto && <img src={foto} alt="" className="w-full h-full object-cover opacity-20 mix-blend-overlay" />}
        </div>
      ) : (
        <>
          {foto && <img src={foto} alt="" className="absolute inset-0 w-full h-full object-cover opacity-20 pointer-events-none" />}
          <div className={`absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] ${LUCES[servicio.tema][0]} blur-[130px] rounded-full pointer-events-none`} />
          <div className={`absolute bottom-10 right-10 w-[400px] h-[400px] ${LUCES[servicio.tema][1]} blur-[120px] rounded-full pointer-events-none`} />
        </>
      )}

      <div className="container relative z-20 mx-auto px-4 lg:px-8">
        <div className="max-w-4xl mx-auto text-center mb-16 animate-fade-in">
          <div className="flex justify-center mb-8">
            <div className={`p-4 backdrop-blur-lg rounded-2xl shadow-xl ${tema.marcoIcono}`}>
              <IconoPrincipal size={52} strokeWidth={1.5} />
            </div>
          </div>

          <h1
            className={`text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-8 tracking-tight drop-shadow-lg ${
              servicio.tema === "marca" ? "" : "leading-tight"
            }`}
          >
            {servicio.titulo}
          </h1>

          <div className={`backdrop-blur-md p-6 md:p-8 rounded-2xl mb-10 shadow-2xl ${tema.tarjetaHero}`}>
            {servicio.contenido.descripcion.split("\n").filter(Boolean).map((parrafo) => (
              <p key={parrafo} className="text-lg md:text-xl leading-relaxed">
                {parrafo}
              </p>
            ))}
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to={`/contactos?servicio=${servicio.slug}`}
              className={`font-bold py-3.5 px-8 rounded-xl transition-all shadow-xl flex items-center justify-center gap-2 group ${tema.botonPrimario}`}
            >
              Solicitar Información <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              to="/que-gestionamos"
              className={`font-semibold py-3.5 px-8 rounded-xl transition-colors flex items-center justify-center gap-2 group ${tema.botonSecundario}`}
            >
              <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" /> Ver Todos los Servicios
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
          {servicio.contenido.tarjetas.map((tarjeta, index) => {
            const IconoTarjeta = icono(tarjeta.icono);
            return (
              <Card
                key={`${tarjeta.titulo}-${index}`}
                className={`p-6 md:p-8 backdrop-blur-md transition-all duration-300 hover:-translate-y-2 group flex flex-col h-full animate-fade-up ${tema.tarjeta}`}
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className={`w-14 h-14 rounded-xl flex items-center justify-center mb-6 transition-all shrink-0 ${tema.iconoTarjeta}`}>
                  <IconoTarjeta size={28} />
                </div>

                <h3 className="text-xl font-bold mb-4 text-white">{tarjeta.titulo}</h3>

                <ul className={`text-sm leading-relaxed tracking-tight ${tema.textoTarjeta}`}>
                  {tarjeta.items.map((item) => (
                    <li key={item} className="flex items-start mb-3">
                      <span className={`mr-2 mt-0.5 font-bold ${tema.viñeta}`} aria-hidden="true">•</span>
                      <span className="opacity-90">{item}</span>
                    </li>
                  ))}
                </ul>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default ServicioDetalle;
