import { RankingOutput } from "@/types/partnerPrepForm/ruleForm";
import fetchWrapper from "@/utils/fetchWrapper";
import { rule_set_form } from "../urls";

export async function getLastRanking(
  ruleSetId: string,
  token: string
): Promise<RankingOutput | null> {
  const response = await fetchWrapper(
    `${rule_set_form}/${ruleSetId}/last-ranking`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
  if (response.status === 204 || response.status === 404) {
    return null;
  }
  const res = await response.json();
  if (response.status !== 200) {
    throw new Error(res.message || "Erro ao buscar último ranking");
  }
  return res;
}
