import { RuleSetForm } from "@/types/partnerPrepForm/ruleForm";
import fetchWrapper from "@/utils/fetchWrapper";
import { rule_set_form } from "../urls";

export interface CreateRuleSetDtoInput {
  name: string;
  inscriptionId: string;
}

export async function createRuleSet(
  data: CreateRuleSetDtoInput,
  token: string
): Promise<RuleSetForm> {
  const response = await fetchWrapper(rule_set_form, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });
  const res = await response.json();
  if (response.status !== 201) {
    if (response.status >= 400) {
      throw res;
    }
  }
  return res;
}
