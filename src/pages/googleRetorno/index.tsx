import { DASH, LOGIN_PATH } from "@/routes/path";
import { refreshToken } from "@/services/auth/refresh";
import { useAuthStore } from "@/store/auth";
import { decoderUser } from "@/utils/decodedUser";
import { useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";

/**
 * Volta do Google (card 03 de `login-com-google`): `/auth/google?voltar=…`.
 *
 * ⚠️ **Nenhum token na URL** — a api já gravou o cookie `refresh_token`; aqui
 * ele é trocado por um access token, como o `fetchWrapper` faz quando o
 * access token vence.
 */
function GoogleRetorno() {
  const location = useLocation();
  const navigate = useNavigate();
  const { doAuth } = useAuthStore();
  // StrictMode monta duas vezes: dois refreshes em paralelo, o segundo com
  // o cookie que o primeiro já trocou
  const jaFoi = useRef(false);

  useEffect(() => {
    if (jaFoi.current) return;
    jaFoi.current = true;
    const voltar = new URLSearchParams(location.search).get("voltar");
    refreshToken()
      .then(({ access_token }) => {
        doAuth(decoderUser(access_token));
        navigate(voltar?.startsWith("/") && !voltar.startsWith("//") ? voltar : DASH, {
          replace: true,
        });
      })
      .catch(() => navigate(`${LOGIN_PATH}?erro=google`, { replace: true }));
  }, [location.search, navigate, doAuth]);

  return (
    <p className="mt-20 text-center text-grey" role="status">
      Entrando…
    </p>
  );
}

export default GoogleRetorno;
