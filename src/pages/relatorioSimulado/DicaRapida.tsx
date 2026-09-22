import { dashV2 } from "@/components/dashV2";
import { cn } from "@/lib/utils";
import { useEffect, useRef, useState } from "react";
import { ATRASO_MS, LARGURA, posicaoDaDica, type Posicao } from "./posicaoDaDica";
import { createPortal } from "react-dom";

/**
 * Uma dica que abre rápido no hover.
 *
 * ⚠️ **Genérica de propósito** — nasceu para os badges de triagem e serve
 * qualquer coisa que hoje usaria `title`: a barra de distribuição, o realce de
 * matéria abaixo da média, as faixas do histograma. Um componente por lugar
 * daria quatro atrasos diferentes para o mesmo gesto.
 *
 * ⚠️ **`position: fixed` num PORTAL, e não `absolute` dentro da célula.** A
 * primeira versão usava `absolute`, e a caixa ficava **cortada**: o `DashTable`
 * embrulha toda célula não-primária num `span.block.truncate`, e `truncate`
 * inclui `overflow: hidden`. Nenhum `z-index` resolve isso — o `overflow` corta
 * antes de o empilhamento entrar na conta.
 *
 * É o mesmo mecanismo que o card 19 encontrou no motivo da falha, por outra
 * propriedade do mesmo `truncate` (lá era o `white-space: nowrap`).
 *
 * ⚠️ **Portal para o `body`**, e não só `fixed`: `position: fixed` ainda é
 * contido por ancestral com `transform`, `filter` ou `will-change`. O portal
 * elimina a classe inteira de problemas em vez de depender de nenhum ancestral
 * ganhar uma dessas no futuro.
 *
 * ⚠️ **CSS puro para o atraso, e NÃO o `Tooltip` do Radix.** O
 * `DashToolbar.test.tsx` documenta, com medição, que o Radix Popper degrada o
 * jsdom progressivamente — 22 testes levam 51s e tiveram de sair do CI. Aqui
 * seriam até 125 montagens.
 */
export function DicaRapida({
  texto,
  marcador,
  className,
  children,
}: {
  texto: string;
  /**
   * Vai como `data-dica` no elemento que recebe o hover.
   *
   * ⚠️ **No MESMO elemento que tem os handlers**, e não num wrapper por fora:
   * `mouseEnter` não borbulha, então um `fireEvent.mouseEnter` no pai não
   * aciona nada — e o teste passaria a mirar num filho por posição.
   */
  marcador?: string;
  /**
   * Classes do elemento que embrulha o conteúdo.
   *
   * ⚠️ **Existe porque este wrapper ENTRA no layout de quem o usa.** Ele é um
   * `inline-flex`, e ao envolver um filho que dependia de `flex-1` ou `w-full`
   * do container original, quebra a conta: o filho passa a medir 100% de um
   * wrapper que encolheu até o conteúdo. Foi o que aconteceu com a barra de
   * distribuição e com as faixas do histograma — as duas encolheram.
   *
   * Quem envolve um elemento elástico precisa repassar o `flex-1` para cá.
   */
  className?: string;
  children: React.ReactNode;
}) {
  const alvo = useRef<HTMLSpanElement>(null);
  const [posicao, setPosicao] = useState<Posicao | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  /*
    ⚠️ **O atraso é em JS, e não `transition-delay`.** A primeira versão usava
    CSS — mas com o portal o elemento só NASCE no hover, e uma transição de
    opacidade precisa de um frame com o valor inicial para animar. Montado já
    em `opacity-100`, o atraso simplesmente não existiria: a caixa apareceria
    na hora.

    Com `setTimeout` o atraso é o que está escrito, e dá para testá-lo.
  */
  const abrir = () => {
    cancelar();
    timer.current = setTimeout(() => {
      const r = alvo.current?.getBoundingClientRect();
      if (!r) return;
      setPosicao(
        posicaoDaDica(r, {
          largura: window.innerWidth,
          altura: window.innerHeight,
        }),
      );
    }, ATRASO_MS);
  };

  /*
    ⚠️ Cancela o disparo pendente ao sair, e no desmonte: sem isso, atravessar
    a tabela rápido abre uma caixa 300ms depois de o ponteiro já ter ido embora
    — e trocar de página com o timer vivo chama `setPosicao` num componente que
    não existe mais.
  */
  const cancelar = () => {
    if (timer.current !== null) clearTimeout(timer.current);
    timer.current = null;
  };

  const fechar = () => {
    cancelar();
    setPosicao(null);
  };

  useEffect(() => cancelar, []);

  return (
    <span
      ref={alvo}
      data-dica={marcador}
      className={cn("inline-flex", className)}
      onMouseEnter={abrir}
      onMouseLeave={fechar}
      /* ⚠️ Teclado: o badge não é focável, mas o `focus` sobe de qualquer coisa
         focável dentro dele — e se um dia houver, a dica acompanha. */
      onFocus={abrir}
      onBlur={fechar}
    >
      {children}
      {posicao !== null &&
        createPortal(
          <span
            role="tooltip"
            data-dica-do-sinal
            style={{
              top: posicao.top,
              left: posicao.left,
              width: LARGURA,
            }}
            className={cn(
              // ⚠️ `fixed`: o portal o tira da tabela, e as coordenadas são de
              // viewport — é o que faz `overflow: hidden` de ancestral parar de
              // importar.
              "pointer-events-none fixed z-50",
              "rounded-md border px-3 py-2 text-xs font-normal shadow-lg",
              "print:hidden",
              dashV2.surface,
              dashV2.border,
              dashV2.text.secondary,
            )}
          >
            {texto}
          </span>,
          document.body,
        )}
    </span>
  );
}
