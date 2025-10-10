import {
  AnswerCollectionType,
  AnswerType,
  QuestionForm,
} from "@/types/partnerPrepForm/questionForm";
import fetchWrapper from "../../utils/fetchWrapper";
import { question_form } from "../urls";

interface CreateQuestionDtoInput {
  sectionId: string;
  text: string;
  helpText?: string;
  answerType: AnswerType;
  collection: AnswerCollectionType;
  options?: string[];
  active: boolean;
}

export async function createQuestion(
  data: CreateQuestionDtoInput,
  token: string
): Promise<QuestionForm> {
  const response = await fetchWrapper(question_form, {
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
