import fetchWrapper from "@/utils/fetchWrapper";
import { rule_form } from "../urls";

export async function updateRule(
  id: string,
  data: any,
  token: string
): Promise<void> {
  const response = await fetchWrapper(`${rule_form}/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });
  if (response.status !== 200) {
    const res = await response.json();
    throw res;
  }
}
