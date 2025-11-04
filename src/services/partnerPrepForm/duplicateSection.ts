import fetchWrapper from "../../utils/fetchWrapper";
import { section_form } from "../urls";

export async function duplicateSection(
  id: string,
  token: string
): Promise<void> {
  const response = await fetchWrapper(`${section_form}/${id}/duplicate`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });
  if (response.status !== 201) {
    const res = await response.json();
    if (response.status >= 400) {
      throw res;
    }
  }
}
