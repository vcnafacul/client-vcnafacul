import fetchWrapper from "@/utils/fetchWrapper";
import { rule_set_form } from "../urls";

export async function deleteRuleSet(
  token: string,
  id: string
): Promise<void> {
  const response = await fetchWrapper(`${rule_set_form}/${id}`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });
  if (response.status !== 200) {
    throw new Error("Erro ao deletar conjunto de regras");
  }
}
