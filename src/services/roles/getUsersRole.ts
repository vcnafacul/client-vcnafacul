import { UserRole } from "../../types/roles/UserRole";
import fetchWrapper from "../../utils/fetchWrapper";
import { Paginate } from "../../utils/paginate";
import { user } from "../urls";

export async function getUsersRole(
  token: string,
  page: number = 1,
  limit: number = 40,
  name: string = "",
  roleId: string = "",
  /** Só os colaboradores deste cursinho (card 06 de `tela-de-usuarios`). */
  partnerId: string = ""
): Promise<Paginate<UserRole>> {
  const params = new URLSearchParams({
    page: String(page),
    limit: String(limit),
  });
  if (name) params.set("name", name);
  if (roleId) params.set("roleId", roleId);
  if (partnerId) params.set("partnerId", partnerId);

  const response = await fetchWrapper(
    `${user}?${params.toString()}`,
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
