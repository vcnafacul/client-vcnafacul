import fetchWrapper from "@/utils/fetchWrapper";
import { rule_form } from "../urls";

export async function deleteRule(token: string, id: string): Promise<void> {
  const response = await fetchWrapper(`${rule_form}/${id}`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });
  if (response.status !== 200) {
    throw new Error("Erro ao deletar regra");
  }
}
