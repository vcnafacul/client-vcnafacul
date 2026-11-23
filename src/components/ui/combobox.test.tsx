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
});
