import { HomeFeatureSection } from "../../dtos/homeContent/homeFeatureSection";
import fetchWrapper from "../../utils/fetchWrapper";
import { homeFeatureSection } from "../urls";

export async function getHomeFeatureSection(): Promise<HomeFeatureSection | null> {
  const res = await fetchWrapper(homeFeatureSection, { method: "GET" });
  if (res.status !== 200)
    throw new Error("Erro ao buscar seção de Features");
  const text = await res.text();
  return text ? (JSON.parse(text) as HomeFeatureSection) : null;
}
