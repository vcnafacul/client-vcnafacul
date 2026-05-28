import { PermissionGroup } from "@/dtos/roles/permissionHierarchy";
import fetchWrapper from "../../utils/fetchWrapper";
import { role } from "../urls";

export async function getPermissionsHierarchy(
  token: string,
): Promise<PermissionGroup[]> {
  const response = await fetchWrapper(`${role}/permissions/hierarchy`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  if (response.status === 200) {
    return await response.json();
  } else {
    throw new Error("Erro ao buscar hierarquia de permissões");
  }
}
