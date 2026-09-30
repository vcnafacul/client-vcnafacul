import { collaborator } from "@/services/urls";
import fetchWrapper from "@/utils/fetchWrapper";

/** O admin do cursinho remove a foto de um colaborador (par do upload admin). */
export async function adminRemovePhotoCollaborator(
  collaboratorId: string,
  token: string,
): Promise<void> {
  const response = await fetchWrapper(
    `${collaborator}/${collaboratorId}/photo`,
    {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    },
  );
  if (response.status !== 200) {
    throw new Error("Erro ao remover foto do colaborador");
  }
}
