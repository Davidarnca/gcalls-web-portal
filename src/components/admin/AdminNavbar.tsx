import React from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { LogOut, UserCircle, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";

const AdminNavbar: React.FC = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/admin/login");
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
          <span>Administrador</span>
        </div>
        <div className="h-6 w-px bg-slate-200 hidden sm:block mx-1"></div>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleLogout}
          className="text-[#e84e1b] hover:text-[#e84e1b] hover:bg-[#e84e1b]/10 transition-colors"
        >
          <LogOut className="h-4 w-4 mr-2" />
          Cerrar sesión
        </Button>
      </div>
    </header>
  );
};

export default AdminNavbar;
