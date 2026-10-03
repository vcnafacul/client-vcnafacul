import { contagem, type TurmaDoIndicador } from "@/services/indicadores";
import { evasao } from "./formato";

/**
 * Abaixo disto, um cancelamento já mexe 10 pontos na taxa: a turma aparece,
 * mas não disputa o destaque de "maior evasão" (tickets/033, card 06).
 */
export const MINIMO_DE_ALUNOS_PARA_DESTAQUE = 10;

export interface TurmaNoRanking extends TurmaDoIndicador {
  evasao: number | null;
  /** Tem alunos suficientes para disputar o destaque. */
  elegivel: boolean;
}

/**
 * As turmas da maior para a menor evasão (sem dado por último) e qual leva o
 * selo: a primeira elegível; empate → a que tem mais cancelamentos.
 */
export function rankingDeEvasao(turmas: TurmaDoIndicador[]) {
  const lista: TurmaNoRanking[] = turmas.map((t) => ({
    ...t,
    evasao: evasao(t.metricas),
    elegivel:
      (contagem(t.metricas, "alunos") ?? 0) >= MINIMO_DE_ALUNOS_PARA_DESTAQUE,
  }));
  const cancelados = (t: TurmaNoRanking) =>
    contagem(t.metricas, "cancelados") ?? 0;
  lista.sort(
    (a, b) =>
      (b.evasao ?? -1) - (a.evasao ?? -1) ||
      cancelados(b) - cancelados(a) ||
      a.nome.localeCompare(b.nome),
  );
  const destaque = lista.find((t) => t.elegivel && (t.evasao ?? 0) > 0);
  return { turmas: lista, destaqueId: destaque?.id ?? null };
}
