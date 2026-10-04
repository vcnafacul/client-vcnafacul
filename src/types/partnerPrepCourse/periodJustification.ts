export interface PeriodJustification {
  id: string;
  startDate: string;
  endDate: string;
  justification: string;
  /** Quantas faltas voltam a ser comuns se ela for excluída (card 06). */
  faltasJustificadas?: number;
  createdBy: { name: string };
  createdAt: string;
}
