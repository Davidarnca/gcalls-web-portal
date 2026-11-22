import React from "react";
import { NavLink } from "react-router-dom";
import { LayoutDashboard, Users, PenSquare, Briefcase, FileText } from "lucide-react";

interface NavItem {
  name: string;
  icon: React.ComponentType<{ className?: string }>;
  to?: string;
  end?: boolean;
  disabled?: boolean;
}

const AdminSidebar: React.FC = () => {
  const navItems: NavItem[] = [
    { name: "Dashboard", icon: LayoutDashboard, to: "/admin", end: true },
    { name: "Contactos", icon: Users, to: "/admin/contactos" },
    { name: "Contenidos", icon: PenSquare, to: "/admin/contenidos" },
    { name: "Servicios", icon: Briefcase, disabled: true },
    { name: "Cotizaciones", icon: FileText, disabled: true },
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

          if (item.disabled || !item.to) {
            return (
              <button
                key={item.name}
                disabled
                className="w-full flex items-center justify-between px-4 py-3 rounded-md text-left text-white/40 cursor-not-allowed transition-colors"
              >
                <div className="flex items-center gap-3">
                  <Icon className="h-5 w-5 flex-shrink-0" />
                  <span className="font-medium">{item.name}</span>
                </div>
                <span className="text-[10px] uppercase tracking-wider px-1.5 py-0.5 rounded bg-white/5 border border-white/10 text-white/40 font-semibold">
                  Próximamente
                </span>
              </button>
            );
          }

          return (
            <NavLink
              key={item.name}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                `w-full flex items-center gap-3 px-4 py-3 rounded-md text-left transition-colors focus:outline-none focus:ring-2 focus:ring-white/20 ${
                  isActive
                    ? "bg-white/20 text-white font-semibold shadow-sm"
                    : "text-white/80 hover:bg-white/10 hover:text-white"
                }`
              }
            >
              <Icon className="h-5 w-5 flex-shrink-0" />
              <span className="font-medium">{item.name}</span>
            </NavLink>
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
