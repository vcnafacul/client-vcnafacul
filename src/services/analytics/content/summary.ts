import { content_summary } from "@/services/urls";
import fetchWrapper from "@/utils/fetchWrapper";

export interface ContentSummaryResponse {
  contentSumission: number;
  contentPending: number;
  contentApproved: number;
  contentRejected: number;
}

export async function getContentSummaryStats(
  token: string
): Promise<ContentSummaryResponse> {
  const response = await fetchWrapper(content_summary, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });
  const res = await response.json();
  if (response.status !== 200) {
    throw new Error("Erro ao buscar resumo de conteúdos");
  }
  return res;
}
