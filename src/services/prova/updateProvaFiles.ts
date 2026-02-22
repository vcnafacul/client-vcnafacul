import fetchWrapper from "../../utils/fetchWrapper";
import { Prova } from "../../dtos/prova/prova";
import { prova } from "../urls";

export async function updateProvaFiles(provaId: string, formData: FormData, token: string): Promise<Prova> {
  const response = await fetchWrapper(`${prova}/${provaId}/files`, {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: formData,
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data?.message || "Erro ao atualizar arquivos da prova");
  }

  return data;
}