import { RelatorioDoSimulado } from "@/dtos/relatorioSimulado/relatorioSimulado";
import fetchWrapper from "@/utils/fetchWrapper";
import type { FonteDoRelatorio } from "@/pages/relatorioSimulado/fonteDoRelatorio";
import { relatorioProva, relatorioSimulado } from "../urls";

/**
 * ⚠️ O recorte é **segmento de caminho**, não query. A api expõe
 * `/:simuladoId` e `/:simuladoId/turma/:turmaId` como rotas distintas, e o
 * `cursinhoId` nunca viaja: sai do JWT do outro lado.
 */
/**
 * ⚠️ `string` é um simuladoId — o formato de antes da prova (tickets/034), que a
 * comparação entre aplicações continua usando.
 */
export function caminhoDoRelatorio(
  fonte: FonteDoRelatorio | string,
  turmaId?: string,
): string {
  const base =
    typeof fonte === "string"
      ? `${relatorioSimulado}/${fonte}`
      : fonte.tipo === "simulado"
        ? `${relatorioSimulado}/${fonte.simuladoId}`
        : `${relatorioProva}/${fonte.provaId}`;
  return turmaId ? `${base}/turma/${turmaId}` : base;
}

export async function buscarRelatorio(
  token: string,
  fonte: FonteDoRelatorio | string,
  turmaId?: string,
): Promise<RelatorioDoSimulado> {
  const response = await fetchWrapper(caminhoDoRelatorio(fonte, turmaId), {
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
