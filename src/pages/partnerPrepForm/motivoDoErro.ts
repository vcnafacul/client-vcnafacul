/**
 * O motivo que o servidor deu, para o toast (tickets-documentacao, card 26).
 *
 * Os services do formulário lançam o corpo de erro do Nest (`statusCode`,
 * `message` — às vezes uma lista), que não é `Error`: os modais caíam sempre
 * no texto fixo ("Erro ao criar questão") e o motivo útil — opção repetida,
 * questão de referência inativa, questões faltando — nunca chegava.
 * Erro 5xx ou de rede fica com o texto padrão.
 */
export function motivoDoErro(erro: unknown, padrao: string): string {
  const e = (erro ?? {}) as {
    statusCode?: number;
    status?: number;
    message?: string | string[];
  };
  const status = e.statusCode ?? e.status;
  if (status && status >= 500) return padrao;
  const mensagem = Array.isArray(e.message) ? e.message.join(" ") : e.message;
  if (!mensagem || mensagem === "Failed to fetch") return padrao;
  return mensagem;
}
