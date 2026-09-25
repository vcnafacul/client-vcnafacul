/**
 * As frentes de uma matéria somam mais questões que a própria matéria?
 *
 * ⚠️ É esperado (contagem-por-materia 01/03): a matéria conta cada questão UMA
 * vez, e a frente conta a questão em cada frente que ela toca — Financeira +
 * Álgebra na mesma questão é legítimo. Sem aviso, "Matemática de 2" com frentes
 * somando 4 parece erro.
 *
 * ⚠️ Só com as duas bases: histórico anterior ao card 30 não tem `questoes`, e
 * sem número não há o que comparar — nada de aviso afirmando sem saber.
 */
export function frentesSomamMais(
  questoesDaMateria: number | undefined,
  frentes: { questoes?: number }[],
): boolean {
  if (typeof questoesDaMateria !== "number" || questoesDaMateria <= 0) {
    return false;
  }
  if (frentes.some((f) => typeof f.questoes !== "number")) return false;
  const soma = frentes.reduce((t, f) => t + (f.questoes ?? 0), 0);
  return soma > questoesDaMateria;
}

export const TEXTO_FRENTES_SOMAM_MAIS =
  "Uma questão pode ter mais de uma frente — por isso as frentes podem somar mais que a matéria.";
