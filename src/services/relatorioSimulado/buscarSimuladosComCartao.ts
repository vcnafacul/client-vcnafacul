import { SimuladosComCartao } from "@/dtos/relatorioSimulado/relatorioSimulado";
import fetchWrapper from "@/utils/fetchWrapper";
import { relatorioSimulado } from "../urls";

/**
 * Quais simulados do cursinho — ou de uma turma dele — têm cartão enviado.
 * O card `04b`.
 *
 * ⚠️ Exige `gerenciarEstudantes` e um colaborador com cursinho: chamar sem isso
 * devolve 403. Ver os gates em `simuladosView` e na aba da tela de turma.
 *
 * ⚠️ `turmaId` é **segmento de caminho**, nunca query — a api expõe as duas
 * como rotas distintas. E o `cursinhoId` não viaja: sai do JWT do outro lado.
 */
export async function buscarSimuladosComCartao(
  token: string,
  turmaId?: string,
): Promise<SimuladosComCartao> {
  // ⚠️ `||`, não `??`: string vazia tem que cair no recorte do cursinho, senão
  // a URL vira `/simulados/turma/`, que não é rota nenhuma. Mesma armadilha do
  // `?turma=` vazio na rota do relatório.
  const caminho = turmaId
    ? `${relatorioSimulado}/simulados/turma/${turmaId}`
    : `${relatorioSimulado}/simulados`;

  const response = await fetchWrapper(caminho, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });
  if (response.status !== 200) {
    throw new Error("Erro ao buscar os simulados com cartão");
  }
  return await response.json();
}
