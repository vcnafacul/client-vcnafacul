import { HomeSupporter } from "../../dtos/homeContent/homeSupporter";
import fetchWrapper from "../../utils/fetchWrapper";
import { homeSupporters } from "../urls";

export async function createHomeSupporter(
  payload: { name: string; link: string },
  token: string,
): Promise<HomeSupporter> {
  const res = await fetchWrapper(homeSupporters, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });
  if (res.status !== 200 && res.status !== 201)
    throw new Error("Erro ao criar Apoiador");
  return await res.json();
}
