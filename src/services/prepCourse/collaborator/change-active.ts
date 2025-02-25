import { collaborator } from "@/services/urls";
import fetchWrapper from "@/utils/fetchWrapper";

export async function changeActive(token: string, id: string): Promise<void> {
  const response = await fetchWrapper(`${collaborator}/${id}/active`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });
  if (response.status !== 200) {
    throw new Error(`Erro ao tentar alterar informação de colaborador`);
  }
}
