import { StatusApplication } from "@/enums/prepCourse/statusApplication";

/**
 * Quais ações de matrícula a linha do estudante oferece, pelo status
 * (tickets-documentacao, card 14). A api só aceita:
 * - cancelar quem está Matriculado;
 * - reativar quem está com Matrícula Cancelada.
 *
 * ⚠️ Matrícula Encerrada (fim do período) não tem ação: antes aparecia
 * "Reativar", que a api sempre recusava. Volta pelo próximo processo seletivo.
 */
export function acoesDeMatricula(status: StatusApplication) {
  return {
    cancelar: status === StatusApplication.Enrolled,
    reativar: status === StatusApplication.EnrollmentCancelled,
    // Card 15: cancelado ou encerrado mudava de turma sem aparecer nela.
    alterarTurma: status === StatusApplication.Enrolled,
  };
}
