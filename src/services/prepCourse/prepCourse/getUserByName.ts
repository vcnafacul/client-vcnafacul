import { user } from "@/services/urls";
import fetchWrapper from "@/utils/fetchWrapper";

export interface SearchUser {
  id: string;
  name: string;
  email: string;
  phone: string;
}

export async function getUserByName(
  token: string,
  name: string
): Promise<SearchUser[]> {
  const url = new URL(`${user}/search-users-by-name`);
  url.searchParams.set("name", name);

  const res = await fetchWrapper(url.toString(), {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });
  if (res.status !== 200) {
    throw new Error("Erro ao buscar usuário");
  }
  return await res.json();
}
