import { collaborator } from "@/services/urls";
import fetchWrapper from "@/utils/fetchWrapper";

export interface CollaboratorFrentesEnrichedDto {
  collaboratorId: string;
  frentes: { id: string; nome: string; materia: string }[];
  materias: { id: string; nome: string }[];
}

export async function getCollaboratorFrentesEnriched(
  collaboratorId: string,
  token: string
): Promise<CollaboratorFrentesEnrichedDto> {
  const response = await fetchWrapper(
    `${collaborator}/${collaboratorId}/frentes`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    }
  );
  if (response.status !== 200) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err?.message ?? "Erro ao buscar frentes do colaborador");
  }
  return response.json();
}
