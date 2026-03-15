import { historico_summary } from "@/services/urls";
import fetchWrapper from "@/utils/fetchWrapper";

export interface HistoricoSummaryResponse {
  historicTotal: number;
  historicCompleted: number;
}

export async function getHistoricoSummary(
  token: string
): Promise<HistoricoSummaryResponse> {
  const response = await fetchWrapper(historico_summary, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });
  const res = await response.json();
  if (response.status !== 200) {
    throw new Error("Erro ao buscar resumo de histórico de simulados");
  }
  return res;
}
