import { AproveitamentoDTO } from "./historicoDTO";

interface GetPerformanceDTO {
  historyId: string;
  testName: string;
  performance: AproveitamentoDTO;
  timeSpent: number;
  questionsAnswered: number;
  totalQuestionsTest: number;
  testPerformance: number;
  testAttempts: number;
  createdAt: Date;
}

export interface SubAproveitamento {
  id: string;
  nome: string;
  aproveitamento: number;
}

interface AproveitamentoGeral {
  geral: number;
  frentes: SubAproveitamento[];
  materias: SubAproveitamento[];
}

export interface AproveitamentoHitoriesDTO {
  performanceMateriaFrente: AproveitamentoGeral;
  historicos: GetPerformanceDTO[];
}
