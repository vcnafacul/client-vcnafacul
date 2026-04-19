import { HomeFeatureSection } from "../../dtos/homeContent/homeFeatureSection";
import fetchWrapper from "../../utils/fetchWrapper";
import { homeFeatureSection } from "../urls";

export async function updateHomeFeatureSection(
  payload: { title?: string; description?: string },
  token: string,
): Promise<HomeFeatureSection> {
  const res = await fetchWrapper(homeFeatureSection, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });
  if (res.status !== 200)
    throw new Error("Erro ao atualizar seção de Features");
  return await res.json();
}
