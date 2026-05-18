export interface ClassEssayMonthSummary {
  month: string;
  monthStart: string;
  monthEnd: string;
  geral: number;
  competencias: { c1: number; c2: number; c3: number; c4: number; c5: number };
  studentsWithAtLeastOneHumanReview: number;
  essaysReviewedByHuman: number;
  essaysSubmittedTotal: number;
  humanReviewRate: number;
  generatedAt: string;
}

export interface ClassEssayMonthsList {
  classId: string;
  className: string;
  coursePeriod: { startDate: string; endDate: string; isActive: boolean };
  totalStudents: number;
  months: ClassEssayMonthSummary[];
}

export type ClassEssayMonthAnalytics = ClassEssayMonthSummary & {
  classId: string;
  className: string;
};

export interface RefreshEssayResult {
  enqueued: Array<{ classId: string; month: string; type: "essay" }>;
  estimatedSeconds: number;
}
