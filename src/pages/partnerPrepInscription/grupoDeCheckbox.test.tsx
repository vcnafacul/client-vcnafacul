import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { GrupoDeCheckbox } from "./grupoDeCheckbox";

describe("GrupoDeCheckbox", () => {
  it("é um grupo com a pergunta como nome, obrigatório e com o erro ligado", () => {
    render(
      <GrupoDeCheckbox
        legenda="Você recebe algum auxílio?"
        required
        error="Selecione pelo menos uma opção"
        opcoes={["A", "B"]}
        onValueChange={vi.fn()}
      />,
    );
    // `aria-required` não vale em `group`: o obrigatório vai no texto da legenda.
    const grupo = screen.getByRole("group", {
      name: "Você recebe algum auxílio? (obrigatório)",
    });
    expect(grupo).not.toHaveAttribute("aria-required");
    expect(grupo).toHaveAccessibleDescription("Selecione pelo menos uma opção");
  });

  it("marca e desmarca devolvendo a lista", () => {
    const onValueChange = vi.fn();
    render(<GrupoDeCheckbox legenda="Q" opcoes={["A", "B"]} onValueChange={onValueChange} />);
    fireEvent.click(screen.getByRole("checkbox", { name: "A" }));
    fireEvent.click(screen.getByRole("checkbox", { name: "B" }));
    expect(onValueChange).toHaveBeenLastCalledWith(["A", "B"]);
    fireEvent.click(screen.getByRole("checkbox", { name: "A" }));
    expect(onValueChange).toHaveBeenLastCalledWith(["B"]);
  });

  it("opção 'Não possuo' é excludente: limpa as outras e trava", () => {
    const onValueChange = vi.fn();
    render(
      <GrupoDeCheckbox
        legenda="Q"
        opcoes={["Bolsa", "Não possuo bolsa"]}
        excludentes
        defaultValue={["Bolsa"]}
        onValueChange={onValueChange}
      />,
    );
    fireEvent.click(screen.getByRole("checkbox", { name: "Não possuo bolsa" }));
    expect(onValueChange).toHaveBeenLastCalledWith(["Não possuo bolsa"]);
    expect(screen.getByRole("checkbox", { name: "Bolsa" })).toBeDisabled();
    expect(screen.getByRole("checkbox", { name: "Bolsa" })).not.toBeChecked();
  });
});
