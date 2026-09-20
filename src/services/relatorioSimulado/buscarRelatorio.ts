import { RelatorioDoSimulado } from "@/dtos/relatorioSimulado/relatorioSimulado";
import fetchWrapper from "@/utils/fetchWrapper";
import { relatorioSimulado } from "../urls";

/**
 * ⚠️ O recorte é **segmento de caminho**, não query. A api expõe
 * `/:simuladoId` e `/:simuladoId/turma/:turmaId` como rotas distintas, e o
 * `cursinhoId` nunca viaja: sai do JWT do outro lado.
 */
export function caminhoDoRelatorio(simuladoId: string, turmaId?: string): string {
  return turmaId
    ? `${relatorioSimulado}/${simuladoId}/turma/${turmaId}`
    : `${relatorioSimulado}/${simuladoId}`;
}

export async function buscarRelatorio(
  token: string,
  simuladoId: string,
  turmaId?: string,
): Promise<RelatorioDoSimulado> {
  const response = await fetchWrapper(caminhoDoRelatorio(simuladoId, turmaId), {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });
  if (response.status !== 200) {
    throw new Error("Erro ao buscar o relatório do simulado");
  }
  return await response.json();
}
