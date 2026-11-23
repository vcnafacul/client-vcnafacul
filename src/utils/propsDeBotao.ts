import type { KeyboardEvent, MouseEvent } from "react";

/**
 * Props para um contêiner clicável (`div`/`span`) que não pode virar `<button>`
 * (layout, filhos em bloco). Expõe o papel de botão, entra na ordem de tabulação
 * e ativa com Enter ou Espaço, como um botão nativo. Só reage à tecla quando o foco
 * está no próprio contêiner, para não roubar a tecla de um controle interno.
 */
export function propsDeBotao(onAtivar: () => void) {
  return {
    role: "button" as const,
    tabIndex: 0,
    onClick: (_e: MouseEvent) => onAtivar(),
    onKeyDown: (e: KeyboardEvent) => {
      if (e.target !== e.currentTarget) return;
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        onAtivar();
      }
    },
  };
}
