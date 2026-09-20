import { DetalheDoEstudante } from "@/dtos/relatorioSimulado/relatorioSimulado";
import fetchWrapper from "@/utils/fetchWrapper";
import { relatorioSimulado } from "../urls";

/**
 * O detalhe de UM estudante num simulado — o que ele marcou, o que era
 * correto, e a classificação de cada questão.
 *
 * ⚠️ **Sem turma no caminho.** O estudante já é identificado por `userId`, e o
 * `cursinhoId` — que é o gate de verdade — sai do JWT do outro lado. Recorte de
 * turma aqui não acrescentaria nada.
 */
export async function buscarDetalheDoEstudante(
  token: string,
  simuladoId: string,
  userId: string,
): Promise<DetalheDoEstudante> {
  const response = await fetchWrapper(
    `${relatorioSimulado}/${simuladoId}/estudante/${userId}`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    },
  );
  if (response.status !== 200) {
    throw new Error("Erro ao buscar o detalhe do estudante");
  }
  return await response.json();
}
