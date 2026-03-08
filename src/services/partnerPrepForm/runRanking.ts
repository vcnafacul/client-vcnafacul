import { RankingOutput } from "@/types/partnerPrepForm/ruleForm";
import fetchWrapper from "@/utils/fetchWrapper";
import { rule_set_form } from "../urls";

export async function runRanking(
  ruleSetId: string,
  users: string[],
  token: string
): Promise<RankingOutput> {
  const response = await fetchWrapper(`${rule_set_form}/ranking`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ ruleSetId, users }),
  });
  const res = await response.json();
  if (response.status !== 201 && response.status !== 200) {
    throw new Error(res.message || "Erro ao calcular ranking");
  }
  return res;
}
