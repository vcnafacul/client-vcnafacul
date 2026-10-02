import { useCallback } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useChatContext } from "@/context/ChatProvider";
import { PARAMETRO_CONVERSA } from "@/hooks/useConversaDoLink";
import { nomeDoDestino } from "@/services/chat/conversasDoEstudante";
import { linkDaConversa } from "@/services/chat/linkDaConversa";
import type { ConversationDoc } from "@/services/firebase/conversations";
import { useChatStore } from "@/store/chatStore";

/** Uma linha do bloco "Conversas" no sino (tickets/031, card 06). */
export type ConversaNoSino = {
  id: string;
  titulo: string;
  subtitulo: string | null;
  trecho: string | null;
  naoLidas: number;
  quando: number | null;
};

const recentesPrimeiro = (a: ConversaNoSino, b: ConversaNoSino) =>
  (b.quando ?? 0) - (a.quando ?? 0);

/** Estudante: só as conversas com mensagem nova para ele. */
export function conversasDoEstudanteNoSino(
  conversas: ConversationDoc[],
): ConversaNoSino[] {
  return conversas
    .filter((c) => (c.unreadCountStudent ?? 0) > 0)
    .map((c) => ({
      id: c.id,
      titulo: nomeDoDestino(c),
      subtitulo: null,
      trecho: c.lastMessageText ?? null,
      naoLidas: c.unreadCountStudent,
      quando: c.lastMessageAt?.toMillis?.() ?? null,
    }))
    .sort(recentesPrimeiro);
}

/** Suporte/colaborador: as da inbox dele com mensagem nova do estudante. */
export function conversasDoSuporteNoSino(
  conversas: ConversationDoc[],
): ConversaNoSino[] {
  return conversas
    .filter((c) => (c.unreadCountSupport ?? 0) > 0)
    .map((c) => ({
      id: c.id,
      titulo: c.userName,
      subtitulo: c.cursinhoName || c.originLabel || null,
      trecho: c.lastMessageText ?? null,
      naoLidas: c.unreadCountSupport,
      quando: c.lastMessageAt?.toMillis?.() ?? null,
    }))
    .sort(recentesPrimeiro);
}

/**
 * As conversas com mensagem nova para quem está logado, e como abrir uma.
 *
 * - Estudante: abre o balão na conversa SEM sair da página (o `?conversa=` no
 *   endereço atual — o balão está em todas).
 * - Suporte/colaborador: vai para a inbox com a conversa selecionada.
 *
 * Nada vem do MySQL: é o Firestore, em tempo real. Ler a conversa zera o
 * contador e a linha sai do sino sozinha.
 */
export function useConversasNoSino() {
  const { role } = useChatContext();
  const doEstudante = useChatStore((s) => s.conversations);
  const doSuporte = useChatStore((s) => s.inboxDoSuporte);
  const doCursinho = useChatStore((s) => s.inboxDoCursinho);
  const navigate = useNavigate();
  const { pathname, search } = useLocation();

  const conversas =
    role === "student"
      ? conversasDoEstudanteNoSino(doEstudante)
      : role === "support_agent"
        ? conversasDoSuporteNoSino(doSuporte)
        : [];

  const abrir = useCallback(
    (id: string) => {
      if (role === "student") {
        // Mantém os outros parâmetros da página.
        const params = new URLSearchParams(search);
        params.set(PARAMETRO_CONVERSA, id);
        navigate({ pathname, search: `?${params.toString()}` });
        return;
      }
      navigate(linkDaConversa(id, doCursinho ? "suporte-cursinho" : "suporte"));
    },
    [role, navigate, pathname, search, doCursinho],
  );

  return { conversas, abrir };
}
