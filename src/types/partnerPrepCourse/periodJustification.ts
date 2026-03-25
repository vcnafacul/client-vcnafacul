export interface PeriodJustification {
  id: string;
  startDate: string;
  endDate: string;
  justification: string;
  createdBy: { name: string };
  createdAt: string;
}
