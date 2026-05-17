import fetchWrapper from "../../utils/fetchWrapper";
import { homeFeatures } from "../urls";

export async function deleteHomeFeature(
  id: number,
  token: string,
): Promise<void> {
  const res = await fetchWrapper(`${homeFeatures}/${id}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  if (res.status !== 204 && res.status !== 200)
    throw new Error("Erro ao deletar Feature");
}
