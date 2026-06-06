import { HomeSupporter } from "../../dtos/homeContent/homeSupporter";
import fetchWrapper from "../../utils/fetchWrapper";
import { homeSupportersAll } from "../urls";

export async function getAdminHomeSupporters(
  token: string,
): Promise<HomeSupporter[]> {
  const res = await fetchWrapper(homeSupportersAll, {
    method: "GET",
    headers: { Authorization: `Bearer ${token}` },
  });
  if (res.status !== 200) throw new Error("Erro ao buscar Apoiadores");
  const text = await res.text();
  return text ? (JSON.parse(text) as HomeSupporter[]) : [];
}
