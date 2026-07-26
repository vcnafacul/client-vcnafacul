/**
 * Espelha `gerarNomeAuto` do ms-simulado para que o preview no form seja
 * idêntico ao nome que o backend vai gerar: `<Prefixo> <Nq>|livre <Dmin>`.
 */
export function gerarNomePreview(
  prefixo: string,
  quantidade: number | null,
  duracao: number | null,
): string {
  const p = prefixo.trim().replace(/\s+/g, " ") || "Personalizado";
  const parteQtd = quantidade == null ? "livre" : `${quantidade}q`;
  const dur = duracao ?? 0;
  return `${p} ${parteQtd} ${dur}min`;
}
