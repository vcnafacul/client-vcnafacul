import fetchWrapper from "@/utils/fetchWrapper";
import { admin_section_form } from "../urls";

export async function updateGlobalSection(
  token: string,
  id: string,
  name: string,
  description?: string
): Promise<void> {
  const response = await fetchWrapper(`${admin_section_form}/${id}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ name, description }),
  });
  if (response.status !== 200) {
    const res = await response.json();
    if (response.status >= 400) {
      throw res;
    }
  }
}
