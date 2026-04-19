import { HomeAbout } from "../../dtos/homeContent/homeAbout";
import fetchWrapper from "../../utils/fetchWrapper";
import { homeAbout } from "../urls";

export async function updateHomeAbout(
  payload: { videoUrl?: string; description?: string },
  token: string,
): Promise<HomeAbout> {
  const res = await fetchWrapper(homeAbout, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });
  if (res.status !== 200) throw new Error("Erro ao atualizar About");
  return await res.json();
}
