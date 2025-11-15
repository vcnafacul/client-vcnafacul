import { Period } from "@/enums/analytics/period";
import { historicoByPeriod } from "@/services/urls";
import fetchWrapper from "@/utils/fetchWrapper";

export interface AggregateHistoricoByPeriod {
  period: string;
  total: number;
  completos: number;
  incompletos: number;
}

export async function getAggregateHistoricoByPeriod(
  period: Period,
  token: string
): Promise<AggregateHistoricoByPeriod[]> {
  const response = await fetchWrapper(
    `${historicoByPeriod}?groupBy=${period}`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    }
  );
  const res = await response.json();
  if (response.status !== 200) {
    throw new Error(
      `Erro ao buscar informações de monitoramento de historico de simulado`
    );
  }

  return res;
}
