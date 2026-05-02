import queryString from "query-string";
import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { DASH } from "../../routes/path";
import { useAuthStore } from "../../store/auth";
import { decoderUser } from "../../utils/decodedUser";

export function AuthCallbackPage() {
  const location = useLocation();
  const { doAuth } = useAuthStore();
  const navigate = useNavigate();

  useEffect(() => {
    const token = (queryString.parse(location.search).token as string) || "";
    if (!token) {
      toast.error("Falha na autenticação com Google");
      navigate("/login");
      return;
    }
    try {
      const authData = decoderUser(token);
      doAuth(authData);
      window.history.replaceState({}, document.title, window.location.pathname);
      navigate(DASH);
    } catch {
      toast.error("Token inválido");
      navigate("/login");
    }
  }, []);

  return <></>;
}
