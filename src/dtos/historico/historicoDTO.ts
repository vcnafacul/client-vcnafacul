import { DateTime } from "luxon";
import { ICategoria } from "../categoria/categoria";
import { QuestionTemplate } from "../../components/templates/simulateTemplate";
import { Alternativa } from "../../types/question/alternative";

export interface AnswerHistoricoDTO {
  questao: string;
  alternativaCorreta: Alternativa;
  alternativaEstudante?: Alternativa;
  /** tickets/042: fora da nota gravada. */
  anulada?: boolean;
  numero?: number | null;
}

interface PerformanceSpecific {
  id: string;
  nome: string;
  aproveitamento: number;
}

interface MateriaPerformance extends PerformanceSpecific {
  frentes: PerformanceSpecific[];
}

export interface AproveitamentoDTO {
  geral: number;
  materias: MateriaPerformance[];
}

export interface QuestaoHistorico extends QuestionTemplate {
  materia: string;
  frente1: string;
  textoQuestao: string;
  textoAlternativaA: string;
  textoAlternativaB: string;
  textoAlternativaC: string;
  textoAlternativaD: string;
  textoAlternativaE: string;
  status: number;
  updatedAt: string;
  quantidadeSimulado: number;
  prova: string;
  /** tickets/042: anulada agora nesta prova, e por quê. */
  anulada?: boolean;
  anulacao?: { motivo: string; justificativa: string };
}

interface SimuladoHistoricoDTO {
  _id: string;
  nome: string;
  // Opcional: simulado sem categoria existe (o schema não a exige).
  categoria?: ICategoria | null;
  questoes: QuestaoHistorico[];
  aproveitamento: number;
  vezesRespondido: number;
}

export type HistoricoStatus = 'pending' | 'processing' | 'completed' | 'failed';

export interface HistoricoDTO {
  _id: string;
  usuario: string;
  ano: number;
  simulado: SimuladoHistoricoDTO;
  respostas: AnswerHistoricoDTO[];
  tempoRealizado: number;
  questoesRespondidas: number;
  /** Só existe no histórico corrigido por cartão-resposta (simulado presencial). */
  cartaoCode?: string;
  aproveitamento?: AproveitamentoDTO;
  status?: HistoricoStatus;
  createdAt: DateTime;
  /**
   * tickets/042: a nota é de antes da última anulação. O de cartão espera o
   * recálculo do cursinho; o digital é recalculado ao abrir (D11).
   */
  divergente?: boolean;
  /** Sobre quantas questões a nota foi calculada (sem as anuladas). */
  totalConsiderado?: number;
  numerosAnulados?: number[];
  /** Quando a nota foi recalculada por anulação. */
  recalculadoEm?: string;
}
