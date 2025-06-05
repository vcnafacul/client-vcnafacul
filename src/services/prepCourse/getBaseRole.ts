import { EditRoleDto } from "@/dtos/roles/editRole";
import fetchWrapper from "../../utils/fetchWrapper";
import { partnerPrepCourse } from "../urls";

export async function getBaseRoles(token: string): Promise<EditRoleDto[]> {
  const response = await fetchWrapper(`${partnerPrepCourse}/role-base`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  const res = await response.json();
  if (response.status !== 200) {
    if (response.status >= 400) {
      throw res;
    }
    throw new Error("An error occurred");
  }
  return res as EditRoleDto[];
}
