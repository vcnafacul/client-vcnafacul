import { AdjustmentProposalDto } from "../../dtos/content/adjustmentProposalDto";
import fetchWrapper from "../../utils/fetchWrapper";
import { content } from "../urls";

export async function createProposal(
  contentId: string,
  data: FormData,
  token: string
): Promise<AdjustmentProposalDto> {
  const response = await fetchWrapper(`${content}/${contentId}/proposal`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: data,
  });
  if (response.status === 201 || response.status === 200) {
    return await response.json();
  }
  throw new Error("Erro ao enviar proposta de ajuste");
}

export async function getProposals(
  contentId: string,
  token: string
): Promise<AdjustmentProposalDto[]> {
  const response = await fetchWrapper(`${content}/${contentId}/proposals`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });
  const res = await response.json();
  if (response.status !== 200) {
    throw new Error("Erro ao buscar propostas de ajuste");
  }
  return res;
}

export async function reviewProposal(
  proposalId: string,
  status: number,
  token: string
): Promise<AdjustmentProposalDto> {
  const response = await fetchWrapper(
    `${content}/proposal/${proposalId}/review`,
    {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ status }),
    }
  );
  if (response.status === 200) {
    return await response.json();
  }
  const err = await response.json();
  throw new Error(err.message || "Erro ao revisar proposta");
}
