import React, { createContext, useContext, useState, ReactNode, useEffect } from "react";

export interface AuthContextType {
  isAuthenticated: boolean;
  isInitializing: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isInitializing, setIsInitializing] = useState<boolean>(true);

  useEffect(() => {
    const token = localStorage.getItem("gcalls_admin_token");
    if (token) {
      setIsAuthenticated(true);
    }
    setIsInitializing(false);
  }, []);

  const login = async (email: string, password: string): Promise<void> => {
    // AutenticaciÃ³n simulada temporal
    if (email === "admin@gcalls.com" && password === "admin123") {
      setIsAuthenticated(true);
      // Solo guardamos un flag simulado, NUNCA la contraseÃ±a real
      localStorage.setItem("gcalls_admin_token", "mock_simulated_token_123");
    } else {
      throw new Error("Credenciales invÃ¡lidas");
    }
  };

  const logout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem("gcalls_admin_token");
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, isInitializing, login, logout }}>
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
