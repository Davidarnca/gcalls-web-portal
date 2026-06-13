import { Users, Linkedin, Mail, Award, Target, Heart } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import teamMember1 from "@/assets/team-member-1.jpg";
import teamMember2 from "@/assets/team-member-2.jpg";
import teamMember3 from "@/assets/team-member-3.jpg";
import teamMember4 from "@/assets/team-member-4.jpg";

const NuestroEquipo = () => {
  const teamMembers = [
    {
      name: "Carlos Mendoza",
      role: "Director Ambiental",
      description: "Especialista en gestión ambiental con más de 15 años de experiencia en el sector.",
      image: teamMember1,
      linkedin: "#",
      expertise: ["ISO 14001", "Huella de Carbono", "Auditorías Ambientales"]
    },
    {
      name: "María González",
      role: "Coordinadora de Operaciones",
      description: "Experta en optimización de procesos y cadena de suministro sostenible.",
      image: teamMember2,
      linkedin: "#",
      expertise: ["Logística Verde", "Lean Management", "Cadena de Suministro"]
    },
    {
      name: "Jorge Ramírez",
      role: "Consultor en Sostenibilidad",
      description: "Ingeniero ambiental con certificaciones internacionales en sostenibilidad corporativa.",
      image: teamMember3,
      linkedin: "#",
      expertise: ["ESG", "Economía Circular", "Energías Renovables"]
    },
    {
      name: "Ana Martínez",
      role: "Gerente de RSE",
      description: "Líder en estrategias de responsabilidad social empresarial e impacto comunitario.",
      image: teamMember4,
      linkedin: "#",
      expertise: ["Impacto Social", "Reportes de Sostenibilidad", "Stakeholders"]
    }
  ];

  const values = [
    {
      icon: Award,
      title: "Excelencia",
      description: "Nos comprometemos con los más altos estándares de calidad en cada proyecto"
    },
    {
      icon: Target,
      title: "Resultados",
      description: "Enfocados en generar impacto real y medible en cada organización"
    },
    {
      icon: Heart,
      title: "Compromiso",
      description: "Apasionados por la sostenibilidad y el futuro del planeta"
    }
  ];

  return (
    <>      <div className="min-h-screen">
        {/* Hero Section */}
        <section className="relative pt-28 md:pt-32 lg:pt-36 pb-12 md:pb-16 lg:pb-20 bg-gradient-to-br from-primary/5 via-accent/5 to-background overflow-hidden">
          <div className="absolute inset-0 bg-grid-pattern opacity-[0.02]"></div>
          
          <div className="container mx-auto px-4 lg:px-8 relative z-10">
            <div className="text-center max-w-4xl mx-auto animate-fade-up">
              <div className="inline-flex items-center gap-2 bg-primary/10 px-4 py-2 rounded-full mb-6">
                <Users className="w-4 h-4 text-primary" />
                <span className="text-sm font-semibold text-primary tracking-wide">Nuestro Equipo</span>
              </div>
            
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 tracking-tight">
              Expertos en Gestión
              <br />
              <span className="text-primary">Sostenible</span>
            </h1>
            
            <p className="text-lg md:text-xl text-muted-foreground leading-relaxed max-w-3xl mx-auto">
              Un equipo multidisciplinario con amplia experiencia en sostenibilidad, gestión ambiental 
              y responsabilidad social empresarial. Unidos por un objetivo común: transformar empresas 
              hacia un futuro más sostenible.
            </p>
          </div>
        </div>
      </section>

      {/* Team Members Section */}
      <section className="py-16 md:py-24 lg:py-32">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-20">
            {teamMembers.map((member, index) => (
              <Card 
                key={index} 
                className="group relative overflow-hidden border-border/50 bg-card hover:shadow-[0_8px_30px_rgba(0,0,0,0.12)] transition-all duration-300 hover:-translate-y-2"
              >
                <CardContent className="p-6">
                  <div className="relative mb-6">
                    <div className="relative w-32 h-32 mx-auto">
                      <div className="absolute inset-0 bg-gradient-primary rounded-full blur-xl opacity-20 group-hover:opacity-40 transition-opacity"></div>
                      <img 
                        src={member.image} 
                        alt={member.name}
                        className="relative w-full h-full object-cover rounded-full border-4 border-border/50 group-hover:border-primary/50 transition-all duration-300"
                      />
                    </div>
                  </div>

                  <div className="text-center space-y-3">
                    <h3 className="text-xl font-bold text-foreground tracking-tight">
                      {member.name}
                    </h3>
                    <p className="text-sm font-semibold text-primary">
                      {member.role}
                    </p>
                    <p className="text-sm text-muted-foreground leading-relaxed min-h-[2.5rem]">
                      {member.description}
                    </p>

                    <div className="pt-3 space-y-2">
                      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Especialidades</p>
                      <div className="flex flex-wrap gap-2 justify-center">
                        {member.expertise.map((skill, idx) => (
                          <span 
                            key={idx}
                            className="text-xs px-2 py-1 bg-primary/10 text-primary rounded-md font-medium"
                          >
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="flex items-center justify-center gap-3 pt-4">
                      <a 
                        href={member.linkedin}
                        className="p-2 rounded-lg bg-muted/50 hover:bg-primary hover:text-primary-foreground transition-all duration-200"
                        aria-label={`LinkedIn de ${member.name}`}
                      >
                        <Linkedin className="w-4 h-4" />
                      </a>
                      <a 
                        href={`mailto:${member.name.toLowerCase().replace(' ', '.')}@g-calls.com`}
                        className="p-2 rounded-lg bg-muted/50 hover:bg-primary hover:text-primary-foreground transition-all duration-200"
                        aria-label={`Email de ${member.name}`}
                      >
                        <Mail className="w-4 h-4" />
                      </a>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Values Section */}
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight">
                Nuestros Valores
              </h2>
              <p className="text-lg text-muted-foreground">
                Los pilares que guían nuestro trabajo diario
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {values.map((value, index) => (
                <Card key={index} className="border-border/50 bg-card hover:shadow-lg transition-all duration-300">
                  <CardContent className="p-6 text-center">
                    <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-primary/10 flex items-center justify-center">
                      <value.icon className="w-7 h-7 text-primary" />
                    </div>
                    <h3 className="text-xl font-bold mb-3 tracking-tight">{value.title}</h3>
                    <p className="text-muted-foreground leading-relaxed">{value.description}</p>
                  </CardContent>
                </Card>
              ))}
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
              ¿Listo para Trabajar con Nosotros?
            </h2>
            <p className="text-lg text-white/90 mb-8 leading-relaxed">
              Contáctanos y descubre cómo podemos ayudar a tu empresa a alcanzar sus objetivos de sostenibilidad
            </p>
            <a href="/contactos">
              <button className="px-8 py-4 bg-white text-primary rounded-xl font-semibold text-lg shadow-[0_8px_30px_rgba(0,0,0,0.12)] hover:shadow-[0_12px_40px_rgba(255,255,255,0.3)] hover:scale-105 transition-all duration-300">
                Contáctanos Ahora
              </button>
            </a>
          </div>
        </div>
      </section>
      </div>
    </>  );
};

export default NuestroEquipo;
