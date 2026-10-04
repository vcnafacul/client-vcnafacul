import { cartaoResposta } from "@/services/urls";
import fetchWrapper from "@/utils/fetchWrapper";

const TEXTO_GENERICO = "Não foi possível excluir o envio";

/**
 * Card 36 — exclui o envio de um cartão mandado para o aluno errado. O
 * estudante volta a "Não enviou" e o cartão certo pode ser enviado.
 *
 * ⚠️ A mensagem do backend é repassada tal e qual, como no
 * `reprocessarCartao`: o 409 diz que a leitura ainda está em andamento, e é a
 * parte acionável ("aguarde terminar").
 */
export async function excluirEnvioDoCartao(
  token: string,
  historicoId: string,
): Promise<void> {
  const response = await fetchWrapper(
    `${cartaoResposta}/${encodeURIComponent(historicoId)}`,
    {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    },
  );
  if (response.ok) return;

  const corpo = (await response.json().catch(() => ({}))) as {
    message?: string;
  };
  throw new Error(corpo.message ?? TEXTO_GENERICO);
}
