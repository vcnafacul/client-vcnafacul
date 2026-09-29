import { DonoDaProva } from "@/dtos/prova/donoDaProva";

/**
 * Selo e travas da composição no banco de questões (tickets/023, card 08).
 *
 * ⚠️ O front NÃO decide — só reflete o `podeComporProva` que o ms calculou.
 * Ausente (api antiga) = como antes: pode.
 */
export const podeCompor = (p?: DonoDaProva | null) =>
  !!p && p.podeComporProva !== false;

export const TEXTO_DO_SELO =
  "Você pode ver esta prova, mas só quem é dono dela pode adicionar ou remover questões.";

export type Selo = {
  tipo: "cursinho" | "oficial" | "plataforma";
  texto: string;
};

/**
 * O selo de uma prova que a pessoa NÃO compõe; `null` quando compõe.
 *
 * ⚠️ "Oficial" é SÓ a de categoria fora de uso (`selecionavel: false`) — o
 * ENEM que não se cria mais. Prova da plataforma com categoria selecionável
 * não é oficial: é "da plataforma" (pedido do Fernando, 2026-09-28).
 */
export function seloDaProva(p?: DonoDaProva | null): Selo | null {
  if (!p || podeCompor(p)) return null;
  if (p.selecionavel === false) {
    return { tipo: "oficial", texto: "🔒 Prova oficial" };
  }
  if (p.cursinhoId) {
    return {
      tipo: "cursinho",
      texto: p.cursinhoNome
        ? `🏫 Prova do cursinho ${p.cursinhoNome}`
        : "🏫 Prova de outro cursinho",
    };
  }
  return { tipo: "plataforma", texto: "🏛️ Prova da plataforma" };
}
