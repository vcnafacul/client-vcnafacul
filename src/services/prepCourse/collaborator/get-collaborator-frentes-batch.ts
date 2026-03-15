import fetchWrapper from "@/utils/fetchWrapper";
import { collaborator_frentes_batch } from "../../urls";

export async function getCollaboratorFrentesBatch(
  token: string
): Promise<Record<string, string[]>> {
  const response = await fetchWrapper(collaborator_frentes_batch, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });
  if (response.status !== 200) {
    const err = await response.json().catch(() => ({}));
    throw new Error(
      err?.message ?? "Erro ao buscar frentes dos colaboradores"
    );
  }
  return response.json();
}
