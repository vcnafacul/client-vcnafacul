import type { KeyboardEvent, MouseEvent } from "react";

/**
 * Props para um contêiner clicável (`div`/`span`) que não pode virar `<button>`
 * (layout, filhos em bloco). Expõe o papel de botão, entra na ordem de tabulação
 * e ativa como um botão nativo: Enter no `keydown` (sem repetir ao segurar) e
 * Espaço no `keyup`. Só reage quando o foco está no próprio contêiner, para não
 * roubar a tecla de um controle interno.
 */
export function propsDeBotao(onAtivar: () => void) {
  return {
    role: "button" as const,
    tabIndex: 0,
    onClick: (_e: MouseEvent) => onAtivar(),
    onKeyDown: (e: KeyboardEvent) => {
      if (e.target !== e.currentTarget) return;
      if (e.key === "Enter") {
        e.preventDefault();
        if (!e.repeat) onAtivar();
      } else if (e.key === " ") {
        // Evita rolar a página; a ativação vem no keyup.
        e.preventDefault();
      }
    },
    onKeyUp: (e: KeyboardEvent) => {
      if (e.target !== e.currentTarget) return;
      if (e.key === " ") onAtivar();
    },
  };
}
