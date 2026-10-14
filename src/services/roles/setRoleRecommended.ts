import fetchWrapper from "../../utils/fetchWrapper";
import { role as url } from "../urls";

/** Marca/desmarca o perfil do projeto como recomendado. */
export async function setRoleRecommended(
  token: string,
  id: string,
  isRecommended: boolean
): Promise<void> {
  const response = await fetchWrapper(`${url}/${id}/recommended`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ isRecommended }),
  });
  if (response.status === 500) {
    throw new Error("Erro ao recomendar perfil");
  } else if (response.status === 400 || response.status === 404) {
    const res = await response.json();
    throw new Error(res.message);
  }
}
