/** Um estudante na lista de sugestões do envio de cartão. */
export interface EstudanteEncontrado {
  userId: string;
  /** Já resolvido no backend: nome social quando o estudante pediu. */
  nome: string;
  matricula: string;
  /** ⚠️ `null` é caso real — estudante sem turma no cursinho. */
  turma: string | null;
}

export interface BuscaDeEstudantes {
  estudantes: EstudanteEncontrado[];
}
