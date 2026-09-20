import type { StatusV2 } from "@/components/dashV2";
import type { LinhaDoRelatorio } from "@/dtos/relatorioSimulado/relatorioSimulado";

export interface StatusVisualDaLinha {
  tone: StatusV2;
  label: string;
  /**
   * A posição da linha quando se ordena por Status — **não** é o rótulo.
   *
   * ⚠️ Ordenar pelo `label` dá ordem alfabética ("Aguardando" < "Falhou" <
   * "Lido" < "Não enviou"), que não é ordem nenhuma para quem usa a tela. Aqui
   * a ordem é a do trabalho do coordenador: primeiro o que ele tem de
   * consertar (falhou), depois o que ele espera (aguardando), depois quem ele
   * tem de cobrar (não enviou), e por último o que já está resolvido (lido).
   */
  ordem: number;
}

/** Só para dar nome aos números do `ordem` — ver o docblock acima. */
const ORDEM = {
  falhou: 0,
  aguardando: 1,
  naoEnviou: 2,
  lido: 3,
  /** ⚠️ Por último: status que o client não conhece não é ação que alguém possa tomar. */
  desconhecido: 4,
} as const;

/**
 * O status de uma linha do relatório, em tom e rótulo.
 *
 * ⚠️ Pura de propósito: montar Radix no jsdom custa caro neste projeto, e
 * lógica de status é justamente o que não precisa de DOM para ser verificada.
 * Mesmo padrão do `statusVisual` em `dashProvas/modals/simuladoStatus.ts`.
 */
export function statusDaLinha(linha: LinhaDoRelatorio): StatusVisualDaLinha {
  // ⚠️ `enviouCartao` primeiro, e explícito. Inferir "não enviou" da ausência
  // de `historicoId` é o que a api evitou mandando o campo.
  if (!linha.enviouCartao) {
    return { tone: "neutral", label: "Não enviou", ordem: ORDEM.naoEnviou };
  }

  switch (linha.status) {
    case "completed":
      return { tone: "done", label: "Lido", ordem: ORDEM.lido };
    case "failed":
      return { tone: "missing", label: "Falhou", ordem: ORDEM.falhou };
    case "awaiting_omr":
    case "pending":
    case "processing":
      return { tone: "running", label: "Aguardando leitura", ordem: ORDEM.aguardando };
    default:
      // ⚠️ O ms pode ganhar um status antes do client. Rótulo honesto em vez
      // de linha quebrada — e nunca "Lido", que afirmaria o que não se sabe.
      return {
        tone: "neutral",
        label: "Situação desconhecida",
        ordem: ORDEM.desconhecido,
      };
  }
}
