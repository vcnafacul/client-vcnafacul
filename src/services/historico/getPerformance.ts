import { AproveitamentoHitoriesDTO } from "../../dtos/historico/getPerformanceDTO";
import fetchWrapper from "../../utils/fetchWrapper";
import { historico } from "../urls";

export async function getPerformance(
  token: string
): Promise<AproveitamentoHitoriesDTO> {
  const response = await fetchWrapper(`${historico}/performance`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });
  if (response.status !== 200) {
    throw new Error(`Erro ao buscar performance de simulado]`);
  }
  return await response.json();
}
