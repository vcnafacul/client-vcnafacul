import { useNavigate } from "react-router-dom";
import { HOME_PATH } from "../../routes/path";
import { useAuthStore } from "../../store/auth";
import { useEffect } from "react";
import { logoutService } from "../../services/auth/logout";

function Logout() {
  const navigate = useNavigate();
  const { data, logout } = useAuthStore();

  useEffect(() => {
    const performLogout = async () => {
      // Tenta fazer logout no backend
      try {
        if (data.refresh_token) {
          await logoutService(data.refresh_token);
        }
      } catch (error) {
        console.error("Erro ao fazer logout no servidor:", error);
        // Continua o logout local mesmo com erro
      } finally {
        // Limpa o store local
        logout();
        navigate(HOME_PATH);
      }
    };

    performLogout();
  }, []);

  return <></>;
}

export default Logout;