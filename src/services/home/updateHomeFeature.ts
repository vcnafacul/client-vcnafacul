import { HomeFeature } from "../../dtos/homeContent/homeFeature";
import fetchWrapper from "../../utils/fetchWrapper";
import { homeFeatures } from "../urls";

export async function updateHomeFeature(
  id: number,
  payload: { title?: string; description?: string },
  token: string,
): Promise<HomeFeature> {
  const res = await fetchWrapper(`${homeFeatures}/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });
  if (res.status !== 200) throw new Error("Erro ao atualizar Feature");
  return await res.json();
}
