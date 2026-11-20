import { fireEvent, screen } from "@testing-library/react";

/**
 * Abre um Select/Combobox do Radix pelo gatilho (teclado: o jsdom não tem ponteiro de verdade)
 * e escolhe a opção pelo nome acessível.
 */
export function escolherOpcao(gatilho: HTMLElement, opcao: string | RegExp) {
  fireEvent.keyDown(gatilho, { key: "Enter" });
  fireEvent.click(screen.getByRole("option", { name: opcao }));
}
