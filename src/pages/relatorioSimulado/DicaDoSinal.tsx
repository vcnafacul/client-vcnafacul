import { dashV2 } from "@/components/dashV2";
import { cn } from "@/lib/utils";

/**
 * Quanto tempo o ponteiro precisa ficar parado antes da dica abrir.
 *
 * ⚠️ **300ms, e o número importa.** O `title` nativo do navegador leva ~1s e
 * **não é configurável** — nem por CSS, nem por JS. Um segundo é tempo
 * suficiente para a pessoa concluir que não há tooltip nenhum e seguir em
 * frente, que foi exatamente o que aconteceu na revisão.
 *
 * ⚠️ E não zero: sem nenhum atraso, a dica pisca ao arrastar o ponteiro pela
 * tabela, e cinco badges por linha × 25 linhas viram um estroboscópio.
 */
const ATRASO_MS = 300;

/**
 * A dica que explica um sinal de triagem.
 *
 * ⚠️ **CSS puro, e NÃO o `Tooltip` do Radix.** O `DashToolbar.test.tsx`
 * documenta, com medição, que o Radix Popper degrada o jsdom de forma
 * progressiva — 22 testes levam 51s por isso e tiveram de sair do CI. Aqui
 * seriam até 5 badges × 25 linhas = 125 montagens, e a suíte já estoura o RPC
 * do vitest desde o card 07. `group-hover` + `transition-delay` entrega o mesmo
 * efeito com zero JavaScript e zero custo de teste.
 *
 * ⚠️ **Substitui o `title`, não soma a ele** — os dois juntos dariam duas
 * caixas de texto sobre o mesmo badge, uma com 300ms e outra com 1s.
 *
 * ⚠️ **Abre para a ESQUERDA** (`right-0`): a coluna `Sinais` é a penúltima da
 * tabela, e uma caixa de 18rem crescendo para a direita sairia da tela.
 *
 * ⚠️ **`pointer-events-none`**: sem isso a própria dica fica sob o ponteiro ao
 * abrir para cima, o `hover` do badge se perde e ela pisca.
 *
 * ⚠️ **`print:hidden`**: numa folha impressa não há ponteiro, e a caixa
 * apareceria sobre a linha seguinte.
 */
export function DicaDoSinal({
  texto,
  children,
}: {
  texto: string;
  children: React.ReactNode;
}) {
  return (
    <span className="group relative inline-flex">
      {children}
      <span
        role="tooltip"
        style={{ transitionDelay: `${ATRASO_MS}ms` }}
        className={cn(
          "pointer-events-none absolute bottom-full right-0 z-20 mb-1 w-72",
          "rounded-md border px-3 py-2 text-xs font-normal shadow-lg",
          "opacity-0 transition-opacity group-hover:opacity-100",
          // ⚠️ `focus-within` para quem navega por teclado — sem `tabIndex`
          // próprio, que acrescentaria 125 paradas de tab nesta tabela.
          "group-focus-within:opacity-100",
          "print:hidden",
          dashV2.surface,
          dashV2.border,
          dashV2.text.secondary,
        )}
      >
        {texto}
      </span>
    </span>
  );
}
