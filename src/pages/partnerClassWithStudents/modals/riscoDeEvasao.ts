import { StudentToAttendanceRecord } from "@/types/partnerPrepCourse/classToAttendanceRecord";

export type AlertaEvasaoDaTurma = { percentual: number; minimoDeAulas: number };

/** A data `YYYY-MM-DD` cai em algum intervalo de justificativa por período (R4, inclusive). */
export function justificadoNaData(
  aluno: Pick<StudentToAttendanceRecord, "justificativasPorPeriodo">,
  data: string,
): boolean {
  return (aluno.justificativasPorPeriodo ?? []).some(
    ({ inicio, fim }) => inicio <= data && data <= fim,
  );
}

/**
 * % de faltas do aluno **contando a aula de hoje** e se ele está em risco de
 * evasão (tickets/054, R2–R5).
 *
 * - Hoje é mais uma aula; se ele está Ausente e não justificado na data, é
 *   mais uma falta (R3).
 * - Falta justificada não conta como falta, mas a aula conta no total (R2).
 * - Só entra em risco com o mínimo de aulas e o % ≥ alerta, comparando o valor
 *   sem arredondar (R5). Sem alerta configurado, nunca (D5).
 */
export function riscoDeEvasao(
  aluno: Pick<StudentToAttendanceRecord, "aulas" | "faltasNaoJustificadas">,
  hoje: { presente: boolean; justificado: boolean },
  alerta: AlertaEvasaoDaTurma | null | undefined,
): { percentual: number; emRisco: boolean } {
  const aulas = (aluno.aulas ?? 0) + 1;
  const faltas =
    (aluno.faltasNaoJustificadas ?? 0) +
    (!hoje.presente && !hoje.justificado ? 1 : 0);
  const percentual = (faltas / aulas) * 100;
  const emRisco =
    !!alerta && aulas >= alerta.minimoDeAulas && percentual >= alerta.percentual;
  return { percentual, emRisco };
}
