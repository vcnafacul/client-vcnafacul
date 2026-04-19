import { HomeSupporter } from "../../dtos/homeContent/homeSupporter";
import fetchWrapper from "../../utils/fetchWrapper";
import { homeSupporters } from "../urls";

export async function updateHomeSupporter(
  id: number,
  payload: { name?: string; link?: string },
  token: string,
): Promise<HomeSupporter> {
  const res = await fetchWrapper(`${homeSupporters}/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });
  if (res.status !== 200) throw new Error("Erro ao atualizar Apoiador");
  return await res.json();
}
