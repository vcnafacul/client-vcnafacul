import { QuestionForm } from "./questionForm";

export interface SectionForm {
  _id: string;
  name: string;
  description?: string;
  questions: QuestionForm[];
  active: boolean;
  isGlobal?: boolean;
  createdAt: Date;
  updatedAt: Date;
}
