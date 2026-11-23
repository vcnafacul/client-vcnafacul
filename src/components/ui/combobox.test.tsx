import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { Combobox } from "./combobox";

const opcoes = [
  { value: "a", label: "Alfa" },
  { value: "b", label: "Beta" },
];

describe("Combobox", () => {
  it("escolher zera a busca: a próxima abertura mostra a lista inteira", () => {
    const onValueChange = vi.fn();
    render(<Combobox aria-label="Letra" options={opcoes} onValueChange={onValueChange} />);
    fireEvent.click(screen.getByRole("combobox", { name: "Letra" }));
    fireEvent.change(screen.getByPlaceholderText("Buscar…"), { target: { value: "alf" } });
    expect(screen.queryByRole("option", { name: "Beta" })).toBeNull();
    fireEvent.click(screen.getByRole("option", { name: "Alfa" }));
    expect(onValueChange).toHaveBeenCalledWith("a");
    fireEvent.click(screen.getByRole("combobox", { name: "Letra" }));
    expect(screen.getByRole("option", { name: "Beta" })).toBeInTheDocument();
  });

  it("emptyText em função recebe o termo buscado", () => {
    render(
      <Combobox
        aria-label="Letra"
        options={opcoes}
        onValueChange={vi.fn()}
        emptyText={(b) => `Nada com "${b}"`}
      />,
    );
    fireEvent.click(screen.getByRole("combobox", { name: "Letra" }));
    fireEvent.change(screen.getByPlaceholderText("Buscar…"), { target: { value: "zzz" } });
    expect(screen.getByText('Nada com "zzz"')).toBeInTheDocument();
  });

  it("a busca olha só o rótulo: o id não entra (digitar \"2\" não traz opção sem \"2\" no rótulo)", () => {
    render(
      <Combobox
        aria-label="Ano"
        onValueChange={vi.fn()}
        options={[
          { value: "2024", label: "Ensino médio" },
          { value: "x2y", label: "Cursinho 2 Alfa" },
          { value: "abc", label: "Outro" },
        ]}
      />,
    );
    fireEvent.click(screen.getByRole("combobox", { name: "Ano" }));
    fireEvent.change(screen.getByPlaceholderText("Buscar…"), { target: { value: "2" } });
    expect(screen.getByRole("option", { name: "Cursinho 2 Alfa" })).toBeInTheDocument();
    expect(screen.queryByRole("option", { name: "Ensino médio" })).toBeNull();
    expect(screen.queryByRole("option", { name: "Outro" })).toBeNull();
  });

  it("a busca segue sem acento e sem caixa", () => {
    render(
      <Combobox
        aria-label="Cidade"
        onValueChange={vi.fn()}
        options={[
          { value: "1", label: "São José" },
          { value: "2", label: "Recife" },
        ]}
      />,
    );
    fireEvent.click(screen.getByRole("combobox", { name: "Cidade" }));
    fireEvent.change(screen.getByPlaceholderText("Buscar…"), { target: { value: "SAO jo" } });
    expect(screen.getByRole("option", { name: "São José" })).toBeInTheDocument();
    expect(screen.queryByRole("option", { name: "Recife" })).toBeNull();
  });
});
