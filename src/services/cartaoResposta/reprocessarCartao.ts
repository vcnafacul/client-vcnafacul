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

  // ⚠️ `ok`, e não uma lista de status: o `@HttpCode(202)` mora no ms; a rota
  // da api herda o 201 padrão do `@Post` e só DOCUMENTA 202 no Swagger. Exigir
  // 202 aqui faria toda troca de foto bem-sucedida aparecer como erro.
  if (response.ok) return;

  const corpo = (await response.json().catch(() => ({}))) as {
    message?: string;
  };
  throw new Error(corpo.message ?? TEXTO_GENERICO);
}
