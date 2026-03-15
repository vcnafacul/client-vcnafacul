import { user_aggregate_role } from "@/services/urls";
import fetchWrapper from "@/utils/fetchWrapper";
import { AggregateUsersByRole } from "./dtos/aggregate-users-role";

export async function aggregateUserByRole(
  token: string,
  partnerId?: string,
  baseOnly?: boolean
): Promise<AggregateUsersByRole[]> {
  const url = new URL(user_aggregate_role);
  if (partnerId) url.searchParams.set("partnerId", partnerId);
  if (baseOnly) url.searchParams.set("baseOnly", "true");

  const response = await fetchWrapper(url.toString(), {
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
