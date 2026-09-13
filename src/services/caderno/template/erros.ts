/**
 * O `409` do publicar carrega a **lista** de erros de lint, não só um texto.
 *
 * ⚠️ Um `Error` comum perde o array — e a tela precisa iterar item por item
 * para o coordenador saber o que consertar no projeto do Overleaf. A api foi
 * construída para preservar essa lista exatamente por isso; achatá-la dentro
 * da string da mensagem joga fora o trabalho do card 12.
 */
export class ErroDeLint extends Error {
  readonly erros: string[];

  constructor(message: string, erros: string[]) {
    super(message);
    this.name = "ErroDeLint";
    this.erros = erros;
  }
}

/**
 * A mensagem que o backend mandou, ou uma genérica.
 *
 * ⚠️ O `try/catch` não é cerimônia: um `502` de proxy reverso devolve HTML, e
 * um `.json()` solto lançaria `SyntaxError` — trocando a mensagem útil por
 * "Unexpected token <". Mesmo cuidado do `baixarCaderno.ts` do card 06.
 */
export async function mensagemDoErro(
  response: Response,
  generica: string,
): Promise<string> {
  const corpo = await corpoJson(response);
  if (typeof corpo?.message === "string" && corpo.message.trim()) {
    return corpo.message;
  }
  return generica;
}

/** O corpo em JSON, ou `null` quando não é JSON (HTML de proxy, corpo vazio). */
export async function corpoJson(
  response: Response,
): Promise<{ message?: unknown; erros?: unknown } | null> {
  try {
    return await response.json();
  } catch {
    return null;
  }
}
