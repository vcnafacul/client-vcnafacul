import { caminhoInterno } from "@/services/push/caminho";
import { listenForeground, syncPushToken } from "@/services/push/push";
import { useAuthStore } from "@/store/auth";
import { jwtDecoded } from "@/utils/jwt";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

function idDoUsuario(token: string): string | null {
  try {
    return jwtDecoded(token)?.user?.id ?? null;
  } catch {
    return null;
  }
}

/**
 * Push com o usuário logado (série `pwa-push`, FE-03). Não desenha nada.
 *
 * - Ao logar (ou abrir o app logado): reenvia o token ao backend.
 * - Com o app aberto e visível, o SW não mostra a notificação — o SDK a
 *   entrega para a página, e aqui ela vira um toast.
 */
export function PushSync() {
  const token = useAuthStore((s) => s.data.token);
  const navigate = useNavigate();

  useEffect(() => {
    const userId = token ? idDoUsuario(token) : null;
    if (!token || !userId) return;
    void syncPushToken(token, userId);
  }, [token]);

  useEffect(() => {
    if (!token) return;
    let parar: (() => void) | undefined;
    let desmontado = false;
    void listenForeground((m) => {
      const caminho = caminhoInterno(m.url);
      toast.info(
        [m.title, m.body].filter(Boolean).join(" — ") || "Nova notificação",
        { onClick: caminho ? () => navigate(caminho) : undefined },
      );
    }).then((unsubscribe) => {
      if (desmontado) unsubscribe();
      else parar = unsubscribe;
    });
    return () => {
      desmontado = true;
      parar?.();
    };
  }, [token, navigate]);

  return null;
}
