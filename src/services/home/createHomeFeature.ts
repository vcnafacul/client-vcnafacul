import { HomeFeature } from "../../dtos/homeContent/homeFeature";
import fetchWrapper from "../../utils/fetchWrapper";
import { homeFeatures } from "../urls";

export async function createHomeFeature(
  payload: { title: string; description?: string },
  token: string,
): Promise<HomeFeature> {
  const res = await fetchWrapper(homeFeatures, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });
  if (res.status !== 200 && res.status !== 201)
    throw new Error("Erro ao criar Feature");
  return await res.json();
}
