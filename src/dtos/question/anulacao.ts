/**
 * Anulação de questão por prova (tickets/042). A anulação mora no SLOT da prova
 * (prova + número); a questão carrega só um espelho, `anulacoes[]`.
 */
export enum MotivoAnulacao {
  enunciadoComErro = "enunciado_com_erro",
  semAlternativaCorreta = "sem_alternativa_correta",
  maisDeUmaCorreta = "mais_de_uma_correta",
  repetidaDeOutroExame = "repetida_de_outro_exame",
  foraDoEdital = "fora_do_edital",
  outro = "outro",
}

export const ROTULO_DO_MOTIVO: Record<MotivoAnulacao, string> = {
  [MotivoAnulacao.enunciadoComErro]: "Enunciado com erro",
  [MotivoAnulacao.semAlternativaCorreta]: "Sem alternativa correta",
  [MotivoAnulacao.maisDeUmaCorreta]: "Mais de uma alternativa correta",
  [MotivoAnulacao.repetidaDeOutroExame]: "Repetida de outro exame",
  [MotivoAnulacao.foraDoEdital]: "Fora do edital",
  [MotivoAnulacao.outro]: "Outro",
};

/** O rótulo, ou o valor cru se vier um motivo que este client não conhece. */
export const rotuloDoMotivo = (m?: string | null) =>
  (m && ROTULO_DO_MOTIVO[m as MotivoAnulacao]) || m || "";

export const JUSTIFICATIVA_MIN = 10;
export const JUSTIFICATIVA_MAX = 500;

export interface AnulacaoInput {
  motivo: MotivoAnulacao;
  justificativa: string;
}

/** A anulação gravada (slot ou espelho). */
export interface Anulacao extends AnulacaoInput {
  em: string;
  porUsuarioId?: string | null;
  porCursinhoId?: string | null;
}

/** Entrada do espelho `Questao.anulacoes`. */
export interface AnulacaoNaProva extends Anulacao {
  provaId: string;
  numero: number | null;
}

/** `GET questoes/:id/anulacoes` e o corpo do 409 `QUESTAO_ANULADA`. */
export interface AnulacaoDaQuestao {
  provaId: string;
  provaNome: string | null;
  numero: number | null;
  motivo: MotivoAnulacao;
  justificativa: string;
  em: string;
}

export const justificativaValida = (t: string) => {
  const n = t.trim().length;
  return n >= JUSTIFICATIVA_MIN && n <= JUSTIFICATIVA_MAX;
};
