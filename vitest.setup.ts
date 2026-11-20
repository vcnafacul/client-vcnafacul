import "@testing-library/jest-dom/vitest";
import { cleanup } from "@testing-library/react";
import { afterEach } from "vitest";

// Sem `globals: true`, o Testing Library não registra o cleanup automático e o
// DOM de um teste vaza para o seguinte — queries por `document.querySelector`
// passam a enxergar elementos do teste anterior.
afterEach(() => {
  cleanup();
});

// O floating-ui (usado pelo Radix em Popover, Tooltip, DropdownMenu e Select) pergunta
// `el.matches(":popover-open")` e `el.matches(":modal")` para detectar top layer. O nwsapi do
// jsdom não conhece essas pseudo-classes e cai numa recursão que leva ~250 ms por chamada, o que
// deixa o worker ocupado a ponto de estourar o RPC do vitest (`Timeout calling "onTaskUpdate"`).
// O Radix faz portal para uma div comum (sem popover nativo nem `showModal`), então um navegador
// real também responde `false`: o stub é fiel. Todo o resto delega ao original, com o `this`.
// Ver tickets/059.
// Alguns arquivos rodam em `@vitest-environment node`, onde `Element` não existe.
if (typeof Element !== "undefined") {
  const matchesOriginal = Element.prototype.matches;
  Element.prototype.matches = function (this: Element, seletor: string) {
    if (seletor === ":popover-open" || seletor === ":modal") return false;
    return matchesOriginal.call(this, seletor);
  };
}
