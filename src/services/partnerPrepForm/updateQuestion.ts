import { QuestionForm } from "@/types/partnerPrepForm/questionForm";
import fetchWrapper from "../../utils/fetchWrapper";
import { question_form } from "../urls";

export async function updateQuestionForm(
  token: string,
  id: string,
  question: QuestionForm
): Promise<void> {
  const response = await fetchWrapper(`${question_form}/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(question),
  });
  if (response.status !== 200) {
    const res = await response.json();
    if (response.status >= 400) {
      throw res;
    }
  }
}
