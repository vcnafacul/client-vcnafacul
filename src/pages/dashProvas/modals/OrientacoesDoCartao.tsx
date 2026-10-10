import { ArrowTopRightOnSquareIcon } from "@heroicons/react/24/outline";

/**
 * O relatório do teste de leitura do cartão (docs, Equipe do projeto), de onde saem estas
 * orientações. ⚠️ Se a página mudar de lugar, trocar só aqui.
 */
export const LINK_SABER_MAIS_LEITURA =
  "https://vcnafacul.github.io/docs/projeto/relatorio-leitura-cartao/";

export const TITULO_ORIENTACOES = "Para a leitura do cartão dar certo";

/**
 * As orientações vêm do teste de leitura em homologação (out/2026): com caneta, bolinha
 * pintada e cartão em pé, a leitura acertou 100%; o lápis ficou em 39%; risco e check quase
 * nunca são lidos; foto comum ou digitalizada deu o mesmo resultado.
 *
 * ⚠️ Texto curto de propósito: é lido por quem vai imprimir o cartão e por quem vai fotografar,
 * na hora de fazer — o detalhe fica no "Saber mais".
 */
export const ORIENTACOES = [
  {
    titulo: "Caneta preta ou azul",
    texto: "Lápis não serve: no teste, só 4 em cada 10 marcações a lápis foram lidas.",
  },
  {
    titulo: "Pinte a bolinha inteira",
    texto:
      "Pode passar da borda. Risco, ✓ e X não são lidos com segurança.",
  },
  {
    titulo: "Fotografe o cartão em pé",
    texto:
      "Inteiro, com os 4 quadradinhos dos cantos aparecendo. Foto comum ou digitalizada, tanto faz.",
  },
  {
    titulo: "Confira o relatório",
    texto:
      "Questão que não deu para ler aparece como \"sem leitura\": é lá que você vê se precisa reenviar a foto.",
  },
] as const;

/**
 * O mesmo bloco nos dois momentos do cartão: antes de baixar (para orientar a aplicação) e
 * no envio (para orientar a foto). Um componente só, para os dois nunca dizerem coisas
 * diferentes.
 */
export function OrientacoesDoCartao({ resumo }: { resumo?: string }) {
  return (
    <section
      aria-labelledby="titulo-orientacoes-cartao"
      data-testid="orientacoes-do-cartao"
      className="space-y-2 rounded-md border border-blue-200 bg-blue-50 p-3 text-sm text-gray-800"
    >
      <h3 id="titulo-orientacoes-cartao" className="font-semibold text-marine">
        {TITULO_ORIENTACOES}
      </h3>
      {resumo && <p className="text-gray-700">{resumo}</p>}
      <ul className="space-y-1.5">
        {ORIENTACOES.map((o) => (
          <li key={o.titulo} className="flex gap-2">
            <span aria-hidden className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-marine" />
            <span>
              <strong>{o.titulo}.</strong> {o.texto}
            </span>
          </li>
        ))}
      </ul>
      <a
        href={LINK_SABER_MAIS_LEITURA}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-1 font-medium text-marine underline underline-offset-2"
      >
        Saber mais
        <ArrowTopRightOnSquareIcon className="h-4 w-4" aria-hidden />
        <span className="sr-only">(abre em nova aba)</span>
      </a>
    </section>
  );
}
