import fetchWrapper from "../../utils/fetchWrapper";
import { materias } from "../urls";

export interface MateriaCanDeleteResult {
  canDelete: boolean;
  frentesCount: number;
  questoesCount: number;
  message?: string;
}

export async function getMateriaCanDelete(
  id: string,
  token: string
): Promise<MateriaCanDeleteResult> {
  const response = await fetchWrapper(`${materias}/${id}/can-delete`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });
  const res = await response.json();
  if (response.status !== 200) {
    throw new Error(res?.message ?? "Erro ao verificar se a matéria pode ser excluída");
  }
  return res;
}
