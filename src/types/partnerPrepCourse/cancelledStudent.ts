export interface CancelledStudent {
  id: string;
  name: string;
  /** Mascarado quando o papel nao tem gerenciarEstudantes. */
  email: string;
  cod_enrolled: string;
  /** Data do cancelamento mais recente. Nulo se o log nao existir. */
  cancelledAt: Date | null;
  /** Justificativa do cancelamento mais recente. */
  justification: string | null;
}
