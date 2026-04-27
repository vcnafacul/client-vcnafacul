import fetchWrapper from "../../utils/fetchWrapper";
import { collaborator } from "../../urls";

export async function adminUploadPhotoCollaborator(
  collaboratorId: string,
  data: FormData,
  token: string,
): Promise<string> {
  const response = await fetchWrapper(
    `${collaborator}/${collaboratorId}/photo`,
    {
      method: "PATCH",
      headers: { Authorization: `Bearer ${token}` },
      body: data,
    },
  );
  const res = await response.text();
  if (response.status !== 200) {
    throw new Error("Erro ao atualizar foto do colaborador");
  }
  return res;
}
