import type { ButtonProps } from "@/components/molecules/button";
import type { DashAction } from "./types";

/**
 * Fallback de ações a partir dos `buttons` do `DashCardContext`.
 *
 * ⚠️ **Aproximação, e o ticket `06` existe para desfazê-la.** O `typeStyle` do
 * V1 é escolha de cor, não de papel: em `dashProvas` "Nova Prova" é
 * `quaternary`, "Sincronizar" é `primary` e "Limpar filtros" é `refused` — ou
 * seja, o botão que cria o registro **não** é o primário, e um controle de
 * filtro chega aqui classificado como destrutivo. O fallback traduz o que
 * encontra; ele não conserta a classificação.
 *
 * Serve para a tela subir no V2 com todos os botões presentes e funcionando.
 * Reclassificar é trabalho manual, uma tela por vez.
 */
export interface AcoesDerivadas {
  primary?: DashAction;
  secondary: DashAction[];
}

/**
 * ⚠️ `children` é `ReactNode` e `DashAction.label` é `string` — o rótulo
 * precisa ser texto para caber no tooltip, no `aria-label` e nos testes. Todos
 * os `buttons` de hoje passam string; o dia em que um passar `<span>` o rótulo
 * genérico deixa o botão utilizável e visivelmente errado, que é melhor do que
 * um botão sem nome.
 */
export function rotuloDoBotao(children: React.ReactNode, indice: number): string {
  return typeof children === "string" || typeof children === "number"
    ? String(children)
    : `Ação ${indice + 1}`;
}

function paraAcao(botao: ButtonProps, indice: number): DashAction {
  return {
    // ⚠️ Índice na `key`, e não o rótulo: dois botões podem se chamar igual, e
    // a ordem do array é o que a tela controla.
    id: `acao-${indice}`,
    label: rotuloDoBotao(botao.children, indice),
    disabled: botao.disabled,
    destructive: botao.typeStyle === "refused",
    /**
     * ⚠️ O evento sintético é descartado. `ButtonProps.onClick` é um
     * `MouseEventHandler` e `DashAction.onClick` é `() => void`; nenhum dos
     * `buttons` das nove telas lê o evento. Uma tela que precise dele deve
     * passar `actions` à mão em vez de depender do fallback.
     */
    onClick: () => botao.onClick?.({} as React.MouseEvent<HTMLButtonElement>),
  };
}

/**
 * Primeira ação com `typeStyle: "primary"` vira a principal; o resto vira
 * secundária, na ordem original. `refused` vira `destructive`.
 *
 * ⚠️ **No máximo uma principal**, mesmo que o array traga duas `primary` — é a
 * regra do `tokens.ts`, e o tipo do `DashToolbar` já a torna impossível de
 * burlar. A segunda desce para secundária.
 */
export function deriveActions(buttons?: readonly ButtonProps[]): AcoesDerivadas {
  if (!buttons?.length) return { secondary: [] };

  const indicePrimaria = buttons.findIndex((b) => b.typeStyle === "primary");

  let primary: DashAction | undefined;
  const secondary: DashAction[] = [];

  buttons.forEach((botao, indice) => {
    const acao = paraAcao(botao, indice);
    if (indice === indicePrimaria) primary = acao;
    else secondary.push(acao);
  });

  return { primary, secondary };
}
