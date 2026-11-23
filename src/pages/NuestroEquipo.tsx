import { Users, Linkedin, Mail } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { lineas, useContenidoEquipo } from "@/lib/contenidos";
import { icono } from "@/lib/iconos";
import { urlMedio } from "@/lib/medios";
import type { MiembroEquipo } from "@/types/api";

/** Iniciales para la persona sin foto (máximo dos letras). */
const iniciales = (nombre: string) =>
  nombre
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? "")
    .join("");

/** Tarjeta de una persona del equipo (datos desde el panel: Contenidos → Nuestro Equipo). */
const TarjetaMiembro = ({ miembro }: { miembro: MiembroEquipo }) => {
  const foto = urlMedio(miembro.foto);
  const especialidades = lineas(miembro.especialidades);
  return (
    <Card className="group relative overflow-hidden border-border/50 bg-card hover:shadow-[0_8px_30px_rgba(0,0,0,0.12)] transition-all duration-300 hover:-translate-y-2 w-full sm:w-[calc(50%-1rem)] lg:w-[calc(25%-1.5rem)]">
      <CardContent className="p-6">
        <div className="relative mb-6">
          <div className="relative w-32 h-32 mx-auto">
            <div className="absolute inset-0 bg-gradient-primary rounded-full blur-xl opacity-20 group-hover:opacity-40 transition-opacity"></div>
            {foto ? (
              <img
                src={foto}
                alt={miembro.nombre}
                className="relative w-full h-full object-cover rounded-full border-4 border-border/50 group-hover:border-primary/50 transition-all duration-300"
              />
            ) : (
              <div
                aria-hidden="true"
                className="relative w-full h-full rounded-full border-4 border-border/50 group-hover:border-primary/50 transition-all duration-300 gradient-primary flex items-center justify-center text-3xl font-bold text-white"
              >
                {iniciales(miembro.nombre)}
              </div>
            )}
          </div>
        </div>
        <div className="text-center space-y-3">
          <h3 className="text-xl font-bold text-foreground tracking-tight">{miembro.nombre}</h3>
          {miembro.cargo && <p className="text-sm font-semibold text-primary">{miembro.cargo}</p>}
          {miembro.descripcion && (
            <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line">{miembro.descripcion}</p>
          )}
          {especialidades.length > 0 && (
            <div className="pt-3 space-y-2">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Especialidades</p>
              <div className="flex flex-wrap gap-2 justify-center">
                {especialidades.map((e, i) => (
                  <span key={i} className="text-xs px-2 py-1 bg-primary/10 text-primary rounded-md font-medium">
                    {e}
                  </span>
                ))}
              </div>
            </div>
          )}
          {(miembro.linkedin || miembro.email) && (
            <div className="flex items-center justify-center gap-3 pt-4">
              {miembro.linkedin && (
                <a
                  href={miembro.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 rounded-lg bg-muted/50 hover:bg-primary hover:text-primary-foreground transition-all duration-200"
                  aria-label={`LinkedIn de ${miembro.nombre}`}
                >
                  <Linkedin className="w-4 h-4" />
                </a>
              )}
              {miembro.email && (
                <a
                  href={`mailto:${miembro.email}`}
                  className="p-2 rounded-lg bg-muted/50 hover:bg-primary hover:text-primary-foreground transition-all duration-200"
                  aria-label={`Correo de ${miembro.nombre}`}
                >
                  <Mail className="w-4 h-4" />
                </a>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

const NuestroEquipo = () => {
  const equipo = useContenidoEquipo();

  return (
    <>      <div className="min-h-screen">
        {/* Hero Section */}
        <section className="relative pt-28 md:pt-32 lg:pt-36 pb-12 md:pb-16 lg:pb-20 bg-gradient-to-br from-primary/5 via-accent/5 to-background overflow-hidden">
          <div className="absolute inset-0 bg-grid-pattern opacity-[0.02]"></div>
          
          <div className="container mx-auto px-4 lg:px-8 relative z-10">
            <div className="text-center max-w-4xl mx-auto animate-fade-up">
              <div className="inline-flex items-center gap-2 bg-primary/10 px-4 py-2 rounded-full mb-6">
                <Users className="w-4 h-4 text-primary" />
                <span className="text-sm font-semibold text-primary tracking-wide">{equipo.encabezado_antetitulo}</span>
              </div>
            
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 tracking-tight">
              {equipo.encabezado_titulo}
              {equipo.encabezado_titulo && equipo.encabezado_destacado && <br />}
              {equipo.encabezado_destacado && <span className="text-primary">{equipo.encabezado_destacado}</span>}
            </h1>
            
            <p className="text-lg md:text-xl text-muted-foreground leading-relaxed max-w-3xl mx-auto">
              {equipo.encabezado_descripcion}
            </p>
          </div>
        </div>
      </section>

      {/* Team Members Section */}
      <section className="py-16 md:py-24 lg:py-32">
        <div className="container mx-auto px-4 lg:px-8">
          {/* Personas: si no hay ninguna cargada, la cuadrícula no se muestra */}
          {equipo.miembros.length > 0 && (
            <div className="flex flex-wrap justify-center gap-8 mb-20">
              {equipo.miembros.map((miembro, index) => (
                <TarjetaMiembro key={index} miembro={miembro} />
              ))}
            </div>
          )}

          {/* Values Section */}
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight">
                {equipo.valores_titulo}
              </h2>
              <p className="text-lg text-muted-foreground">
                {equipo.valores_descripcion}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {equipo.valores.map((valor, index) => {
                const Icono = icono(valor.icono);
                return (
                  <Card key={index} className="border-border/50 bg-card hover:shadow-lg transition-all duration-300">
                    <CardContent className="p-6 text-center">
                      <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-primary/10 flex items-center justify-center">
                        <Icono className="w-7 h-7 text-primary" />
                      </div>
                      <h3 className="text-xl font-bold mb-3 tracking-tight">{valor.titulo}</h3>
                      <p className="text-muted-foreground leading-relaxed">{valor.descripcion}</p>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative py-16 md:py-24 bg-gradient-to-br from-primary via-accent to-primary overflow-hidden">
        <div className="absolute inset-0 bg-grid-pattern opacity-10"></div>
        
        <div className="container mx-auto px-4 lg:px-8 relative z-10">
          <div className="text-center max-w-3xl mx-auto">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-6 tracking-tight">
              {equipo.cta_titulo}
            </h2>
            <p className="text-lg text-white/90 mb-8 leading-relaxed">
              {equipo.cta_descripcion}
            </p>
            <a href="/contactos">
              <button className="px-8 py-4 bg-white text-primary rounded-xl font-semibold text-lg shadow-[0_8px_30px_rgba(0,0,0,0.12)] hover:shadow-[0_12px_40px_rgba(255,255,255,0.3)] hover:scale-105 transition-all duration-300">
                {equipo.cta_boton}
              </button>
            </a>
          </div>
        </div>
      </section>
      </div>
    </>  );
};

export default NuestroEquipo;
