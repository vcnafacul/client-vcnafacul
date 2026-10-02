import {
  CHAT_COOLDOWN_MS,
  type ConversationDoc,
} from "@/services/firebase/conversations";

/**
 * Regras das conversas do estudante (tickets/031, card 03), sem nada de
 * Firestore: o estudante pode ter uma conversa aberta POR DESTINO — o projeto
 * (`partnerPrepId` nulo) e cada cursinho.
 */

/** Encerradas aparecem por 7 dias — o mesmo TTL das mensagens (R5). */
export const ENCERRADAS_VISIVEIS_MS = 7 * 24 * 60 * 60 * 1000;

/** `null` = projeto. Documento antigo sem o campo também é do projeto. */
export const destinoDa = (c: Pick<ConversationDoc, "partnerPrepId">) =>
  c.partnerPrepId ?? null;

const instante = (c: ConversationDoc) =>
  c.closedAt?.toMillis?.() ?? c.lastMessageAt?.toMillis?.() ?? 0;

/**
 * As que entram na lista: abertas (todas) e encerradas há até 7 dias.
 * Ordem: abertas primeiro; dentro de cada grupo, a mais recente em cima.
 */
export function conversasVisiveis(
  todas: ConversationDoc[],
  agora: number = Date.now(),
): ConversationDoc[] {
  const recente = (c: ConversationDoc) =>
    c.status === "open" || agora - instante(c) <= ENCERRADAS_VISIVEIS_MS;
  const ultimaMensagem = (c: ConversationDoc) =>
    c.lastMessageAt?.toMillis?.() ?? 0;
  return todas.filter(recente).sort((a, b) => {
    if (a.status !== b.status) return a.status === "open" ? -1 : 1;
    return ultimaMensagem(b) - ultimaMensagem(a);
  });
}

export function conversaAbertaDoDestino(
  conversas: ConversationDoc[],
  partnerPrepId: string | null,
): ConversationDoc | null {
  return (
    conversas.find(
      (c) => c.status === "open" && destinoDa(c) === partnerPrepId,
    ) ?? null
  );
}

/**
 * Até quando o estudante espera para abrir de novo com este destino (15 min
 * depois da última encerrada). `null` = pode abrir. Um destino não bloqueia
 * o outro.
 */
export function cooldownDoDestino(
  conversas: ConversationDoc[],
  partnerPrepId: string | null,
  agora: number = Date.now(),
): number | null {
  const fechadas = conversas
    .filter((c) => c.status === "closed" && destinoDa(c) === partnerPrepId)
    .map((c) => c.closedAt?.toMillis?.() ?? null)
    .filter((t): t is number => t !== null);
  if (fechadas.length === 0) return null;
  const ate = Math.max(...fechadas) + CHAT_COOLDOWN_MS;
  return ate > agora ? ate : null;
}

export const naoLidasDoEstudante = (conversas: ConversationDoc[]) =>
  conversas.reduce((soma, c) => soma + (c.unreadCountStudent ?? 0), 0);

/** O rótulo do destino na tela. */
export const nomeDoDestino = (c: ConversationDoc) =>
  destinoDa(c) === null
    ? "Suporte Você na Facul"
    : c.cursinhoName || "Cursinho";
