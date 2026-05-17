export interface AggregateInscriptionCoursePeriod {
  period: string; // "2024-11-05", "2024-11", "2024" etc., dependendo do agrupamento
  total: number; // total de cadastros no período
  cumulativeTotal: number; // total acumulado de cadastros até o período
}
