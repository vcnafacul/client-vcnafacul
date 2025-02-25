import fetchWrapper from "../../utils/fetchWrapper";
import { user } from "../urls";

export async function updateUserRole(
  userId: string,
  roleId: string,
  token: string
): Promise<boolean> {
  const response = await fetchWrapper(`${user}/updateRole`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ userId, roleId }),
  });

  if (response.status === 304 || response.status === 200) {
    return true;
  } else {
    throw new Error("Erro ao tentar atualizar permissões");
  }
}
