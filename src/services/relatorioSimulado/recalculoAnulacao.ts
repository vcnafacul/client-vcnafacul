import type {
  JobDoRecalculo,
  SituacaoDoRecalculo,
} from "@/dtos/relatorioSimulado/relatorioSimulado";
import type { FonteDoRelatorio } from "@/pages/relatorioSimulado/fonteDoRelatorio";
import fetchWrapper from "@/utils/fetchWrapper";
import { caminhoDoRelatorio } from "./buscarRelatorio";

/**
 * tickets/042, card 15: o recálculo por anulação do relatório. ⚠️ Sempre do
 * relatório do CURSINHO (sem turma): o job é do recorte do cursinho, e o
 * `cursinhoId` sai do JWT do outro lado.
 */
const caminho = (fonte: FonteDoRelatorio) =>
  `${caminhoDoRelatorio(fonte)}/recalculo-anulacao`;

export async function consultarRecalculo(
  token: string,
  fonte: FonteDoRelatorio,
): Promise<SituacaoDoRecalculo> {
  const response = await fetchWrapper(caminho(fonte), {
    method: "GET",
    headers: { Authorization: `Bearer ${token}` },
  });
  if (response.status !== 200) throw new Error("Erro ao consultar o recálculo");
  return await response.json();
}

export async function pedirRecalculo(
  token: string,
  fonte: FonteDoRelatorio,
): Promise<{ criado: boolean; job: JobDoRecalculo | null; mensagem?: string }> {
  const response = await fetchWrapper(caminho(fonte), {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
  });
  if (response.status !== 200 && response.status !== 201) {
    throw new Error("Não foi possível pedir o recálculo");
  }
  return await response.json();
}
