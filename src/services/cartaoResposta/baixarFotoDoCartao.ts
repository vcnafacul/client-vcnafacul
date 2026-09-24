import { cartaoResposta } from "@/services/urls";
import fetchWrapper from "@/utils/fetchWrapper";

/**
 * A foto do cartão enviado — o botão do modal do estudante no relatório.
 *
 * ⚠️ 404 é "não há foto para baixar" (histórico de outro cursinho, ou feito
 * pela tela, sem cartão). O texto diz isso, e não um "erro" genérico.
 */
export async function baixarFotoDoCartao(
  token: string,
  historicoId: string,
): Promise<Blob> {
  const response = await fetchWrapper(
    `${cartaoResposta}/${encodeURIComponent(historicoId)}/imagem`,
    {
      method: "GET",
      headers: { Authorization: `Bearer ${token}` },
    },
  );
  if (response.status === 404) {
    throw new Error("Não há foto do cartão para este estudante.");
  }
  if (!response.ok) {
    throw new Error("Não foi possível baixar a foto do cartão.");
  }
  return await response.blob();
}
