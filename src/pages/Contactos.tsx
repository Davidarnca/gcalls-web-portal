import { useState } from "react";
import { Mail, Phone, MapPin, Send, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import Layout from "@/components/Layout";

const Contactos = () => {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    company: "",
    message: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await fetch("http://127.0.0.1:3000/api/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          nombre: formData.name,
          email: formData.email,
          mensaje: `Empresa: ${formData.company}\nTeléfono: ${formData.phone}\n\nMensaje:\n${formData.message}`,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        toast({
          title: "¡Mensaje Enviado!",
          description: "Nos pondremos en contacto con usted pronto.",
        });

        setFormData({
          name: "",
          email: "",
          phone: "",
          company: "",
          message: "",
        });
      } else {
        throw new Error(data.error || "Error al enviar el mensaje");
      }
    } catch (error) {
      console.error(error);
      toast({
        variant: "destructive",
        title: "Error de envío",
        description: "No se pudo conectar con el servidor. Inténtelo más tarde.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const contactInfo = [
    {
      icon: Mail,
      title: "Correo Electrónico",
      value: "info@gestionsostenible.com",
      link: "mailto:info@gestionsostenible.com",
    },
    {
      icon: Phone,
      title: "Teléfono",
      value: "+1 (555) 123-4567",
      link: "tel:+15551234567",
    },
    {
      icon: MapPin,
      title: "Dirección",
      value: "Ciudad, País",
      link: "#",
    },
  ];

  return (
    <Layout>
      {/* Hero Section */}
      <section className="pt-28 md:pt-32 lg:pt-36 pb-20 gradient-primary text-white">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="max-w-4xl mx-auto text-center animate-fade-in">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
              Contáctenos
            </h1>
            <p className="text-lg md:text-xl text-white/90 leading-relaxed">
              Estamos aquí para ayudarle a transformar su empresa. 
              Envíenos un mensaje y uno de nuestros expertos se pondrá en contacto con usted.
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
                <h2 className="text-2xl font-bold mb-6">Información de Contacto</h2>
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
                          className="flex items-start gap-4 group"
                        >
                          <div className="w-12 h-12 rounded-lg gradient-primary flex items-center justify-center flex-shrink-0 group-hover:animate-float">
                            <Icon className="text-primary-foreground" size={24} />
                          </div>
                          <div>
                            <h3 className="font-semibold mb-1 group-hover:text-primary transition-colors">
                              {info.title}
                            </h3>
                            <p className="text-muted-foreground">{info.value}</p>
                          </div>
                        </a>
                      </Card>
                    );
                  })}
                </div>
              </div>

              <Card className="p-6 gradient-secondary text-white">
                <h3 className="text-xl font-semibold mb-3">Horario de Atención</h3>
                <div className="space-y-2 text-white/90">
                  <p>Lunes a Viernes: 8:00 AM - 6:00 PM</p>
                  <p>Sábados: 9:00 AM - 1:00 PM</p>
                  <p>Domingos: Cerrado</p>
                </div>
              </Card>
            </div>

            {/* Contact Form */}
            <div className="lg:col-span-2">
              <Card className="p-8 lg:p-10 animate-fade-up">
                <h2 className="text-2xl font-bold mb-6">Envíenos un Mensaje</h2>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label htmlFor="name" className="block text-sm font-medium mb-2">
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
                        className="transition-all duration-300 focus:shadow-soft"
                      />
                    </div>
                    <div>
                      <label htmlFor="email" className="block text-sm font-medium mb-2">
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
                        className="transition-all duration-300 focus:shadow-soft"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label htmlFor="phone" className="block text-sm font-medium mb-2">
                        Teléfono
                      </label>
                      <Input
                        id="phone"
                        name="phone"
                        type="tel"
                        value={formData.phone}
                        onChange={handleChange}
                        placeholder="+1 (555) 123-4567"
                        className="transition-all duration-300 focus:shadow-soft"
                      />
                    </div>
                    <div>
                      <label htmlFor="company" className="block text-sm font-medium mb-2">
                        Empresa
                      </label>
                      <Input
                        id="company"
                        name="company"
                        type="text"
                        value={formData.company}
                        onChange={handleChange}
                        placeholder="Mi Empresa S.A."
                        className="transition-all duration-300 focus:shadow-soft"
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="message" className="block text-sm font-medium mb-2">
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
                      className="transition-all duration-300 focus:shadow-soft resize-none"
                    />
                  </div>

                  <Button
                    type="submit"
                    size="lg"
                    disabled={isSubmitting}
                    className="w-full gradient-primary hover:shadow-glow transition-all duration-300 hover:scale-105 flex items-center justify-center gap-2"
                  >
                    {isSubmitting ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send size={20} />}
                    {isSubmitting ? "Enviando mensaje..." : "Enviar Mensaje"}
                  </Button>
                </form>
              </Card>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default Contactos;