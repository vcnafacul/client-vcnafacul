import { RuleSetForm } from "@/types/partnerPrepForm/ruleForm";
import fetchWrapper from "@/utils/fetchWrapper";
import { Paginate } from "@/utils/paginate";
import { rule_set_form } from "../urls";

export async function getRuleSets(
  token: string
): Promise<Paginate<RuleSetForm>> {
  const response = await fetchWrapper(rule_set_form, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });
  const res = await response.json();
  if (response.status !== 200) {
    throw new Error("Erro ao buscar conjuntos de regras");
  }
  return res;
}
