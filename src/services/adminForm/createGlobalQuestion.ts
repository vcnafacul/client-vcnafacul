import {
  AnswerCollectionType,
  AnswerType,
  QuestionForm,
} from "@/types/partnerPrepForm/questionForm";
import fetchWrapper from "@/utils/fetchWrapper";
import { admin_question_form } from "../urls";

export interface CreateGlobalQuestionDtoInput {
  sectionId: string;
  text: string;
  helpText?: string;
  answerType: AnswerType;
  collection: AnswerCollectionType;
  options?: string[];
  active: boolean;
}

export async function createGlobalQuestion(
  data: CreateGlobalQuestionDtoInput,
  token: string
): Promise<QuestionForm> {
  const response = await fetchWrapper(admin_question_form, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });
  const res = await response.json();
  if (response.status !== 201) {
    if (response.status >= 400) {
      throw res;
    }
  }
  return res;
}
