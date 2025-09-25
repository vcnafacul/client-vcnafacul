import { Period } from "@/enums/analytics/period";
import { user_aggregate } from "@/services/urls";
import fetchWrapper from "@/utils/fetchWrapper";
import { AggregateUserPeriod } from "./dtos/aggregate-user-period";

export async function aggregateUserByPeriod(
  period: Period,
  token: string
): Promise<AggregateUserPeriod[]> {
  const response = await fetchWrapper(`${user_aggregate}?groupBy=${period}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });
  const res = await response.json();
  if (response.status !== 200) {
    throw new Error(`Erro ao buscar informações de monitoramento de usuários`);
  }

  return res;
}
