import { RuleForm } from "@/types/partnerPrepForm/ruleForm";
import fetchWrapper from "@/utils/fetchWrapper";
import { rule_form } from "../urls";

export interface CreateRuleDtoInput {
  name: string;
  description: string;
  type: string;
  strategy?: string;
  questionId?: string;
  config: any;
  weight?: number;
}

export async function createRule(
  data: CreateRuleDtoInput,
  token: string
): Promise<RuleForm> {
  const response = await fetchWrapper(rule_form, {
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
