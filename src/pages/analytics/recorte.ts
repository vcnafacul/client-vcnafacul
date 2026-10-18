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

export type CursinhoDoFiltro = { id: string; name: string };

const semAcento = (s: string) =>
  s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();

/** Busca do seletor: sem acento e sem caixa, ordenada por nome. */
export function filtrarCursinhos(
  cursinhos: CursinhoDoFiltro[],
  busca: string,
): CursinhoDoFiltro[] {
  const termo = semAcento(busca.trim());
  return [...cursinhos]
    .sort((a, b) => a.name.localeCompare(b.name, "pt-BR"))
    .filter((c) => !termo || semAcento(c.name).includes(termo));
}

/** `?cursinho=<id>` só vale se o id estiver na lista (senão, "Todos"). */
export function cursinhoDaUrl(
  id: string | null,
  cursinhos: CursinhoDoFiltro[],
): CursinhoDoFiltro | null {
  if (!id) return null;
  return cursinhos.find((c) => c.id === id) ?? null;
}
