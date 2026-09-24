import { EnemArea } from "@/types/question/enemArea";

/** O mínimo de uma prova para decidir as áreas: as do seu dia, se for ENEM. */
export interface ProvaComAreas {
  enemAreas?: string[] | null;
}

export interface AreasPermitidas {
  areas: string[];
  /**
   * ⚠️ A questão está em provas ENEM de dias diferentes — nenhuma área serve
   * para todas. A tela mostra as 4 com aviso; o servidor recusa o que não
   * couber (card 01).
   */
  conflito: boolean;
}

/**
 * As áreas ENEM que a questão pode ter, dadas as provas em que ela está (ou
 * vai entrar) — card 02 de `area-enem-da-questao`.
 *
 * ⚠️ **Só prova ENEM restringe.** As fábricas ENEM gravam as áreas do dia em
 * `enemAreas`; a customizada grava `[]`. Sem prova ENEM, as 4 áreas.
 *
 * ⚠️ **Várias provas ENEM: a INTERSEÇÃO.** A área é da questão, não do vínculo
 * — filtrar pela prova selecionada deixava escolher uma área que outra prova
 * da mesma questão recusa.
 *
 * ⚠️ **Interseção vazia não trava:** devolve as 4 com `conflito`. Travado, o
 * formulário não teria saída de um estado inconsistente.
 */
export function areasPermitidas(provas: ProvaComAreas[]): AreasPermitidas {
  const enem = provas
    .map((p) => p.enemAreas ?? [])
    .filter((areas) => areas.length > 0);

  if (enem.length === 0) return { areas: [...EnemArea], conflito: false };

  const intersecao = EnemArea.filter((area) =>
    enem.every((areas) => areas.includes(area)),
  );
  return intersecao.length > 0
    ? { areas: intersecao, conflito: false }
    : { areas: [...EnemArea], conflito: true };
}

/**
 * Trocar a prova mantém a área escolhida? Só se ela continua permitida.
 *
 * ⚠️ Antes, trocar a prova zerava área → disciplina → frentes SEMPRE — corrigir
 * a prova escolhida custava reclassificar tudo.
 */
export function mantemArea(
  area: string | undefined | null,
  provas: ProvaComAreas[],
): boolean {
  if (!area) return true;
  const { areas, conflito } = areasPermitidas(provas);
  return !conflito && areas.includes(area);
}
