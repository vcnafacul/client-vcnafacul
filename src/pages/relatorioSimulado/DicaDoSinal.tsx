import { dashV2 } from "@/components/dashV2";
import { cn } from "@/lib/utils";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

/**
 * Quanto tempo o ponteiro precisa ficar parado antes da dica abrir.
 *
 * ⚠️ **300ms.** O `title` nativo leva ~1s e **não é configurável** — nem por
 * CSS, nem por JS. Um segundo é tempo suficiente para a pessoa concluir que não
 * há tooltip nenhum e seguir em frente.
 *
 * ⚠️ E não zero: sem atraso a dica pisca ao arrastar o ponteiro pela tabela, e
 * cinco badges por linha × 25 linhas viram um estroboscópio.
 */
export const ATRASO_MS = 300;

/** Espaço entre o badge e a caixa. */
const FOLGA = 6;

/** Largura da caixa, em px — casa com o `w-72` que ela usava antes. */
const LARGURA = 288;

interface Posicao {
  top: number;
  left: number;
}

/**
 * Onde a caixa cabe, em coordenadas de viewport.
 *
 * ⚠️ **Acima do badge por padrão, abaixo se não couber.** A coluna `Sinais`
 * fica no fim da tabela, e nas primeiras linhas não há espaço acima — a caixa
 * sairia pelo topo da janela.
 *
 * ⚠️ **Alinhada à direita do badge, e presa na borda da janela.** A coluna é a
 * penúltima: uma caixa de 288px crescendo para a direita sairia da tela.
 */
export function posicaoDaDica(
  alvo: DOMRect,
  janela: { largura: number; altura: number },
  altura = 80,
): Posicao {
  const cabeAcima = alvo.top - altura - FOLGA > 0;
  const top = cabeAcima ? alvo.top - altura - FOLGA : alvo.bottom + FOLGA;

  // ⚠️ `Math.max(FOLGA, …)`: em janela estreita o alinhamento à direita jogaria
  // a caixa para fora pela ESQUERDA, trocando um corte por outro.
  const left = Math.max(
    FOLGA,
    Math.min(alvo.right - LARGURA, janela.largura - LARGURA - FOLGA),
  );

  return { top, left };
}

/**
 * A dica que explica um sinal de triagem.
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
export function DicaDoSinal({
  texto,
  marcador,
  children,
}: {
  texto: string;
  /**
   * Vai como `data-flag` no elemento que recebe o hover.
   *
   * ⚠️ **No MESMO elemento que tem os handlers**, e não num wrapper por fora:
   * `mouseEnter` não borbulha, então um `fireEvent.mouseEnter` no pai não
   * aciona nada — e o teste passaria a mirar num filho por posição.
   */
  marcador?: string;
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
      data-flag={marcador}
      className="inline-flex"
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
