import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,

    proxy: {
      // Redirige todas las peticiones /api/* al servidor PHP local.
      // Comando de arranque PHP sugerido (desde la raíz del proyecto):
      //   php -S localhost:8000 -t public/api
      //
      // Si cambias el puerto, actualiza `PHP_PORT` en tu `.env` y
      // ajusta el target aquí o usa: target: process.env.PHP_PORT ?? 'http://localhost:8000'
      "/api": {
        target: "http://localhost:8000",

        // Reescribe la ruta: /api/contactos.php → /contactos.php
        // PHP sirve los archivos desde public/api/ como raíz,
        // así que el prefijo /api debe eliminarse antes de forwarded.
        rewrite: (path) => path.replace(/^\/api/, ""),

        // changeOrigin ajusta el header `Host` de la petición reenviada
        // para evitar rechazos del servidor PHP por host inesperado.
        changeOrigin: true,
      },
    },
  },
  plugins: [react(), mode === "development" && componentTagger()].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
