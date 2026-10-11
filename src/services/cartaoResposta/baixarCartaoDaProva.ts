import { mensagemDoErro } from "@/services/caderno/baixarCaderno";
import { cartaoResposta } from "@/services/urls";
import fetchWrapper from "@/utils/fetchWrapper";

/**
 * tickets/038 — o cartão DA PROVA (Enem Dia 1/2 do cursinho; no Dia 1, com a marcação de
 * Inglês/Espanhol). O 409 ("todos os simulados precisam estar completos") chega com o motivo.
 */
export async function baixarCartaoDaProva(
  provaId: string,
  token: string,
): Promise<Blob> {
  const response = await fetchWrapper(`${cartaoResposta}/prova/${provaId}`, {
    method: "GET",
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!response.ok) {
    throw new Error(
      await mensagemDoErro(response, "Não foi possível baixar o cartão"),
    );
  }
  return response.blob();
}
