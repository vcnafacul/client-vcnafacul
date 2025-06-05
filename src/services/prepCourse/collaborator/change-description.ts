import { collaborator } from "@/services/urls";
import fetchWrapper from "@/utils/fetchWrapper";

export async function changeDescription(token: string, id: string, description: string): Promise<void> {
  const response = await fetchWrapper(`${collaborator}/${id}/description`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ description }),
  });
  if (response.status !== 200) {
    throw new Error(`Erro ao tentar alterar informação de colaborador`);
  }
}
