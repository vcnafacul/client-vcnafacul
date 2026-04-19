import { HomeAbout } from "../../dtos/homeContent/homeAbout";
import fetchWrapper from "../../utils/fetchWrapper";
import { homeAbout } from "../urls";

export async function getHomeAbout(): Promise<HomeAbout | null> {
  const res = await fetchWrapper(homeAbout, { method: "GET" });
  if (res.status !== 200) throw new Error("Erro ao buscar Home About");
  const text = await res.text();
  return text ? (JSON.parse(text) as HomeAbout) : null;
}
