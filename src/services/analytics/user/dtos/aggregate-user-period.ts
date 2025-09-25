export interface AggregateUserPeriod {
  period: string; // "2024-11-05", "2024-11", "2024" etc., dependendo do agrupamento
  total: number; // total de cadastros no período
  active: number; // cadastros com email_confirm_sended IS NULL
}
