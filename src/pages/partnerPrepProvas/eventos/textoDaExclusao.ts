import type { EventoDoCursinho } from "@/services/eventoSimulado";

/**
 * Card 38 — a confirmação diz quantos inscritos há e que eles serão avisados.
 * Evento encerrado não avisa ninguém (a api também não): o simulado já
 * aconteceu, e "foi cancelado" seria falso.
 */
export function textoDaExclusao(e: EventoDoCursinho): string {
  const base = `Excluir o evento "${e.nome}"?`;
  if (!e.totalInscritos || e.status === "encerrado") return base;
  const quem =
    e.totalInscritos === 1
      ? "Há 1 aluno inscrito. Ele será avisado"
      : `Há ${e.totalInscritos} alunos inscritos. Eles serão avisados`;
  return `${base} ${quem} de que o simulado foi cancelado.`;
}
