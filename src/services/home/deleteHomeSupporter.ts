import fetchWrapper from "../../utils/fetchWrapper";
import { homeSupporters } from "../urls";

export async function deleteHomeSupporter(
  id: number,
  token: string,
): Promise<void> {
  const res = await fetchWrapper(`${homeSupporters}/${id}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  if (res.status !== 204 && res.status !== 200)
    throw new Error("Erro ao deletar Apoiador");
}
