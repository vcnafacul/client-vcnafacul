import { HomeSupporter } from "../../dtos/homeContent/homeSupporter";
import fetchWrapper from "../../utils/fetchWrapper";
import { homeSupporters } from "../urls";

export async function getHomeSupporters(): Promise<HomeSupporter[]> {
  const res = await fetchWrapper(homeSupporters, { method: "GET" });
  if (res.status !== 200) throw new Error("Erro ao buscar Apoiadores");
  const text = await res.text();
  return text ? (JSON.parse(text) as HomeSupporter[]) : [];
}
