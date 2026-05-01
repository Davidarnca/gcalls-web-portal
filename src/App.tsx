import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import ScrollToTop from "./components/ScrollToTop";
import Index from "./pages/Index";
import Decalogo from "./pages/Decalogo";
import QuienesSomos from "./pages/QuienesSomos";
import NuestroEquipo from "./pages/NuestroEquipo";
import NuestrosMercados from "./pages/NuestrosMercados";
import QueGestionamos from "./pages/QueGestionamos";
import Contactos from "./pages/Contactos";
import NotFound from "./pages/NotFound";
import SupplyChain from "./pages/servicios/SupplyChain";
import GestionAmbiental from "./pages/servicios/GestionAmbiental";
import TalentoHumano from "./pages/servicios/TalentoHumano";
import GestionSocial from "./pages/servicios/GestionSocial";
import AsesoriaLegal from "./pages/servicios/AsesoriaLegal";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <ScrollToTop />
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/decalogo" element={<Decalogo />} />
          <Route path="/quienes-somos" element={<QuienesSomos />} />
          <Route path="/nuestro-equipo" element={<NuestroEquipo />} />
          <Route path="/nuestros-mercados" element={<NuestrosMercados />} />
          <Route path="/que-gestionamos" element={<QueGestionamos />} />
          <Route path="/servicios/supply-chain-management" element={<SupplyChain />} />
          <Route path="/servicios/gestion-ambiental-seguridad-salud" element={<GestionAmbiental />} />
          <Route path="/servicios/gestion-talento-humano" element={<TalentoHumano />} />
          <Route path="/servicios/gestion-social-rse" element={<GestionSocial />} />
          <Route path="/servicios/asesoria-legal" element={<AsesoriaLegal />} />
          <Route path="/contactos" element={<Contactos />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
