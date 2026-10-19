/** A busca do seletor de cursinho (tickets/044, compartilhado no 045). */
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
