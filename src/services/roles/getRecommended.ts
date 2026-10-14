import fetchWrapper from "../../utils/fetchWrapper";
import { role as url } from "../urls";

export interface PerfilRecomendado {
  id: string;
  name: string;
}

/** Perfis que o projeto recomenda para quem sai de um cursinho. */
export async function getRecommendedRoles(
  token: string,
): Promise<PerfilRecomendado[]> {
  const response = await fetchWrapper(`${url}/recommended`, {
    method: "GET",
    headers: { Authorization: `Bearer ${token}` },
  });
  if (response.status !== 200) {
    throw new Error("Erro ao buscar perfis recomendados");
  }
  return response.json();
}
