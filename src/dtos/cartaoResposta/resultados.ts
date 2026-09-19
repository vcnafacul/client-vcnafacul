export interface EstudanteCartao {
  userId: string;
  nome: string;
  matricula: string;
}

/** Espelha o `acaoSugerida` do ms-simulado (`historico/falha/codigo-falha.ts`). */
export type AcaoSugerida = "reprocessar" | "reenviar_foto" | "falar_com_suporte";

/**
 * A `descricao` e a `acaoSugerida` são derivadas do código pelo ms-simulado.
 * O client NÃO conhece código de erro — e é isso que permite mudar um texto
 * ou uma ação sem tocar em nenhuma tela.
 */
export interface FalhaHistorico {
  codigo: string;
  detalhe?: string;
  descricao: string;
  acaoSugerida: AcaoSugerida;
}

export interface HistoricoResumo {
  ano?: number;
  status?: string;
  falha?: FalhaHistorico;
}

export interface ResultadosCartao {
  estudante: EstudanteCartao;
  historicos: HistoricoResumo[];
}
