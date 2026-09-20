import { QuestoesDoRelatorio } from "@/dtos/relatorioSimulado/relatorioSimulado";
import fetchWrapper from "@/utils/fetchWrapper";
import { caminhoDoRelatorio } from "./buscarRelatorio";

export async function buscarQuestoes(
  token: string,
  simuladoId: string,
  turmaId?: string,
): Promise<QuestoesDoRelatorio> {
  const response = await fetchWrapper(
    `${caminhoDoRelatorio(simuladoId, turmaId)}/questoes`,
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
