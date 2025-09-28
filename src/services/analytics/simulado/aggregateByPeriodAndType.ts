import { Period } from "@/enums/analytics/period";
import { historicoByPeriodAndType } from "@/services/urls";
import fetchWrapper from "@/utils/fetchWrapper";

export interface AggregatePeriodByType {
  tipo: string | null;
  summary: {
    period: string;
    total: number;
  }[];
}

export async function getAggregateHistoricoByPeriodAnType(
  period: Period,
  token: string
): Promise<AggregatePeriodByType[]> {
  const response = await fetchWrapper(`${historicoByPeriodAndType}?groupBy=${period}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });
  const res = await response.json();
  if (response.status !== 200) {
    throw new Error(
      `Erro ao buscar informações de monitoramento de historico de simulado`
    );
  }

  return res;
}
