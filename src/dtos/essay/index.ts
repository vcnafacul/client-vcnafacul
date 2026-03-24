export interface EssayTheme {
  id: string;
  title: string;
  motivationalText: string;
  instruction: string | null;
  weekStart: string;
  weekEnd: string;
  active: boolean;
  createdAt: string;
}

export type EssayStatus = 'DRAFT' | 'SUBMITTED' | 'REVIEWED';

export type ReviewType = 'AI' | 'HUMAN';

export interface AICompetency {
  score: number;
  feedback: string;
  suggestion: string;
}

export interface HighlightedExcerpt {
  trecho: string;
  tipo: 'positivo' | 'negativo';
  comentario: string;
}

export interface EssayReview {
  id: string;
  reviewType: ReviewType;
  reviewer?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  comp1Score: number;
  comp1Feedback: string;
  comp1Suggestion: string;
  comp2Score: number;
  comp2Feedback: string;
  comp2Suggestion: string;
  comp3Score: number;
  comp3Feedback: string;
  comp3Suggestion: string;
  comp4Score: number;
  comp4Feedback: string;
  comp4Suggestion: string;
  comp5Score: number;
  comp5Feedback: string;
  comp5Suggestion: string;
  totalScore: number;
  generalComment: string;
  highlightedExcerpts: HighlightedExcerpt[];
  processingTimeMs?: number;
  provider?: string;
  model?: string;
  createdAt: string;
}

export interface EssaySettingsDto {
  aiEnabled: boolean;
}

export interface Essay {
  id: string;
  title: string | null;
  text: string | null;
  inputType: 'TYPED' | 'UPLOADED';
  status: EssayStatus;
  wordCount: number | null;
  submittedAt: string | null;
  createdAt: string;
  theme: EssayTheme;
  reviews: EssayReview[];
  imageKey?: string;
  originalFilename?: string;
  mimeType?: string;
}

export interface EssayListItem {
  id: string;
  title: string | null;
  status: EssayStatus;
  submittedAt: string | null;
  createdAt: string;
  user: {
    firstName: string;
    lastName: string;
    email: string;
  };
  theme: {
    id: string;
    title: string;
  };
  reviews: EssayReview[];
}

export interface EssayStatsReview {
  totalScore: number;
  comp1Score: number;
  comp2Score: number;
  comp3Score: number;
  comp4Score: number;
  comp5Score: number;
}

export interface EssayStatsTimelineEntry {
  essayId: string;
  themeTitle: string;
  submittedAt: string;
  aiReview: EssayStatsReview | null;
  humanReview: EssayStatsReview | null;
}

export interface EssayStats {
  timeline: EssayStatsTimelineEntry[];
}

export interface CreateEssayReviewPayload {
  comp1Score: number;
  comp1Feedback: string;
  comp1Suggestion: string;
  comp2Score: number;
  comp2Feedback: string;
  comp2Suggestion: string;
  comp3Score: number;
  comp3Feedback: string;
  comp3Suggestion: string;
  comp4Score: number;
  comp4Feedback: string;
  comp4Suggestion: string;
  comp5Score: number;
  comp5Feedback: string;
  comp5Suggestion: string;
  totalScore: number;
  generalComment: string;
  highlightedExcerpts?: HighlightedExcerpt[];
}
