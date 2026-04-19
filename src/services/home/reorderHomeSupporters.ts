import { HomeSupporter } from "../../dtos/homeContent/homeSupporter";
import fetchWrapper from "../../utils/fetchWrapper";
import { homeSupportersReorder } from "../urls";

export async function reorderHomeSupporters(
  payload: { items: { id: number; order: number }[] },
  token: string,
): Promise<HomeSupporter[]> {
  const res = await fetchWrapper(homeSupportersReorder, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });
  if (res.status !== 200) throw new Error("Erro ao reordenar Apoiadores");
  return await res.json();
}
