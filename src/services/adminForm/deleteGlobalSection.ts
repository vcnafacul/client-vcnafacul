import fetchWrapper from "@/utils/fetchWrapper";
import { admin_section_form } from "../urls";

export async function deleteGlobalSection(
  token: string,
  id: string
): Promise<void> {
  const response = await fetchWrapper(`${admin_section_form}/${id}`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });
  if (response.status !== 200) {
    const res = await response.json();
    if (response.status >= 400) {
      throw res;
    }
  }
}
