/**
 * As abas da tela de turma, e como elas viajam na URL.
 *
 * ⚠️ **Existe porque as duas metades da mesma pergunta viviam em abas que não
 * se conheciam** (card 17). "A turma melhorou?" é a aba Desempenho; "como foi
 * neste simulado?" é a aba Simulados por cartão — e o relatório também abre
 * numa rota própria, fora desta tela. Sem a aba na URL, nenhum dos três lugares
 * consegue mandar a pessoa para o outro.
 *
 * ⚠️ **Query, e não segmento de rota.** A rota da turma é
 * `/dashboard/{PARTNER_CLASS}/:hashClassId` e é usada em link, em favorito e no
 * "voltar" do card 18 — transformar a aba em segmento quebraria os três.
 */
export const ABAS = ["alunos", "desempenho", "simulados"] as const;

export type AbaDaTurma = (typeof ABAS)[number];

export const ABA_PADRAO: AbaDaTurma = "alunos";

export const PARAM_DA_ABA = "aba";

/**
 * A aba pedida na URL, ou o padrão.
 *
 * ⚠️ **Valor desconhecido cai no padrão, em vez de deixar o `Tabs` sem
 * conteúdo.** O Radix aceita qualquer string em `value` e renderiza uma tela
 * vazia quando nenhum `TabsContent` casa — um link velho com `?aba=notas`
 * levaria a pessoa a uma página em branco sem erro nenhum.
 */
export function abaDaUrl(busca: string): AbaDaTurma {
  const pedida = new URLSearchParams(busca).get(PARAM_DA_ABA);
  return ABAS.includes(pedida as AbaDaTurma)
    ? (pedida as AbaDaTurma)
    : ABA_PADRAO;
}

/**
 * O caminho da turma já apontando para uma aba.
 *
 * ⚠️ Sem a aba padrão na URL: `?aba=alunos` é ruído num link que a pessoa pode
 * copiar, e o `abaDaUrl` já devolve `alunos` na ausência do parâmetro.
 */
export function caminhoDaTurma(
  base: string,
  turmaId: string,
  aba: AbaDaTurma = ABA_PADRAO,
): string {
  const caminho = `${base}/${turmaId}`;
  return aba === ABA_PADRAO ? caminho : `${caminho}?${PARAM_DA_ABA}=${aba}`;
}
