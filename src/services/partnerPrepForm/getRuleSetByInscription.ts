import { RuleSetForm } from "@/types/partnerPrepForm/ruleForm";
import fetchWrapper from "@/utils/fetchWrapper";
import { rule_set_form } from "../urls";

export async function getRuleSetByInscription(
  inscriptionId: string,
  token: string
): Promise<RuleSetForm> {
  const response = await fetchWrapper(
    `${rule_set_form}/by-inscription/${inscriptionId}`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    }
  );
  const res = await response.json();
  if (response.status !== 200) {
    throw new Error("Erro ao buscar conjunto de regras da inscrição");
  }
  return res;
}
