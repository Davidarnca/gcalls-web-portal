import React, { createContext, useContext, useState, ReactNode, useEffect, useCallback } from "react";
import type { AuthUser, AuthResponse, LogoutResponse } from "@/types/api";

export interface AuthContextType {
  isAuthenticated: boolean;
  isInitializing: boolean;
  user: AuthUser | null;
  csrfToken: string | null;
  networkError: string | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  clearNetworkError: () => void;
  checkSession: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isInitializing, setIsInitializing] = useState<boolean>(true);
  const [user, setUser] = useState<AuthUser | null>(null);
  const [csrfToken, setCsrfToken] = useState<string | null>(null);
  const [networkError, setNetworkError] = useState<string | null>(null);

  const clearNetworkError = useCallback(() => {
    setNetworkError(null);
  }, []);

  /**
   * Consulta el estado de la sesión activa en el servidor PHP vía GET /api/auth/me.php.
   * - 200 OK: Restaura datos de usuario y csrf_token; isAuthenticated = true.
   * - 401 Unauthorized: Sesión ausente o expirada; isAuthenticated = false, limpia usuario.
   * - Error de red (TypeError / 502 / 503 / 504): NO destruye una sesión activa existente por fallo transitorio.
   */
  const checkSession = useCallback(async (): Promise<void> => {
    try {
      const response = await fetch("/api/auth/me.php", {
        method: "GET",
        headers: {
          Accept: "application/json",
        },
        credentials: "include",
      });

      if (response.status === 401) {
        // Sesión inexistente o expirada en el servidor (caso normal cuando no se ha iniciado sesión)
        setIsAuthenticated(false);
        setUser(null);
        setCsrfToken(null);
        setNetworkError(null);
        return;
      }

      if (!response.ok) {
        // Errores de servidor tipo 500, 502, 503, 504
        const errorText = `Error de conexión con el servidor de autenticación (${response.status}).`;
        setNetworkError(errorText);
        return;
      }

      let data: AuthResponse;
      try {
        data = await response.json();
      } catch {
        setNetworkError("Respuesta no válida del servidor de autenticación.");
        return;
      }

      if (data.success && data.data?.user) {
        setUser(data.data.user);
        setCsrfToken(data.data.csrf_token ?? null);
        setIsAuthenticated(true);
        setNetworkError(null);
      } else {
        setIsAuthenticated(false);
        setUser(null);
        setCsrfToken(null);
      }
    } catch (err: unknown) {
      // Error de red / backend desconectado / fallo de fetch
      const msg = err instanceof Error ? err.message : "No fue posible conectar con el servidor.";
      setNetworkError(msg);
      // No destruimos isAuthenticated si el usuario ya estaba validado en memoria.
    } finally {
      setIsInitializing(false);
    }
  }, []);

  useEffect(() => {
    checkSession();
  }, [checkSession]);

  /**
   * Inicia sesión contra POST /api/auth/login.php.
   * No guarda contraseñas ni tokens en localStorage: la sesión se gestiona con cookie HttpOnly.
   */
  const login = async (email: string, password: string): Promise<void> => {
    let response: Response;
    try {
      response = await fetch("/api/auth/login.php", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ email, password }),
      });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Error de red al conectar con el servidor.";
      throw new Error(`Fallo de conexión: ${msg}`);
    }

    let data: AuthResponse;
    try {
      data = await response.json();
    } catch {
      throw new Error(`Respuesta no válida del servidor (${response.status}).`);
    }

    if (!response.ok || !data.success) {
      const errorMsg = data.message || `Error al iniciar sesión (${response.status}).`;
      throw new Error(errorMsg);
    }

    if (!data.data?.user) {
      throw new Error("Formato de respuesta incompleto del servidor de autenticación.");
    }

    // Actualización de estado en memoria exclusivamente
    setUser(data.data.user);
    setCsrfToken(data.data.csrf_token ?? null);
    setIsAuthenticated(true);
    setNetworkError(null);
  };

  /**
   * Cierra la sesión en el servidor vía POST /api/auth/logout.php.
   * Regla de seguridad: Solo declara el cierre exitoso y limpia el estado local
   * si response.ok es true y data.success === true.
   * Si falla, conserva el estado y lanza un error para permitir reintentar.
   */
  const logout = async (): Promise<void> => {
    // Guarda previa: no despachar la petición si no hay token CSRF en memoria
    if (!csrfToken) {
      throw new Error("No hay un token CSRF disponible para cerrar la sesión.");
    }

    let response: Response;
    try {
      const headers: Record<string, string> = {
        Accept: "application/json",
        "X-CSRF-Token": csrfToken,
      };

      response = await fetch("/api/auth/logout.php", {
        method: "POST",
        headers,
        credentials: "include",
      });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Error de red al intentar cerrar sesión.";
      throw new Error(`No se pudo comunicar con el servidor para cerrar sesión: ${msg}`);
    }

    let data: LogoutResponse;
    try {
      data = await response.json();
    } catch {
      throw new Error(`El servidor devolvió una respuesta no válida al cerrar sesión (${response.status}).`);
    }

    if (!response.ok || !data.success) {
      const errorMsg = data.message || `No se pudo cerrar la sesión en el servidor (${response.status}).`;
      throw new Error(errorMsg);
    }

    // Confirmación exitosa del servidor: limpiar estado en memoria
    setUser(null);
    setCsrfToken(null);
    setIsAuthenticated(false);
    setNetworkError(null);
  };

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        isInitializing,
        user,
        csrfToken,
        networkError,
        login,
        logout,
        clearNetworkError,
        checkSession,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth debe usarse dentro de un AuthProvider");
  }
  return context;
};
