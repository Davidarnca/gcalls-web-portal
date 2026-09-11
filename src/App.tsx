import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import ScrollToTop from "./components/ScrollToTop";
import Layout from "./components/Layout";

import Index from "./pages/Index";
import Decalogo from "./pages/Decalogo";
import QuienesSomos from "./pages/QuienesSomos";
import NuestroEquipo from "./pages/NuestroEquipo";
import NuestrosMercados from "./pages/NuestrosMercados";
import QueGestionamos from "./pages/QueGestionamos";
import Contactos from "./pages/Contactos";
import NotFound from "./pages/NotFound";
import SupplyChain from "./pages/servicios/SupplyChain";
import GestionAmbientalEsg from "./pages/servicios/GestionAmbientalEsg";
import TalentoHumano from "./pages/servicios/TalentoHumano";
import GestionSocial from "./pages/servicios/GestionSocial";
import AsesoriaLegal from "./pages/servicios/AsesoriaLegal";
import Sst from "./pages/servicios/Sst";

import Mantenimiento from "./components/Mantenimiento";

// Evaluación segura del flag de mantenimiento con fallback defensivo
// Si rawMaintenanceEnv no está definido o es "true", se considera en mantenimiento.
// Solo se desactiva si explícitamente es "false".
const rawMaintenanceEnv = import.meta.env.VITE_MAINTENANCE_MODE;
const IS_MAINTENANCE_MODE = rawMaintenanceEnv !== "false";

const queryClient = new QueryClient();

const App = () => {
  const isLocalDev = import.meta.env.DEV;

  // Si está en modo mantenimiento y NO es entorno de desarrollo local, muestra la pantalla de mantenimiento
  if (IS_MAINTENANCE_MODE && !isLocalDev) {
    return <Mantenimiento />;
  }

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Sonner />
        <BrowserRouter>
          <ScrollToTop />
          <Layout>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/decalogo" element={<Decalogo />} />
              <Route path="/quienes-somos" element={<QuienesSomos />} />
              <Route path="/nuestro-equipo" element={<NuestroEquipo />} />
              <Route path="/nuestros-mercados" element={<NuestrosMercados />} />
              <Route path="/que-gestionamos" element={<QueGestionamos />} />
              <Route path="/servicios/supply-chain-management" element={<SupplyChain />} />
              <Route path="/servicios/gestion-ambiental-sostenibilidad" element={<GestionAmbientalEsg />} />
              <Route path="/servicios/seguridad-salud-trabajo" element={<Sst />} />
              <Route path="/servicios/gestion-talento-humano" element={<TalentoHumano />} />
              <Route path="/servicios/gestion-social-rse" element={<GestionSocial />} />
              <Route path="/servicios/asesoria-legal" element={<AsesoriaLegal />} />
              <Route path="/contactos" element={<Contactos />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Layout>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;