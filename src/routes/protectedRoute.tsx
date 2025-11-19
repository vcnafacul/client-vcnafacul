import { DateTime } from "luxon";
import React, { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { refreshToken } from "../services/auth/refresh";
import { useAuthStore } from "../store/auth";
import { jwtDecoded } from "../utils/jwt";
import { HOME_PATH } from "./path";

interface ProtectedRouteProps {
  children: React.ReactNode;
  redirectTo?: string;
}

function ProtectedRoute({ children, redirectTo }: ProtectedRouteProps) {
  const { data, doAuth, logout } = useAuthStore();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(true);

  useEffect(() => {
    const checkAndRefreshToken = async () => {
      // Sem token, não autenticado
      if (!data.token) {
        setIsAuthenticated(false);
        return;
      }

      try {
        const decoded = jwtDecoded(data.token);
        const isExpired =
          new Date(decoded.exp * 1000) < DateTime.now().toJSDate();

        // Se o token está expirado, tenta renovar
        if (isExpired) {
          setIsRefreshing(true);

          try {
            // ✅ Refresh token vai automaticamente via cookie
            const response = await refreshToken();

            // Atualiza o store com o novo access_token
            doAuth({
              ...data,
              token: response.access_token,
            });

            setIsAuthenticated(true);
          } catch (error) {
            console.error("Erro ao renovar token:", error);
            // Falha ao renovar, faz logout
            logout();
            setIsAuthenticated(false);
          } finally {
            setIsRefreshing(false);
          }
        }
      } catch (error) {
        console.error("Erro ao verificar token:", error);
        logout();
        setIsAuthenticated(false);
      }
    };

    checkAndRefreshToken();
  }, [data.token]);

  // Mostra loading durante renovação
  if (isRefreshing) {
    return <div>Renovando sessão...</div>;
  }

  // Se não está autenticado, redireciona
  if (!isAuthenticated) {
    return <Navigate to={redirectTo || HOME_PATH} replace />;
  }

  return children;
}

export default ProtectedRoute;
