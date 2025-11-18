import { useAuthStore } from "../store/auth";
import Login from "../services/auth/login";
import { logoutService, logoutAllService } from "../services/auth/logout";
import { useNavigate } from "react-router-dom";
import { HOME_PATH } from "../routes/path";

/**
 * Hook customizado para gerenciar autenticação
 * Fornece métodos para login, logout e acesso aos dados do usuário
 */
export const useAuth = () => {
  const { data, doAuth, logout: clearAuth } = useAuthStore();
  const navigate = useNavigate();

  /**
   * Faz login do usuário
   * @param email - Email do usuário
   * @param password - Senha do usuário
   */
  const login = async (email: string, password: string) => {
    const authData = await Login(email, password);
    doAuth(authData);
    return authData;
  };

  /**
   * Faz logout do usuário no dispositivo atual
   * Revoga o refresh token no backend
   */
  const logout = async () => {
    try {
      if (data.refresh_token) {
        await logoutService(data.refresh_token);
      }
    } catch (error) {
      console.error("Erro ao fazer logout no servidor:", error);
    } finally {
      clearAuth();
      navigate(HOME_PATH);
    }
  };

  /**
   * Faz logout do usuário em todos os dispositivos
   * Revoga todos os refresh tokens no backend
   */
  const logoutAll = async () => {
    try {
      if (data.token) {
        await logoutAllService(data.token);
      }
    } catch (error) {
      console.error("Erro ao fazer logout de todos dispositivos:", error);
      throw error;
    } finally {
      clearAuth();
      navigate(HOME_PATH);
    }
  };

  /**
   * Verifica se o usuário está autenticado
   */
  const isAuthenticated = () => {
    return !!data.token;
  };

  return {
    user: data.user,
    token: data.token,
    refresh_token: data.refresh_token,
    permissao: data.permissao,
    login,
    logout,
    logoutAll,
    isAuthenticated,
  };
};

