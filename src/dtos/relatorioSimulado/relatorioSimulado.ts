import { FalhaHistorico } from "../cartaoResposta/resultados";

/**
 * O status de um cartão no relatório.
 *
 * ⚠️ **União própria, não o `HistoricoStatus` de `historico/historicoDTO.ts`.**
 * Aquele é `'pending' | 'processing' | 'completed' | 'failed'` — está
 * desatualizado (não tem `awaiting_omr`) e é consumido pela tela do estudante.
 * Acrescentar valor lá para servir a esta tela arrisca a outra.
 */
export type StatusDoCartao =
  | "pending"
  | "processing"
  | "awaiting_omr"
  | "completed"
  | "failed";

export interface LinhaDoRelatorio {
  usuario: string;
  nome: string;
  matricula: string;
  turmaId: string | null;
  turmaNome: string | null;
  /**
   * ⚠️ Explícito de propósito. **Não inferir de `historicoId` ausente** — a api
   * manda este campo justamente para ninguém inferir e inferir errado.
   */
  enviouCartao: boolean;
  historicoId?: string;
  status?: StatusDoCartao;
  cartaoCode?: string;
  /**
   * ⚠️ **Sempre `undefined` nas linhas deste relatório — não faça coluna com
   * ele.** O campo existe e a api manda, mas o único escritor no ms é o
   * `createPending`, que é do fluxo DIGITAL. Cartão é
   * `createAwaitingOmr` → `prepararParaProcessamento` → `completeProcessing`, e
   * nenhum dos três grava. Toda linha daqui é linha de cartão, por construção.
   */
  questoesRespondidas?: number;
  /**
   * ⚠️ **Pode vir preenchido com nota VELHA numa linha `failed`.** O
   * `marcarFalha` do ms não limpa `aproveitamento`, e a api repassa como veio
   * — de propósito, ela não reescreve o que o ms disse. Quem decide não
   * mostrar é a tela. Ver `colunas.tsx`.
   */
  aproveitamentoGeral?: number;
  falha?: FalhaHistorico;
}

export interface ResumoDoRelatorio {
  totalNoRecorte: number;
  comLeituraConcluida: number;
  aproveitamentoGeral: number | null;
  totalEstudantesComCartaoNoCursinho: number;
  temEstudanteSemTurma: boolean;
  /** Quem saiu do cursinho depois de enviar. ⚠️ Contado, nunca listado. */
  linhasSemEstudanteAtivo: number;
}

export interface RelatorioDoSimulado {
  linhas: LinhaDoRelatorio[];
  resumo: ResumoDoRelatorio;
}

export interface QuestaoDoRelatorio {
  numero: number | null;
  questaoId: string;
  respondentes: number;
  acertos: number;
  erros: number;
  /**
   * ⚠️ `semLeitura`, não "em branco": o ms-omr descarta questão em branco e
   * dupla marcação do mesmo jeito, então os dois chegam indistinguíveis.
   */
  semLeitura: number;
  porAlternativa: Record<string, number>;
}

export interface QuestoesDoRelatorio {
  questoes: QuestaoDoRelatorio[];
}

export interface SimuladoComCartao {
  simuladoId: string;
  nome: string | null;
  /** Quantos ESTUDANTES enviaram, não quantas fotos chegaram. */
  cartoes: number;
  comLeituraConcluida: number;
  ultimoEnvio: string | null;
}

export interface SimuladosComCartao {
  simulados: SimuladoComCartao[];
}

/**
 * ⚠️ Três estados, não dois. E é `sem_leitura`, não `em_branco`: o ms-omr
 * descarta questão em branco e dupla marcação igualmente, então os dois chegam
 * indistinguíveis. O rótulo diz o que se sabe.
 */
export type ResultadoDaQuestao = "acerto" | "erro" | "sem_leitura";

export interface RespostaDoEstudante {
  numero: number | null;
  questaoId: string;
  /** AUSENTE quando não houve leitura — não vazio, não nulo. */
  alternativaEstudante?: string;
  alternativaCorreta?: string;
  /**
   * ⚠️ Classificado pelo ms, não aqui: a regra de "sem leitura" é a ausência
   * da chave, e duas implementações dela divergiriam.
   */
  resultado: ResultadoDaQuestao;
}

export interface DetalheDoEstudante {
  status: StatusDoCartao;
  falha?: FalhaHistorico;
  respostas: RespostaDoEstudante[];
}
