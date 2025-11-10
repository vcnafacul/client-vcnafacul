import { Question } from "@/dtos/question/questionDTO";
import fetchWrapper from "../../utils/fetchWrapper";
import { questoes } from "../urls";

export async function getQuestionById(
  token: string,
  questionId: string
): Promise<Question> {
  const url = `${questoes}/${questionId}`;

  const response = await fetchWrapper(url, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  if (response.status === 200) {
    const question: Question = await response.json();
    return question;
  }

  throw new Error(`Erro ao buscar questão ${questionId}`);
}
