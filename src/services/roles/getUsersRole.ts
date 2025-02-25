import { UserRole } from "../../types/roles/UserRole";
import fetchWrapper from "../../utils/fetchWrapper";
import { Paginate } from "../../utils/paginate";
import { user } from "../urls";

export async function getUsersRole(
  token: string,
  page: number = 1,
  limit: number = 40,
  name: string = ""
): Promise<Paginate<UserRole>> {
  const response = await fetchWrapper(
    `${user}?page=${page}&limit=${limit}&name=${name}`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    }
  );
  if (response.status !== 200) {
    throw new Error("Erro ao buscar usuários");
  } else {
    return await response.json();
  }
}
