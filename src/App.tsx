import { Toaster } from "@/components/ui/toaster";
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
import GestionAmbiental from "./pages/servicios/GestionAmbiental";
import TalentoHumano from "./pages/servicios/TalentoHumano";
import GestionSocial from "./pages/servicios/GestionSocial";
import AsesoriaLegal from "./pages/servicios/AsesoriaLegal";

// Componente de mantenimiento
const Mantenimiento = () => (
  <div style={{
    width: '100vw',
    minHeight: '100vh',
    backgroundColor: '#0a111e',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    padding: '20px',
    margin: 0,
    boxSizing: 'border-box'
  }}>
    <img 
      src="/mantenimiento-gcalls.png" 
      alt="G-Calls S.A.S. - Sitio en Mantenimiento" 
      style={{
        maxWidth: '100%',
        maxHeight: '90vh',
        objectFit: 'contain',
        borderRadius: '12px'
      }}
    />
  </div>
);

// Cambia a true para activar mantenimiento en producción
const IS_MAINTENANCE_MODE = true; 

const queryClient = new QueryClient();

const App = () => {
  // Al dejar solo IS_MAINTENANCE_MODE en true, forzamos la vista
  // tanto en local como en producción de forma 100% infalible.
  if (IS_MAINTENANCE_MODE) {
    return <Mantenimiento />;
  }

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
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
              <Route path="/servicios/gestion-ambiental-seguridad-salud" element={<GestionAmbiental />} />
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