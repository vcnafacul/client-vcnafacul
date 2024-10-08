import { DateTime } from "luxon";
import { QuestionTemplate } from "../../components/templates/simulateTemplate";
import { Alternativa } from "../../types/question/alternative";

export interface AnswerHistoricoDTO {
  questao: string;
  alternativaCorreta: Alternativa;
  alternativaEstudante?: Alternativa;
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

interface TipoSimuladoHistorico {
  _id: string;
  nome: string;
  quantidadeTotalQuestao: number;
  duracao: number;
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
}

interface SimuladoHistoricoDTO {
  _id: string;
  nome: string;
  tipo: TipoSimuladoHistorico;
  questoes: QuestaoHistorico[];
  aproveitamento: number;
  vezesRespondido: number;
}

export interface HistoricoDTO {
  _id: string;
  usuario: string;
  ano: number;
  simulado: SimuladoHistoricoDTO;
  respostas: AnswerHistoricoDTO[];
  tempoRealizado: number;
  questoesRespondidas: number;
  aproveitamento: AproveitamentoDTO;
  createdAt: DateTime;
}
