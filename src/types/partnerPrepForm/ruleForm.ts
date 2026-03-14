import { QuestionForm } from "./questionForm";
import { SectionForm } from "./sectionForm";

export enum RuleType {
  Score = "Score",
  TieBreaker = "TieBreaker",
}

export enum Strategy {
  PerOption = "PerOption",
  NumericRange = "NumericRange",
  InverseProportional = "InverseProportional",
  ComputedInverseProportional = "ComputedInverseProportional",
}

export interface PerOptionConfig {
  points: Record<string, number>;
}

export interface NumericRangeConfig {
  ranges: Array<{
    min: number | null;
    max: number | null;
    points: number;
  }>;
}

export interface InverseProportionalConfig {
  referenceValue: number;
  maxScore: number;
}

export interface ComputedInverseProportionalConfig {
  expression: string;
  questionIds: string[];
  referenceValue: number;
  maxScore: number;
}

export interface RuleForm {
  _id: string;
  name: string;
  description: string;
  type: RuleType;
  strategy: Strategy;
  question?: QuestionForm | string;
  config: PerOptionConfig | NumericRangeConfig | InverseProportionalConfig | ComputedInverseProportionalConfig;
  weight: number;
  active: boolean;
  createdAt: string;
  updatedAt?: string;
}

export interface FormFullRef {
  _id: string;
  name: string;
  inscriptionId: string;
  sections: SectionForm[];
}

export interface RuleSetForm {
  _id: string;
  name: string;
  form: FormFullRef;
  scoringRules: RuleForm[];
  tieBreakerRules: RuleForm[];
  lastRanking: RankingItem[] | null;
  lastRankingAt: string | null;
  createdAt: string;
  updatedAt?: string;
}

export interface RankingItem {
  rank: number;
  userId: string;
  totalScore: number;
}

export interface RankingOutput {
  rankings: RankingItem[];
}
