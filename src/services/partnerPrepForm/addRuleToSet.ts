import { RuleSetForm } from "@/types/partnerPrepForm/ruleForm";
import fetchWrapper from "@/utils/fetchWrapper";
import { rule_set_form } from "../urls";

export async function addRuleToSet(
  ruleSetId: string,
  ruleId: string,
  token: string
): Promise<RuleSetForm> {
  const response = await fetchWrapper(`${rule_set_form}/add`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ ruleSetId, ruleId }),
  });
  const res = await response.json();
  if (response.status !== 200) {
    if (response.status >= 400) {
      throw res;
    }
  }
  return res;
}
