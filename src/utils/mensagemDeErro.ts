/**
 * Mensagem de erro para o toast de uma ação (tickets-documentacao, card 07).
 *
 * - 403 → "Você não tem permissão para <ação>.", em vez de um "tente novamente"
 *   que convida a insistir;
 * - outro 4xx com mensagem do servidor → a mensagem dele;
 * - resto (5xx, rede) → o texto padrão da tela.
 *
 * Aceita o corpo de erro do Nest (`statusCode`, `message`) que os serviços
 * lançam, ou um erro com `status`.
 */
export function mensagemDeErro(
  erro: unknown,
  acao: string,
  padrao: string,
): string {
  const e = (erro ?? {}) as {
    status?: number;
    statusCode?: number;
    message?: string | string[];
  };
  const status = e.status ?? e.statusCode;
  if (status === 403) return `Você não tem permissão para ${acao}.`;
  const mensagem = Array.isArray(e.message) ? e.message.join(" ") : e.message;
  if (status && status >= 400 && status < 500 && mensagem) return mensagem;
  return padrao;
}
