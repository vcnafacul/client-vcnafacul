/** Opções sem espaços nas pontas e sem as vazias (tickets-documentacao, 26). */
export function opcoesLimpas(opcoes: string[]): string[] {
  return opcoes.map((o) => o.trim()).filter((o) => o !== "");
}

/**
 * As opções que se repetem, depois de limpas. O servidor recusa repetidas
 * (`@ArrayUnique`), e "Sim" e "Sim " passavam pela tela como diferentes.
 */
export function opcoesRepetidas(opcoes: string[]): string[] {
  const vistas = new Set<string>();
  const repetidas = new Set<string>();
  for (const o of opcoesLimpas(opcoes)) {
    if (vistas.has(o)) repetidas.add(o);
    vistas.add(o);
  }
  return [...repetidas];
}
