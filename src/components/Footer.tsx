import { Link } from "react-router-dom";
import { Mail, Phone, MapPin, Linkedin, Facebook, Instagram, Send, Clock } from "lucide-react";
import footerLogo from "@/assets/footer-logo.png";
import footerSeparator from "@/assets/favicon.png";
import {
  enlaceMapa,
  enlaceTelefono,
  lineas,
  ubicacion,
  useContenidoGlobal,
} from "@/lib/contenidos";

const iconoContacto =
  "p-1.5 md:p-2 rounded-lg bg-blue-950/50 border border-blue-800/30 group-hover:border-primary/50 transition-colors flex-shrink-0";

const Footer = () => {
  const currentYear = new Date().getFullYear();
  const contacto = useContenidoGlobal();

  const telefonos = [contacto.telefono, contacto.telefono_secundario].filter(Boolean);
  const direccionCompleta = ubicacion(contacto);
  const horario = lineas(contacto.horario);
  const redes = [
    { nombre: "LinkedIn", url: contacto.linkedin, Icono: Linkedin },
    { nombre: "Facebook", url: contacto.facebook, Icono: Facebook },
    { nombre: "Instagram", url: contacto.instagram, Icono: Instagram },
  ].filter((red) => red.url);

  return (
    <footer className="bg-[hsl(220,45%,12%)] text-gray-100 border-t border-blue-900/30">
      {/* Main Footer Content */}
      <div className="container mx-auto px-4 lg:px-8 py-12 md:py-16 lg:py-20">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 md:gap-10 lg:gap-8">
          
          {/* Company Section - Spans 2 columns on large screens */}
          <div className="lg:col-span-2 space-y-4 md:space-y-6">
            <div className="flex items-center gap-3 md:gap-4 mb-3">
              <img src={footerLogo} alt="G-Calls Logo" className="h-16 w-16 md:h-20 md:w-20 lg:h-24 lg:w-24 object-contain" />
              <div className="flex flex-col justify-center">
                <h2 className="text-xl md:text-2xl lg:text-[1.65rem] font-bold text-white mb-1">Gestión Sostenible</h2>
                <p className="text-sm md:text-base text-blue-300/70 font-medium">G-Calls S.A.S</p>
              </div>
            </div>
            
            <p className="text-gray-300 leading-relaxed text-sm md:text-base">
              G-Calls S.A.S transforma empresas hacia la sostenibilidad con soluciones integrales en 
              cadena de abastecimiento, gestión ambiental, seguridad y responsabilidad social.
            </p>

            {/* Newsletter */}
            <div className="space-y-2 md:space-y-3">
              <h3 className="text-white font-semibold text-sm md:text-base lg:text-lg">Recibe Tips de Sostenibilidad</h3>
              <div className="flex gap-2">
                <input 
                  type="email" 
                  placeholder="Soluciones sostenibles en tu inbox"
                  className="flex-1 px-3 md:px-4 py-2 md:py-2.5 bg-blue-950/30 border border-blue-800/30 rounded-lg text-xs md:text-sm text-white placeholder:text-gray-500 focus:outline-none focus:border-primary transition-colors"
                />
                <button className="px-3 md:px-4 py-2 md:py-2.5 bg-primary hover:bg-primary/90 rounded-lg transition-colors flex-shrink-0">
                  <Send size={16} className="text-white md:w-[18px] md:h-[18px]" />
                </button>
              </div>
            </div>
          </div>

          {/* Navigation Links */}
          <div>
            <h3 className="text-white font-bold mb-4 md:mb-6 text-sm md:text-base uppercase tracking-wider">Navegación</h3>
            <ul className="space-y-2 md:space-y-3">
              {[
                { label: "Inicio", path: "/" },
                { label: "Principios", path: "/decálogo" },
                { label: "Quiénes Somos", path: "/quiénes-somos" },
                { label: "Nuestros Mercados", path: "/nuestros-mercados" },
                { label: "Qué Gestionamos", path: "/que-gestionamos" },
                { label: "Contactos", path: "/contactos" }
              ].map((item) => (
                <li key={item.label}>
                  <Link
                    to={item.path}
                    className="text-gray-300 hover:text-white hover:translate-x-1 inline-block transition-all duration-200 text-sm md:text-base"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Services */}
          <div>
            <h3 className="text-white font-bold mb-4 md:mb-6 text-sm md:text-base uppercase tracking-wider">Servicios</h3>
            <ul className="space-y-2 md:space-y-3 text-sm md:text-base">
              <li className="text-gray-300 hover:text-white transition-colors cursor-pointer">Supply Chain</li>
              <li className="text-gray-300 hover:text-white transition-colors cursor-pointer">Medio Ambiente</li>
              <li className="text-gray-300 hover:text-white transition-colors cursor-pointer">Seguridad Industrial</li>
              <li className="text-gray-300 hover:text-white transition-colors cursor-pointer">Salud Laboral</li>
              <li className="text-gray-300 hover:text-white transition-colors cursor-pointer">RSE</li>
            </ul>
          </div>

          {/* Contact Info — editable desde el panel (Contenidos → Datos de contacto) */}
          <div>
            <h3 className="text-white font-bold mb-4 md:mb-6 text-sm md:text-base uppercase tracking-wider">Contacto</h3>
            <ul className="space-y-3 md:space-y-4">
              {contacto.email && (
                <li>
                  <a href={`mailto:${contacto.email}`} className="group flex items-center gap-2 md:gap-3 text-gray-300 hover:text-white transition-colors">
                    <div className={iconoContacto}>
                      <Mail size={14} className="text-blue-400 md:w-4 md:h-4" />
                    </div>
                    <span className="text-sm md:text-base break-all">{contacto.email}</span>
                  </a>
                </li>
              )}
              {telefonos.map((telefono) => (
                <li key={telefono}>
                  <a href={enlaceTelefono(telefono)} className="group flex items-center gap-2 md:gap-3 text-gray-300 hover:text-white transition-colors">
                    <div className={iconoContacto}>
                      <Phone size={14} className="text-blue-400 md:w-4 md:h-4" />
                    </div>
                    <span className="text-sm md:text-base">{telefono}</span>
                  </a>
                </li>
              ))}
              {direccionCompleta && (
                <li>
                  <a href={enlaceMapa(direccionCompleta)} target="_blank" rel="noopener noreferrer" className="group flex items-center gap-2 md:gap-3 text-gray-300 hover:text-white transition-colors">
                    <div className={iconoContacto}>
                      <MapPin size={14} className="text-blue-400 md:w-4 md:h-4" />
                    </div>
                    <span className="text-sm md:text-base">{direccionCompleta}</span>
                  </a>
                </li>
              )}
              {horario.length > 0 && (
                <li>
                  <div className="flex items-start gap-2 md:gap-3 text-gray-300">
                    <div className={iconoContacto}>
                      <Clock size={14} className="text-blue-400 md:w-4 md:h-4" />
                    </div>
                    <span className="text-sm md:text-base">
                      {horario.map((linea) => (
                        <span key={linea} className="block">{linea}</span>
                      ))}
                    </span>
                  </div>
                </li>
              )}
            </ul>

            {/* Social Media — solo se muestran las redes configuradas */}
            {redes.length > 0 && (
              <div className="mt-4 md:mt-6 flex gap-2">
                {redes.map(({ nombre, url, Icono }) => (
                  <a
                    key={nombre}
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 md:p-2.5 rounded-lg bg-blue-950/50 border border-blue-800/30 hover:bg-primary hover:border-primary transition-all duration-300"
                    aria-label={nombre}
                  >
                    <Icono size={16} className="text-blue-300 md:w-[18px] md:h-[18px]" />
                  </a>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="bg-[hsl(220,50%,8%)] border-t border-blue-900/30">
        <div className="container mx-auto px-4 lg:px-8 py-4 md:py-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-3 md:gap-4 text-xs md:text-sm">
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 text-gray-400">
              <span>&copy; {currentYear} G-Calls S.A.S.</span>
              <img src={footerSeparator} alt="" className="h-3 md:h-4 w-auto" />
              <span>Todos los derechos reservados.</span>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-3 md:gap-6">
              <a href="#" className="text-gray-400 hover:text-white transition-colors">Privacidad</a>
              <span className="text-blue-800">•</span>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">Términos</a>
              <span className="text-blue-800">•</span>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">Cookies</a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
