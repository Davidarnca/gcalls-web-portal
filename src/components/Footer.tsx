import { Link } from "react-router-dom";
import { Mail, Phone, MapPin, Linkedin, Facebook, Instagram, Send, Clock } from "lucide-react";
import footerLogo from "@/assets/footer-logo.png";
import footerSeparator from "@/assets/footer-separator.png";

const Footer = () => {
  const currentYear = new Date().getFullYear();

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
                { label: "Decálogo", path: "/decálogo" },
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

          {/* Contact Info */}
          <div>
            <h3 className="text-white font-bold mb-4 md:mb-6 text-sm md:text-base uppercase tracking-wider">Contacto</h3>
            <ul className="space-y-3 md:space-y-4">
              <li>
                <a href="mailto:info@gestionsostenible.com" className="group flex items-center gap-2 md:gap-3 text-gray-300 hover:text-white transition-colors">
                  <div className="p-1.5 md:p-2 rounded-lg bg-blue-950/50 border border-blue-800/30 group-hover:border-primary/50 transition-colors flex-shrink-0">
                    <Mail size={14} className="text-blue-400 md:w-4 md:h-4" />
                  </div>
                  <span className="text-sm md:text-base break-all">info@gestionsostenible.com</span>
                </a>
              </li>
              <li>
                <a href="tel:+15551234567" className="group flex items-center gap-2 md:gap-3 text-gray-300 hover:text-white transition-colors">
                  <div className="p-1.5 md:p-2 rounded-lg bg-blue-950/50 border border-blue-800/30 group-hover:border-primary/50 transition-colors flex-shrink-0">
                    <Phone size={14} className="text-blue-400 md:w-4 md:h-4" />
                  </div>
                  <span className="text-sm md:text-base">+1 (555) 123-4567</span>
                </a>
              </li>
              <li>
                <div className="flex items-center gap-2 md:gap-3 text-gray-300">
                  <div className="p-1.5 md:p-2 rounded-lg bg-blue-950/50 border border-blue-800/30 flex-shrink-0">
                    <MapPin size={14} className="text-blue-400 md:w-4 md:h-4" />
                  </div>
                  <span className="text-sm md:text-base">Ciudad, País</span>
                </div>
              </li>
              <li>
                <div className="flex items-center gap-2 md:gap-3 text-gray-300">
                  <div className="p-1.5 md:p-2 rounded-lg bg-blue-950/50 border border-blue-800/30 flex-shrink-0">
                    <Clock size={14} className="text-blue-400 md:w-4 md:h-4" />
                  </div>
                  <span className="text-sm md:text-base">Lunes a Viernes de 8 AM a 5 PM</span>
                </div>
              </li>
            </ul>

            {/* Social Media */}
            <div className="mt-4 md:mt-6 flex gap-2">
              <a
                href="#"
                className="p-2 md:p-2.5 rounded-lg bg-blue-950/50 border border-blue-800/30 hover:bg-primary hover:border-primary transition-all duration-300"
                aria-label="LinkedIn"
              >
                <Linkedin size={16} className="text-blue-300 md:w-[18px] md:h-[18px]" />
              </a>
              <a
                href="#"
                className="p-2 md:p-2.5 rounded-lg bg-blue-950/50 border border-blue-800/30 hover:bg-primary hover:border-primary transition-all duration-300"
                aria-label="Facebook"
              >
                <Facebook size={16} className="text-blue-300 md:w-[18px] md:h-[18px]" />
              </a>
              <a
                href="#"
                className="p-2 md:p-2.5 rounded-lg bg-blue-950/50 border border-blue-800/30 hover:bg-primary hover:border-primary transition-all duration-300"
                aria-label="Instagram"
              >
                <Instagram size={16} className="text-blue-300 md:w-[18px] md:h-[18px]" />
              </a>
            </div>
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
