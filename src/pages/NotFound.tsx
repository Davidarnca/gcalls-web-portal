import { Link, useLocation } from "react-router-dom";
import { useEffect } from "react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.warn("404: ruta inexistente o servicio no disponible:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100 px-4">
      <div className="text-center">
        <h1 className="mb-4 text-4xl font-bold">404</h1>
        <p className="mb-6 text-xl text-gray-600">La página que buscas no existe o ya no está disponible.</p>
        <Link to="/" className="text-blue-600 underline hover:text-blue-800">
          Volver al inicio
        </Link>
      </div>
    </div>
  );
};

export default NotFound;
