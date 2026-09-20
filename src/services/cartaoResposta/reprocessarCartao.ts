import { cartaoResposta } from "@/services/urls";
import fetchWrapper from "@/utils/fetchWrapper";

const TEXTO_GENERICO = "Não foi possível reprocessar o cartão";

/**
 * Pede nova leitura de um cartão que falhou, com ou sem foto nova.
 *
 * ⚠️ **A mensagem do backend é repassada tal e qual.** Ela carrega o motivo
 * (outro cartão, outro simulado) e, na janela entre tentativas, o tempo que
 * falta. Trocar por um texto genérico apagaria justamente a parte acionável —
 * um "429" sem número manda a pessoa tentar de novo na hora, e de novo.
 *
 * ⚠️ E o repasse vale para **qualquer** recusa, não só 400 e 409: o 413 do
 * limite de 8 MB (foto de celular passa disso) e o 502 do OMR fora também
 * dizem o que houve. O texto genérico é só o fundo do poço, para respostas
 * sem corpo JSON.
 */
export async function reprocessarCartao(
  token: string,
  historicoId: string,
  file?: File,
): Promise<void> {
  const formData = new FormData();
  if (file) formData.append("file", file);

  const response = await fetchWrapper(
    `${cartaoResposta}/${encodeURIComponent(historicoId)}/reprocessar`,
    {
      method: "POST",
      // sem Content-Type → browser põe o multipart boundary
      headers: { Authorization: `Bearer ${token}` },
      body: formData,
    },
  );

  // ⚠️ `ok`, e não uma lista de status. A api hoje devolve 202, mas isso já foi
  // 201: a rota nasceu como `@Post` pelado, herdando o padrão do Nest, e só
  // DOCUMENTAVA 202 no Swagger — um contrato que mentia, e que fazia uma lista
  // de status transformar toda troca bem-sucedida em erro. O `@HttpCode(202)`
  // consertou o backend; este `ok` é o que impede a tela de depender disso.
  if (response.ok) return;

  const corpo = (await response.json().catch(() => ({}))) as {
    message?: string;
  };
  throw new Error(corpo.message ?? TEXTO_GENERICO);
}
