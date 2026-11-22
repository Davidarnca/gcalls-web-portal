import { useState } from "react";
import { Mail, Phone, MapPin, Send, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
// Sonner es el sistema de notificaciones activo en el proyecto (ver App.tsx)
import { toast } from "@/components/ui/sonner";
import {
  enlaceMapa,
  enlaceTelefono,
  lineas,
  ubicacion,
  useContenidoGlobal,
} from "@/lib/contenidos";

// URL del endpoint PHP — el proxy de Vite redirige /api → servidor PHP en dev
const API_URL = "/api/contactos.php";

// Tipo del payload que acepta la API REST PHP
export interface ContactoPayload {
  nombre: string;
  email: string;
  empresa: string;
  telefono: string;
  mensaje: string;
  servicio_interes?: number;
}

// Forma estandarizada de respuesta de la API REST PHP
export interface ApiResponse {
  success: boolean;
  message: string;
  data?: { id: number; estado: string; fecha_registro: string };
  errors?: Record<string, string>;
}

const Contactos = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    company: "",
    message: "",
  });

  // Estado de validación por campo — muestra errores devueltos por la API
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const EMPTY_FORM = {
    name: "",
    email: "",
    phone: "",
    company: "",
    message: "",
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setFieldErrors({});

    // Construye el payload usando los nombres de campo del contrato PHP
    const payload: ContactoPayload = {
      nombre: formData.name.trim(),
      email: formData.email.trim(),
      empresa: formData.company.trim(),
      telefono: formData.phone.trim(),
      mensaje: formData.message.trim(),
    };

    try {
      const response = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      // Intentamos parsear siempre — la API siempre devuelve JSON
      let data: ApiResponse;
      try {
        data = await response.json();
      } catch {
        throw new Error("La respuesta del servidor no es JSON válido.");
      }

      if (response.ok && data.success) {
        // ── Éxito ───────────────────────────────────────────────────────────
        toast.success("¡Mensaje enviado!", {
          description:
            data.message ?? "Nos pondremos en contacto contigo pronto.",
          duration: 6000,
        });
        setFormData(EMPTY_FORM);
      } else if (response.status === 400 && data.errors) {
        // ── Errores de validación devueltos por PHP (400) ───────────────────
        setFieldErrors(data.errors);
        toast.error("Revisa los campos del formulario", {
          description: data.message ?? "Algunos campos contienen errores.",
          duration: 5000,
        });
      } else {
        // ── Error de servidor o respuesta inesperada ────────────────────────
        throw new Error(data.message ?? "Error al procesar tu solicitud.");
      }
    } catch (error: unknown) {
      const message =
        error instanceof Error
          ? error.message
          : "No se pudo conectar con el servidor. Inténtalo más tarde.";

      console.error("[Contactos] Error al enviar formulario:", error);
      toast.error("Error al enviar el mensaje", {
        description: message,
        duration: 7000,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  // Datos de contacto editables desde el panel (Contenidos → Datos de contacto).
  // Las tarjetas sin dato configurado no se muestran.
  const contacto = useContenidoGlobal();
  const direccionCompleta = ubicacion(contacto);
  const telefonos = [contacto.telefono, contacto.telefono_secundario].filter(Boolean);
  const horario = lineas(contacto.horario);

  const contactInfo = [
    contacto.email && {
      icon: Mail,
      title: "Correo Electrónico",
      values: [contacto.email],
      link: `mailto:${contacto.email}`,
      external: false,
    },
    telefonos.length > 0 && {
      icon: Phone,
      title: telefonos.length > 1 ? "Teléfonos" : "Teléfono",
      values: telefonos,
      link: enlaceTelefono(telefonos[0]),
      external: false,
    },
    direccionCompleta && {
      icon: MapPin,
      title: "Dirección",
      values: [direccionCompleta],
      link: enlaceMapa(direccionCompleta),
      external: true,
    },
  ].filter((item): item is Exclude<typeof item, false | ""> => Boolean(item));

  return (
    <>
      {" "}
      {/* Hero Section */}
      <section className="pt-28 md:pt-32 lg:pt-36 pb-20 gradient-primary text-white">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="max-w-4xl mx-auto text-center animate-fade-in">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
              Contáctenos
            </h1>
            <p className="text-lg md:text-xl text-white/90 leading-relaxed">
              Estamos aquí para ayudarle a transformar su empresa. Envíenos un
              mensaje y uno de nuestros expertos se pondrá en contacto con
              usted.
            </p>
          </div>
        </div>
      </section>
      {/* Contact Section */}
      <section className="py-20 bg-gradient-subtle">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
            {/* Contact Info */}
            <div className="lg:col-span-1 space-y-6">
              <div className="animate-fade-in">
                <h2 className="text-2xl font-bold mb-6">
                  Información de Contacto
                </h2>
                <div className="space-y-4">
                  {contactInfo.map((info, index) => {
                    const Icon = info.icon;
                    return (
                      <Card
                        key={index}
                        className="p-6 hover:shadow-primary transition-all duration-300 hover:-translate-y-1"
                      >
                        <a
                          href={info.link}
                          {...(info.external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                          className="flex items-start gap-4 group"
                        >
                          <div className="w-12 h-12 rounded-lg gradient-primary flex items-center justify-center flex-shrink-0 group-hover:animate-float">
                            <Icon
                              className="text-primary-foreground"
                              size={24}
                            />
                          </div>
                          <div>
                            <h3 className="font-semibold mb-1 group-hover:text-primary transition-colors">
                              {info.title}
                            </h3>
                            {info.values.map((valor) => (
                              <p key={valor} className="text-muted-foreground break-words">
                                {valor}
                              </p>
                            ))}
                          </div>
                        </a>
                      </Card>
                    );
                  })}
                </div>
              </div>

              {horario.length > 0 && (
                <Card className="p-6 gradient-secondary text-white">
                  <h3 className="text-xl font-semibold mb-3">
                    Horario de Atención
                  </h3>
                  <div className="space-y-2 text-white/90">
                    {horario.map((linea) => (
                      <p key={linea}>{linea}</p>
                    ))}
                  </div>
                </Card>
              )}
            </div>

            {/* Contact Form */}
            <div className="lg:col-span-2">
              <Card className="p-8 lg:p-10 animate-fade-up">
                <h2 className="text-2xl font-bold mb-6">Envíenos un Mensaje</h2>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Nombre */}
                    <div>
                      <label
                        htmlFor="name"
                        className="block text-sm font-medium mb-2"
                      >
                        Nombre Completo *
                      </label>
                      <Input
                        id="name"
                        name="name"
                        type="text"
                        required
                        value={formData.name}
                        onChange={handleChange}
                        placeholder="Juan Pérez"
                        aria-invalid={!!fieldErrors.nombre}
                        aria-describedby={
                          fieldErrors.nombre ? "error-nombre" : undefined
                        }
                        className={`transition-all duration-300 focus:shadow-soft ${fieldErrors.nombre ? "border-destructive" : ""}`}
                      />
                      {fieldErrors.nombre && (
                        <p
                          id="error-nombre"
                          className="mt-1 text-xs text-destructive"
                        >
                          {fieldErrors.nombre}
                        </p>
                      )}
                    </div>

                    {/* Email */}
                    <div>
                      <label
                        htmlFor="email"
                        className="block text-sm font-medium mb-2"
                      >
                        Correo Electrónico *
                      </label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        required
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="juan@empresa.com"
                        aria-invalid={!!fieldErrors.email}
                        aria-describedby={
                          fieldErrors.email ? "error-email" : undefined
                        }
                        className={`transition-all duration-300 focus:shadow-soft ${fieldErrors.email ? "border-destructive" : ""}`}
                      />
                      {fieldErrors.email && (
                        <p
                          id="error-email"
                          className="mt-1 text-xs text-destructive"
                        >
                          {fieldErrors.email}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Teléfono */}
                    <div>
                      <label
                        htmlFor="phone"
                        className="block text-sm font-medium mb-2"
                      >
                        Teléfono
                      </label>
                      <Input
                        id="phone"
                        name="phone"
                        type="tel"
                        value={formData.phone}
                        onChange={handleChange}
                        placeholder="+57 300 123 4567"
                        aria-invalid={!!fieldErrors.telefono}
                        aria-describedby={
                          fieldErrors.telefono ? "error-telefono" : undefined
                        }
                        className={`transition-all duration-300 focus:shadow-soft ${fieldErrors.telefono ? "border-destructive" : ""}`}
                      />
                      {fieldErrors.telefono && (
                        <p
                          id="error-telefono"
                          className="mt-1 text-xs text-destructive"
                        >
                          {fieldErrors.telefono}
                        </p>
                      )}
                    </div>

                    {/* Empresa */}
                    <div>
                      <label
                        htmlFor="company"
                        className="block text-sm font-medium mb-2"
                      >
                        Empresa
                      </label>
                      <Input
                        id="company"
                        name="company"
                        type="text"
                        value={formData.company}
                        onChange={handleChange}
                        placeholder="Mi Empresa S.A."
                        aria-invalid={!!fieldErrors.empresa}
                        aria-describedby={
                          fieldErrors.empresa ? "error-empresa" : undefined
                        }
                        className={`transition-all duration-300 focus:shadow-soft ${fieldErrors.empresa ? "border-destructive" : ""}`}
                      />
                      {fieldErrors.empresa && (
                        <p
                          id="error-empresa"
                          className="mt-1 text-xs text-destructive"
                        >
                          {fieldErrors.empresa}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Mensaje */}
                  <div>
                    <label
                      htmlFor="message"
                      className="block text-sm font-medium mb-2"
                    >
                      Mensaje *
                    </label>
                    <Textarea
                      id="message"
                      name="message"
                      required
                      value={formData.message}
                      onChange={handleChange}
                      placeholder="Cuéntenos sobre su proyecto o consulta..."
                      rows={6}
                      aria-invalid={!!fieldErrors.mensaje}
                      aria-describedby={
                        fieldErrors.mensaje ? "error-mensaje" : undefined
                      }
                      className={`transition-all duration-300 focus:shadow-soft resize-none ${fieldErrors.mensaje ? "border-destructive" : ""}`}
                    />
                    {fieldErrors.mensaje && (
                      <p
                        id="error-mensaje"
                        className="mt-1 text-xs text-destructive"
                      >
                        {fieldErrors.mensaje}
                      </p>
                    )}
                  </div>

                  <Button
                    type="submit"
                    size="lg"
                    disabled={isSubmitting}
                    className="w-full gradient-primary hover:shadow-glow transition-all duration-300 hover:scale-105 flex items-center justify-center gap-2"
                  >
                    {isSubmitting ? (
                      <Loader2 className="h-5 w-5 animate-spin" />
                    ) : (
                      <Send size={20} />
                    )}
                    {isSubmitting ? "Enviando mensaje..." : "Enviar Mensaje"}
                  </Button>
                </form>
              </Card>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default Contactos;
