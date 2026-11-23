import React from "react";
import { NavLink } from "react-router-dom";

const PESTAÑAS = [
  { nombre: "Datos de contacto y redes", ruta: "/admin/contenidos", end: true },
  { nombre: "Página de inicio", ruta: "/admin/contenidos/inicio", end: false },
  { nombre: "Nuestro Equipo", ruta: "/admin/contenidos/equipo", end: false },
  { nombre: "Identidad", ruta: "/admin/contenidos/identidad", end: false },
];

/** Navegación entre las secciones editables del CMS. */
const ContenidosTabs: React.FC = () => (
  <nav aria-label="Secciones de contenido" className="flex flex-wrap gap-2">
    {PESTAÑAS.map((p) => (
      <NavLink
        key={p.ruta}
        to={p.ruta}
        end={p.end}
        className={({ isActive }) =>
          `px-4 py-2 rounded-full text-sm font-medium border transition-colors ${
            isActive
              ? "bg-[#2b358e] text-white border-[#2b358e]"
              : "bg-white text-slate-600 border-slate-200 hover:border-[#2b358e] hover:text-[#2b358e]"
          }`
        }
      >
        {p.nombre}
      </NavLink>
    ))}
  </nav>
);

export default ContenidosTabs;
