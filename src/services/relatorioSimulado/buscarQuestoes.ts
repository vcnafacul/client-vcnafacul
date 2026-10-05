import { QuestoesDoRelatorio } from "@/dtos/relatorioSimulado/relatorioSimulado";
import fetchWrapper from "@/utils/fetchWrapper";
import type { FonteDoRelatorio } from "@/pages/relatorioSimulado/fonteDoRelatorio";
import { caminhoDoRelatorio } from "./buscarRelatorio";

export async function buscarQuestoes(
  token: string,
  fonte: FonteDoRelatorio | string,
  turmaId?: string,
): Promise<QuestoesDoRelatorio> {
  const response = await fetchWrapper(
    `${caminhoDoRelatorio(fonte, turmaId)}/questoes`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    },
  );
  if (response.status !== 200) {
    throw new Error("Erro ao buscar o desempenho por questão");
  }
  return await response.json();
}
