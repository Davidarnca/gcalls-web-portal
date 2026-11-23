import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import logo from "@/assets/logo.svg";
import logoWhite from "@/assets/logo-white.svg";
import { rutaServicio, useServicios } from "@/lib/servicios";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [openSubmenus, setOpenSubmenus] = useState<Record<string, boolean>>({});
  const [isScrolled, setIsScrolled] = useState(false);
  const location = useLocation();
  const { servicios } = useServicios();

  const isHomePage = location.pathname === "/";

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener("scroll", handleScroll);
    handleScroll();

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { name: "Inicio", path: "/" },
    { name: "Principios", path: "/decalogo" },
    {
      name: "Nosotros",
      path: "/quienes-somos",
      submenu: [
        { name: "Quiénes Somos", path: "/quienes-somos" },
        { name: "Nuestro Equipo", path: "/nuestro-equipo" }
      ],
      submenuWidth: "w-56"
    },
    { name: "Nuestros Mercados", path: "/nuestros-mercados" },
    {
      name: "¿Qué Gestionamos?",
      path: "/que-gestionamos",
      submenu: [
        // Servicios activos, administrados desde el panel (Servicios)
        ...servicios.map((s) => ({ name: s.titulo, path: rutaServicio(s.slug) })),
      ],
      submenuWidth: "w-[24rem]"
    },
  ];

  const isActive = (path: string) => location.pathname === path;

  const navBgClass = "bg-card/80 backdrop-blur-lg border-border shadow-soft";
  const textColorClass = "text-foreground";
  const textHoverClass = "hover:text-foreground/85";
  const activeTextClass = "text-primary";
  const currentLogo = logo;

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 border-b transition-all duration-300 ${navBgClass}`}>
      <div className="container mx-auto px-4 lg:px-8">
        <div className="flex items-center justify-between h-20 md:h-24 lg:h-28">
          {/* Logo */}
          <Link to="/" onClick={() => window.scrollTo(0, 0)} className="flex items-center gap-2 sm:gap-3 group">
            <img
              src={currentLogo}
              alt="Gestión & Consultoría S.A.S Logo"
              className="h-16 w-16 sm:h-20 sm:w-20 md:h-22 md:w-22 lg:h-28 lg:w-28 transition-transform duration-300 group-hover:scale-105"
            />
            <span className="text-base sm:text-lg md:text-lg lg:text-xl font-semibold transition-colors duration-300 text-gradient">
              G-Calls S.A.S
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-0.5">
            {navLinks.map((link) => (
              link.submenu ? (
                <div key={link.path} className="relative group">
                  <button
                    className={`px-3 py-2 rounded-lg font-semibold transition-all duration-180 relative flex items-center gap-1 ${isActive(link.path) || link.submenu.some(sub => isActive(sub.path))
                        ? activeTextClass
                        : `${textColorClass} ${textHoverClass}`
                      }`}
                    style={{ fontSize: '0.95rem', letterSpacing: '0.3px' }}
                  >
                    {link.name}
                    <ChevronDown className="w-3.5 h-3.5 transition-transform duration-180 group-hover:rotate-180" />
                    <span
                      className={`absolute bottom-1 left-3 right-3 h-px transform origin-left transition-transform duration-180 bg-gradient-primary ${isActive(link.path) || link.submenu.some(sub => isActive(sub.path)) ? "scale-x-100" : "scale-x-0 group-hover:scale-x-100"
                        }`}
                    />
                  </button>

                  {/* Dropdown Menu */}
                  <div className={`absolute top-full left-0 mt-2 ${link.submenuWidth ?? "w-48"} opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50`}>
                    <div className="bg-card/95 backdrop-blur-lg border border-border rounded-lg shadow-lg overflow-hidden">
                      {link.submenu.map((sublink) => (
                        <Link
                          key={sublink.path}
                          to={sublink.path}
                          onClick={() => window.scrollTo(0, 0)}
                          className={`block px-4 py-3 text-sm font-medium transition-colors hover:bg-muted leading-snug ${isActive(sublink.path)
                              ? "text-primary bg-primary/5"
                              : "text-foreground"
                            }`}
                          style={{ letterSpacing: '0.3px' }}
                        >
                          {sublink.name}
                        </Link>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <Link
                  key={link.path}
                  to={link.path}
                  onClick={() => window.scrollTo(0, 0)}
                  className={`px-3 py-2 rounded-lg font-semibold transition-all duration-180 relative group ${isActive(link.path)
                      ? activeTextClass
                      : `${textColorClass} ${textHoverClass}`
                    }`}
                  style={{ fontSize: '0.95rem', letterSpacing: '0.3px' }}
                >
                  {link.name}
                  <span
                    className={`absolute bottom-1 left-3 right-3 h-px transform origin-left transition-transform duration-180 bg-gradient-primary ${isActive(link.path) ? "scale-x-100" : "scale-x-0 group-hover:scale-x-100"
                      }`}
                  />
                </Link>
              )
            ))}
          </div>

          {/* CTA Button Desktop */}
          <div className="hidden lg:block ml-1">
            <Link to="/contactos" onClick={() => window.scrollTo(0, 0)}>
              <Button
                size="lg"
                className="transition-all duration-300 hover:scale-105 px-8 py-5 gradient-primary hover:shadow-glow"
              >
                Contáctenos
              </Button>
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="lg:hidden p-2 rounded-lg transition-colors hover:bg-muted"
            aria-label="Toggle menu"
          >
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <div className="lg:hidden py-4 animate-fade-in">
            <div className="flex flex-col gap-2">
              {navLinks.map((link) => (
                link.submenu ? (
                  <div key={link.path} className="space-y-1">
                    <button
                      onClick={() =>
                        setOpenSubmenus((prev) => ({ ...prev, [link.path]: !prev[link.path] }))
                      }
                      className={`w-full px-4 py-3 rounded-lg font-medium tracking-normal flex items-center justify-between transition-all duration-300 ${isActive(link.path)
                          ? "bg-primary/10 text-primary"
                          : "text-foreground hover:bg-muted"
                        }`}
                    >
                      {link.name}
                      <ChevronDown
                        className={`w-4 h-4 transition-transform duration-200 ${openSubmenus[link.path] ? "rotate-180" : ""
                          }`}
                      />
                    </button>
                    <div
                      className={`overflow-hidden transition-all duration-200 ${openSubmenus[link.path] ? "max-h-[32rem] opacity-100" : "max-h-0 opacity-0"
                        }`}
                    >
                      {link.submenu.map((sublink) => (
                        <Link
                          key={sublink.path}
                          to={sublink.path}
                          onClick={() => {
                            window.scrollTo(0, 0);
                            setIsOpen(false);
                            setOpenSubmenus({});
                          }}
                          className={`pl-8 pr-4 py-3 rounded-lg font-medium tracking-normal transition-all duration-300 block leading-snug ${isActive(sublink.path)
                              ? "bg-primary/10 text-primary"
                              : "text-foreground hover:bg-muted"
                            }`}
                        >
                          {sublink.name}
                        </Link>
                      ))}
                    </div>
                  </div>
                ) : (
                  <Link
                    key={link.path}
                    to={link.path}
                    onClick={() => {
                      window.scrollTo(0, 0);
                      setIsOpen(false);
                    }}
                    className={`px-4 py-3 rounded-lg font-medium tracking-normal transition-all duration-300 ${isActive(link.path)
                        ? "bg-primary/10 text-primary"
                        : "text-foreground hover:bg-muted"
                      }`}
                  >
                    {link.name}
                  </Link>
                )
              ))}
              <Link to="/contactos" onClick={() => {
                window.scrollTo(0, 0);
                setIsOpen(false);
              }}>
                <Button className="w-full mt-2 gradient-primary">
                  Contáctenos
                </Button>
              </Link>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;