import { prova_summary } from "@/services/urls";
import fetchWrapper from "@/utils/fetchWrapper";

export interface ProvaSummary {
  provaTotal: number;
}

export async function provaSummary(
  token: string
): Promise<ProvaSummary> {
  const response = await fetchWrapper(prova_summary, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });
    const res = await response.json();
  if (response.status !== 200) {
    throw new Error(`Erro ao buscar informações de monitoramento de provas`);
  }

  return res;
}
