import { question_summary } from "@/services/urls";
import fetchWrapper from "@/utils/fetchWrapper";

export interface QuestionSummary {
  questionTotal: number;
  questionPending: number;
  questionApproved: number;
  questionRejected: number;
  questionReported: number;
  questionClassified: number;
}

export async function questionSummary(
  token: string
): Promise<QuestionSummary> {
  const response = await fetchWrapper(question_summary, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });
    const res = await response.json();
  if (response.status !== 200) {
    throw new Error(`Erro ao buscar informações de monitoramento de geolocation`);
  }

  return res;
}
