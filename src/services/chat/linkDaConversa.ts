import { DASH, DASH_PARTNER_SUPPORT, DASH_SUPPORT } from "@/routes/path";

/** Quem vai abrir: o estudante (balão, em qualquer página) ou a inbox. */
export type AbreConversa = "estudante" | "suporte" | "suporte-cursinho";

/**
 * O link que abre uma conversa (tickets/031, card 05) — usado pelo sino e
 * pelo push. O balão do estudante está em todas as páginas; a inbox, na sua.
 */
export function linkDaConversa(id: string, quem: AbreConversa): string {
  const caminho =
    quem === "estudante"
      ? DASH
      : `${DASH}/${quem === "suporte" ? DASH_SUPPORT : DASH_PARTNER_SUPPORT}`;
  return `${caminho}?conversa=${encodeURIComponent(id)}`;
}
