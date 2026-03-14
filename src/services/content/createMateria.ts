import fetchWrapper from "../../utils/fetchWrapper";
import { materias } from "../urls";

export interface CreateMateriaDto {
  nome: string;
  enemArea: string;
  icon?: string;
  image?: string;
}

export async function createMateria(
  data: CreateMateriaDto,
  token: string,
): Promise<{ _id: string; nome: string; enemArea: string; icon?: string; image?: string }> {
  const response = await fetchWrapper(materias, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });
  const res = await response.json();
  if (response.status !== 200 && response.status !== 201) {
    const msg = Array.isArray(res?.message)
      ? res.message.join(", ")
      : (res?.message ?? "Erro ao criar matéria");
    throw new Error(msg);
  }
  return res;
}
