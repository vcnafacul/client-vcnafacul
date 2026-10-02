import {
  aoSair,
  desativarAoSair,
  temDesativacaoPendente,
} from "@/services/push/aoSair";
import { caminhoInterno } from "@/services/push/caminho";
import {
  listenForeground,
  mostrarEmPrimeiroPlano,
  syncPushToken,
} from "@/services/push/push";
import { MSG_ATUALIZAR_CENTRAL } from "@/pwa/notificacao";
import { useAuthStore } from "@/store/auth";
import { useCentralStore } from "@/store/notificacoes";
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
 * - Ao sair: desativa o push neste aparelho (FE-05, ver `aoSair`).
 * - Com o app aberto e visível, o SW não mostra a notificação — o SDK a
 *   entrega para a página, e aqui ela vai para a barra do aparelho do mesmo
 *   jeito (toast só se o navegador recusar).
 * - Central de notificações (central-notificacoes, card 04): recarrega quando
 *   chega push com o app aberto, quando o SW avisa (push em segundo plano ou
 *   clique na notificação) e ao voltar para o app (no máximo a cada 30s).
 *   Sem polling: quem não tem push vê ao abrir ou voltar.
 */
export function PushSync() {
  const token = useAuthStore((s) => s.data.token);
  const navigate = useNavigate();

  // Logout (FE-05): termina o que uma navegação interrompeu e observa a
  // transição token → vazio, venha de onde vier.
  useEffect(() => {
    if (temDesativacaoPendente()) void desativarAoSair();
    return useAuthStore.subscribe((agora, antes) => {
      if (antes.data.token && !agora.data.token) aoSair();
    });
  }, []);

  useEffect(() => {
    const userId = token ? idDoUsuario(token) : null;
    if (!token || !userId) return;
    void syncPushToken(token, userId);
    // Voltou para o app (ex.: das configurações do celular): reenvia o token.
    const aoVoltar = () => {
      if (document.visibilityState !== "visible") return;
      void syncPushToken(token, userId, { aoVoltar: true });
      useCentralStore
        .getState()
        .carregarSeVelha(token)
        .catch(() => undefined);
    };
    document.addEventListener("visibilitychange", aoVoltar);
    return () => document.removeEventListener("visibilitychange", aoVoltar);
  }, [token]);

  // O SW avisa: chegou push com o app em segundo plano, ou clicaram nela.
  useEffect(() => {
    const sw = navigator.serviceWorker;
    if (!token || !sw) return;
    const aoAvisar = (e: MessageEvent) => {
      if (e.data?.tipo === MSG_ATUALIZAR_CENTRAL)
        useCentralStore
          .getState()
          .carregar(token)
          .catch(() => undefined);
    };
    sw.addEventListener("message", aoAvisar);
    return () => sw.removeEventListener("message", aoAvisar);
  }, [token]);

  useEffect(() => {
    if (!token) return;
    let parar: (() => void) | undefined;
    let desmontado = false;
    void listenForeground((m) => {
      useCentralStore
        .getState()
        .carregar(token)
        .catch(() => undefined);
      mostrarEmPrimeiroPlano(m).catch(() => {
        const caminho = caminhoInterno(m.url);
        toast.info(
          [m.title, m.body].filter(Boolean).join(" — ") || "Nova notificação",
          { onClick: caminho ? () => navigate(caminho) : undefined },
        );
      });
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
