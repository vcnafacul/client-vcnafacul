import fetchWrapper from "../../utils/fetchWrapper";
import { materias } from "../urls";

export interface UpdateMateriaDto {
  nome?: string;
  enemArea?: string;
  icon?: string;
  image?: string;
}

export async function updateMateria(
  id: string,
  data: UpdateMateriaDto,
  token: string,
): Promise<void> {
  const response = await fetchWrapper(`${materias}/${id}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });
  if (response.status !== 200) {
    const res = await response.json();
    const msg = Array.isArray(res?.message)
      ? res.message.join(", ")
      : (res?.message ?? "Erro ao editar matéria");
    throw new Error(msg);
  }
}
