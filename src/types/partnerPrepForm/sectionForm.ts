import { QuestionForm } from "./questionForm";

export interface SectionForm {
  _id: string;
  name: string;
  questions: QuestionForm[];
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
}
