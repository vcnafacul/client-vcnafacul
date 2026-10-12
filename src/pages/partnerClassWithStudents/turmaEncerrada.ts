import { startOfDay } from "date-fns";

/**
 * A turma é de um período letivo que já terminou? Vale a partir do dia
 * seguinte ao "Término" que a tela mostra — a mesma data, no mesmo fuso.
 *
 * Só no front, pela data do período: é quando o api passa os alunos para
 * Matrícula Encerrada, e a turma continua mostrando quem passou por ela.
 */
export function turmaEncerrada(
  endDate: Date | string | undefined | null,
  hoje: Date = new Date(),
): boolean {
  if (!endDate) return false;
  const fim = new Date(endDate);
  if (Number.isNaN(fim.getTime())) return false;
  return startOfDay(hoje) > startOfDay(fim);
}
