import { UserMe } from "@/types/user/userMe";
import fetchWrapper from "../../utils/fetchWrapper";
import { user } from "../urls";

export async function me(token: string): Promise<UserMe> {
  const response = await fetchWrapper(`${user}/me`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });
  const res = await response.json();
  if (response.status !== 200) {
    throw new Error(`Erro ao buscar Infos Usuário`);
  }

  return res;
}
