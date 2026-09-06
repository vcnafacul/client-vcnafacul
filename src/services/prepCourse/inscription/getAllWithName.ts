import { inscriptionCourseWithName } from "@/services/urls";
import fetchWrapper from "@/utils/fetchWrapper";

export interface InscriptionWithName {
  id: string;
  name: string;
  startDate: Date;
  endDate: Date;
  createdAt: Date;
  partnerId: string;
}

export async function getAllWithName(
  token: string,
  year?: number
): Promise<InscriptionWithName[]> {
  // O parametro year so pode ser enviado quando definido: o backend converte
  // string vazia em 0 e devolveria uma lista vazia.
  const params = new URLSearchParams();
  if (year !== undefined && year !== null) {
    params.append("year", year.toString());
  }
  const query = params.toString();
  const url = query
    ? `${inscriptionCourseWithName}?${query}`
    : inscriptionCourseWithName;

  const response = await fetchWrapper(url, {
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
