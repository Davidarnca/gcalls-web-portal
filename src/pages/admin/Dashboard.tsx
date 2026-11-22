import React from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, FileText, Briefcase, LogOut } from "lucide-react";

const Dashboard = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/admin/login");
  };

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Encabezado */}
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-lg shadow-sm border">
          <div>
            <h1 className="text-3xl font-bold text-[#2b358e]">Dashboard</h1>
            <p className="text-muted-foreground mt-1">Bienvenido al panel administrativo de G-Calls.</p>
          </div>
          <Button
            variant="outline"
            onClick={handleLogout}
            className="text-[#e84e1b] border-[#e84e1b] hover:bg-[#e84e1b]/10 transition-colors"
          >
            <LogOut className="mr-2 h-4 w-4" />
            Cerrar sesión
          </Button>
        </header>

        {/* Descripción */}
        <section className="bg-white p-6 rounded-lg shadow-sm border">
          <p className="text-slate-600">
            Desde este panel podrás gestionar posteriormente los contenidos, usuarios y procesos administrativos
            de la plataforma. Por ahora, las siguientes secciones se encuentran en construcción.
          </p>
        </section>

        {/* Tarjetas de Resumen (Mocks) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="border-t-4 border-t-[#0e7734] shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-slate-600">Contactos</CardTitle>
              <Users className="h-4 w-4 text-[#0e7734]" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-slate-400">--</div>
              <p className="text-xs text-muted-foreground mt-1">Próximamente</p>
            </CardContent>
          </Card>

          <Card className="border-t-4 border-t-[#2b358e] shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-slate-600">Servicios</CardTitle>
              <Briefcase className="h-4 w-4 text-[#2b358e]" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-slate-400">--</div>
              <p className="text-xs text-muted-foreground mt-1">Próximamente</p>
            </CardContent>
          </Card>

          <Card className="border-t-4 border-t-[#e84e1b] shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-slate-600">Cotizaciones</CardTitle>
              <FileText className="h-4 w-4 text-[#e84e1b]" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-slate-400">--</div>
              <p className="text-xs text-muted-foreground mt-1">Próximamente</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
