import type { StatusV2 } from "@/components/dashV2";
import type { LinhaDoRelatorio } from "@/dtos/relatorioSimulado/relatorioSimulado";

export interface StatusVisualDaLinha {
  tone: StatusV2;
  label: string;
}

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
    return { tone: "neutral", label: "Não enviou" };
  }

  switch (linha.status) {
    case "completed":
      return { tone: "done", label: "Lido" };
    case "failed":
      return { tone: "missing", label: "Falhou" };
    case "awaiting_omr":
    case "pending":
    case "processing":
      return { tone: "running", label: "Aguardando leitura" };
    default:
      // ⚠️ O ms pode ganhar um status antes do client. Rótulo honesto em vez
      // de linha quebrada — e nunca "Lido", que afirmaria o que não se sabe.
      return { tone: "neutral", label: "Situação desconhecida" };
  }
}
