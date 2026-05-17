export interface ClassMonthsList {
  classId: string;
  className: string;
  coursePeriod: { startDate: string; endDate: string; isActive: boolean };
  totalStudents: number;
  months: Array<{
    month: string;
    monthStart: string;
    monthEnd: string;
    geral: number;
    studentsWithAtLeastOneCompletedAttempt: number;
    totalAttemptsCompleted: number;
    generatedAt: string;
  }>;
}

export interface ClassMonthAnalytics {
  classId: string;
  className: string;
  month: string;
  monthStart: string;
  monthEnd: string;
  geral: number;
  totalAttempts: number;
  totalAttemptsCompleted: number;
  studentsWithAtLeastOneCompletedAttempt: number;
  generatedAt: string;
  materias: Array<{
    id: string;
    nome: string;
    aproveitamento: number;
    studentsContributing: number;
    attemptsContributing: number;
    frentes: Array<{
      id: string;
      nome: string;
      aproveitamento: number;
      studentsContributing: number;
      attemptsContributing: number;
    }>;
  }>;
}

export interface RefreshResult {
  enqueued: Array<{ classId: string; month: string }>;
  estimatedSeconds: number;
}
