import { caderno } from "@/services/urls";
import fetchWrapper from "@/utils/fetchWrapper";

/**
 * Baixa o zip do caderno de questões.
 *
 * ⚠️ Usa `fetchWrapper`, e não `fetch` cru como o `baixarCartao` ao lado. O
 * wrapper renova o token expirado e refaz a chamada; sem ele, um token vencido
 * vira `401` e o usuário lê "erro ao baixar" sem saber que bastava recarregar
 * a página.
 *
 * Vale mais aqui do que no cartão: gerar o caderno é mais lento — ele resolve
 * as imagens, e as externas passam por rede de terceiro — então há mais janela
 * para o token virar no meio. E os outros dois serviços da pasta do cartão
 * (`uploadCartao`, `buscarResultados`) já usam o wrapper.
 */
export async function baixarCaderno(
  simuladoId: string,
  token: string,
  draft = false,
): Promise<{ blob: Blob; avisos: number }> {
  const response = await fetchWrapper(
    `${caderno}/${simuladoId}${draft ? "?draft=true" : ""}`,
    {
      method: "GET",
      headers: { Authorization: `Bearer ${token}` },
    },
  );

  // ⚠️ Sucesso é binário, erro é JSON, e o corpo só pode ser lido UMA vez.
  // A decisão é pelo `response.ok`, antes de tocar no corpo: ler o errado
  // consome o stream e o download quebra.
  if (!response.ok) {
    throw new Error(await mensagemDoErro(response));
  }

  const avisos = Number(response.headers.get("X-Caderno-Avisos") ?? 0);
  return { blob: await response.blob(), avisos: Number.isNaN(avisos) ? 0 : avisos };
}

/**
 * A mensagem que o backend mandou, ou uma genérica.
 *
 * ⚠️ O `try/catch` não é cerimônia: um `502` de proxy reverso devolve HTML, e
 * um `.json()` solto lançaria `SyntaxError` — trocando a mensagem útil por
 * "Unexpected token <".
 *
 * ⚠️ Propagar a mensagem do backend é o ponto. O card 05 gastou uma task
 * inteira para o `409` chegar legível até aqui ("simulado não está pronto…");
 * descartá-la e mostrar "erro ao baixar" anula aquele trabalho.
 */
async function mensagemDoErro(response: Response): Promise<string> {
  try {
    const corpo = await response.json();
    if (typeof corpo?.message === "string" && corpo.message.trim()) {
      return corpo.message;
    }
  } catch {
    // corpo vazio ou não-JSON: cai na genérica
  }
  return "Não foi possível baixar o caderno";
}
