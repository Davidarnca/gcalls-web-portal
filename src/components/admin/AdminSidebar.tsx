import React from "react";
import { LayoutDashboard, Users, Briefcase, FileText } from "lucide-react";

const AdminSidebar: React.FC = () => {
  const navItems = [
    { name: "Dashboard", icon: LayoutDashboard },
    { name: "Contactos", icon: Users },
    { name: "Servicios", icon: Briefcase },
    { name: "Cotizaciones", icon: FileText },
  ];

  return (
    <aside className="w-64 bg-[#2b358e] text-white flex-col hidden md:flex flex-shrink-0 min-h-screen">
      <div className="p-6 border-b border-white/10">
        <h2 className="text-2xl font-bold text-white tracking-wide">G-Calls</h2>
        <p className="text-sm text-white/70 mt-1 font-medium">Panel administrativo</p>
      </div>

      <nav className="flex-1 py-6 px-4 space-y-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.name}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-md text-left text-white/90 hover:bg-white/10 hover:text-white transition-colors focus:outline-none focus:ring-2 focus:ring-white/20"
            >
              <Icon className="h-5 w-5" />
              <span className="font-medium">{item.name}</span>
            </button>
          );
        })}
      </nav>

      <div className="p-4 border-t border-white/10 text-center">
        <p className="text-xs text-white/50">G-Calls S.A.S &copy; 2026</p>
      </div>
    </aside>
  );
};

export default AdminSidebar;
