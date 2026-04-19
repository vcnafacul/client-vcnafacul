import { HomeFeature } from "../../dtos/homeContent/homeFeature";
import fetchWrapper from "../../utils/fetchWrapper";
import { homeFeatures } from "../urls";

export async function getHomeFeatures(): Promise<HomeFeature[]> {
  const res = await fetchWrapper(homeFeatures, { method: "GET" });
  if (res.status !== 200) throw new Error("Erro ao buscar Features");
  const text = await res.text();
  return text ? (JSON.parse(text) as HomeFeature[]) : [];
}
