import { EditRoleDto } from "@/dtos/roles/editRole";
import fetchWrapper from "../../utils/fetchWrapper";
import { partnerPrepCourse } from "../urls";

export async function getRoles(token: string): Promise<EditRoleDto[]> {
  const response = await fetchWrapper(`${partnerPrepCourse}/role`, {
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
