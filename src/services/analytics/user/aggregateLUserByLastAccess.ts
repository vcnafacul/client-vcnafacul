import { Period } from "@/enums/analytics/period";
import { user_aggregate_last_access } from "@/services/urls";
import fetchWrapper from "@/utils/fetchWrapper";
import { AggregateUserLastAcess } from "./dtos/aggregate-user-last-acess";

export async function aggregateUserByLastAccess(
  period: Period,
  token: string
): Promise<AggregateUserLastAcess[]> {
  const response = await fetchWrapper(
    `${user_aggregate_last_access}?groupBy=${period}`,
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
    throw new Error(`Erro ao buscar informações de monitoramento de usuários`);
  }

  return res;
}
