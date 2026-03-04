import fetchWrapper from "../../utils/fetchWrapper";
import { materias } from "../urls";

export async function deleteMateria(
  id: string,
  token: string,
): Promise<void> {
  const response = await fetchWrapper(`${materias}/${id}`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });
  if (response.status !== 200 && response.status !== 204) {
    const res = await response.json();
    throw new Error(res?.message ?? "Erro ao excluir matéria");
  }
}
