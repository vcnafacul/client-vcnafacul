import { StatusApplication } from '@/enums/prepCourse/statusApplication';

/**
 * O que o aluno lê na coluna "Status". Agrupa as etapas em que ele ainda
 * concorre; as demais (indeferido, matrícula cancelada…) vão com o nome real.
 */
export function statusLabel(status: StatusApplication | null): string {
  switch (status) {
    case null:
      return '-';
    case StatusApplication.UnderReview:
    case StatusApplication.SendedDocument:
      return 'Inscrito';
    case StatusApplication.DeclaredInterest:
    case StatusApplication.CalledForEnrollment:
      return 'Declarou Interesse';
    default:
      return status;
  }
}
