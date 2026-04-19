import { HomeFeature } from "../../dtos/homeContent/homeFeature";
import fetchWrapper from "../../utils/fetchWrapper";
import { homeFeaturesReorder } from "../urls";

export async function reorderHomeFeatures(
  payload: { items: { id: number; order: number }[] },
  token: string,
): Promise<HomeFeature[]> {
  const res = await fetchWrapper(homeFeaturesReorder, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });
  if (res.status !== 200) throw new Error("Erro ao reordenar Features");
  return await res.json();
}
