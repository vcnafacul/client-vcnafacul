import { inscriptionCourseWithName } from "@/services/urls";
import fetchWrapper from "@/utils/fetchWrapper";

export interface InscriptionWithName {
  id: string;
  name: string;
  startDate: Date;
  endDate: Date;
  createdAt: Date;
}

export async function getAllWithName(
  token: string
): Promise<InscriptionWithName[]> {
  const response = await fetchWrapper(inscriptionCourseWithName, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });
  if (response.status === 200) {
    return await response.json();
  }
  throw new Error(`Erro ao tentar recuperar inscrições`);
}
