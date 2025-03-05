import { EditRoleDto } from "@/dtos/roles/editRole";
import fetchWrapper from "../../utils/fetchWrapper";
import { role } from "../urls";

export async function getAllRoles(token: string): Promise<EditRoleDto[]> {
  const response = await fetchWrapper(`${role}/all`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  if (response.status === 200) {
    return await response.json();
  } else {
    throw new Error("Erro ao buscar roles");
  }
}
