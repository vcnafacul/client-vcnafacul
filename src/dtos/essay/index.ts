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

export type EssayStatus = 'DRAFT' | 'SUBMITTED' | 'AI_REVIEWED' | 'AI_FAILED';

export interface AICompetency {
  score: number;
  feedback: string;
  suggestion: string;
}

export interface AIHighlightedExcerpt {
  trecho: string;
  tipo: 'positivo' | 'negativo';
  comentario: string;
}

export interface EssayAIReview {
  id: string;
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
  highlightedExcerpts: AIHighlightedExcerpt[];
  processingTimeMs: number;
  provider: string;
  model: string;
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
  aiReview: EssayAIReview | null;
}
