export interface AggregateStudentCoursePeriod {
  period: string; // "2024-11-05", "2024-11", "2024" etc., dependendo do agrupamento
  totalInscriptions: number; // total de inscrições no período
  totalEnrolments: number; // total de matrículas no período
  cumulativeInscriptionsTotal: number; // total acumulado de inscrições até o período
  cumulativeEnrolmentsTotal: number; // total acumulado de matrículas até o período
}
