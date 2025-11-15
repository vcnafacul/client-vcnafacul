import fetchWrapper from "../../utils/fetchWrapper";
import { section_form } from "../urls";

export async function updateSection(
  token: string,
  id: string,
  name: string
): Promise<void> {
  const response = await fetchWrapper(`${section_form}/${id}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ name }),
  });
  if (response.status !== 200) {
    const res = await response.json();
    if (response.status >= 400) {
      throw res;
    }
  }
}
