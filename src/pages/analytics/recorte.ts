import { CursinhoDoFiltro } from "@/components/molecules/seletorDeCursinho/filtrar";

/**
 * O recorte por cursinho do Monitoramento (tickets/044).
 *
 * Seções e KPIs que não têm como ser recortados somem com um cursinho escolhido
 * (D3, D4 e decisão do Fernando de 2026-10-18): Geolocalização, Conteúdos,
 * Questões e Provas, os KPIs Total Cursinhos / Conteúdos / Questões e o gráfico
 * "Usuários Ativos e Total" (agrupa pela data de criação da conta).
 */
export const FORA_DO_RECORTE = [
  "Geolocalização",
  "Conteúdos",
  "Questões e Provas",
] as const;

export type { CursinhoDoFiltro };
export { filtrarCursinhos } from "@/components/molecules/seletorDeCursinho/filtrar";

/** `?cursinho=<id>` só vale se o id estiver na lista (senão, "Todos"). */
export function cursinhoDaUrl(
  id: string | null,
  cursinhos: CursinhoDoFiltro[],
): CursinhoDoFiltro | null {
  if (!id) return null;
  return cursinhos.find((c) => c.id === id) ?? null;
}
