import { user_aggregate_role } from "@/services/urls";
import fetchWrapper from "@/utils/fetchWrapper";
import { AggregateUsersByRole } from "./dtos/aggregate-users-role";

export async function aggregateUserByRole(
  token: string
): Promise<AggregateUsersByRole[]> {
  const response = await fetchWrapper(user_aggregate_role, {
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
