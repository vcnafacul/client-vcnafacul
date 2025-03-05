import { EditRoleDto } from "@/dtos/roles/editRole";
import fetchWrapper from "../../utils/fetchWrapper";
import { role as url } from "../urls";

export async function updateRole(
  token: string,
  role: EditRoleDto
): Promise<void> {
  const response = await fetchWrapper(url, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(role),
  });
  console.log(response);
  if (response.status === 500) {
    throw new Error("Erro ao editar role");
  } else if (response.status === 400 || response.status === 404) {
    const res = await response.json();
    throw new Error(res.message);
  }
}
