import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { LogOut, UserCircle, Menu, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/sonner";

const AdminNavbar: React.FC = () => {
  const { user, logout } = useAuth();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const navigate = useNavigate();

  const handleLogout = async () => {
    if (isLoggingOut) return;
    setIsLoggingOut(true);

    try {
      await logout();
      toast.success("Sesión cerrada correctamente.");
      navigate("/admin/login");
    } catch (err: unknown) {
      const errorMsg =
        err instanceof Error
          ? err.message
          : "No se pudo cerrar la sesión en el servidor. Por favor, reintenta.";
      toast.error("Error al cerrar sesión", {
        description: errorMsg,
      });
      // Regla de seguridad: Si logout falló, conservamos el estado local y no navegamos a login
    } finally {
      setIsLoggingOut(false);
    }
  };

  const getRoleBadge = (rol?: string) => {
    switch (rol) {
      case "admin":
        return "bg-emerald-50 text-emerald-700 border-emerald-200";
      case "editor":
        return "bg-blue-50 text-blue-700 border-blue-200";
      default:
        return "bg-slate-50 text-slate-700 border-slate-200";
    }
  };

  return (
    <header className="bg-white border-b shadow-sm h-16 flex items-center justify-between px-4 md:px-6 sticky top-0 z-10">
      <div className="flex items-center gap-3">
        <button
          className="md:hidden text-slate-500 hover:text-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-200 rounded p-1"
          aria-label="Abrir menú"
        >
          <Menu className="h-6 w-6" />
        </button>
        <h1 className="font-semibold text-slate-800 hidden sm:block text-lg">Panel administrativo</h1>
      </div>

      <div className="flex items-center gap-4">
        <div className="hidden sm:flex items-center gap-2 text-sm text-slate-600 font-medium">
          <UserCircle className="h-5 w-5 text-[#0e7734]" />
          <span>{user?.nombre || "Administrador"}</span>
          {user?.rol && (
            <span
              className={`text-[11px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full border ${getRoleBadge(
                user.rol
              )}`}
            >
              {user.rol}
            </span>
          )}
        </div>
        <div className="h-6 w-px bg-slate-200 hidden sm:block mx-1"></div>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleLogout}
          disabled={isLoggingOut}
          className="text-[#e84e1b] hover:text-[#e84e1b] hover:bg-[#e84e1b]/10 transition-colors"
        >
          {isLoggingOut ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Cerrando...
            </>
          ) : (
            <>
              <LogOut className="h-4 w-4 mr-2" />
              Cerrar sesión
            </>
          )}
        </Button>
      </div>
    </header>
  );
};

export default AdminNavbar;
