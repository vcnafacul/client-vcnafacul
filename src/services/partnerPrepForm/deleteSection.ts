import fetchWrapper from "../../utils/fetchWrapper";
import { section_form } from "../urls";

export async function deleteSection(token: string, id: string): Promise<void> {
  const response = await fetchWrapper(`${section_form}/${id}`, {
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
