export enum AnswerType {
  Text = "Text",
  Number = "Number",
  Boolean = "Boolean",
  Options = "Options",
}

export enum AnswerCollectionType {
  Single = "single",
  Multiple = "multiple",
}

export interface QuestionForm {
  _id: string;
  text: string;
  helpText?: string;
  answerType: AnswerType;
  collection: AnswerCollectionType;
  options?: string[];
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
}
