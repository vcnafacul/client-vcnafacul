import { RuleForm } from "@/types/partnerPrepForm/ruleForm";
import fetchWrapper from "@/utils/fetchWrapper";
import { Paginate } from "@/utils/paginate";
import { rule_form } from "../urls";

export async function getRules(token: string): Promise<Paginate<RuleForm>> {
  const response = await fetchWrapper(rule_form, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });
  const res = await response.json();
  if (response.status !== 200) {
    throw new Error("Erro ao buscar regras");
  }
  return res;
}
