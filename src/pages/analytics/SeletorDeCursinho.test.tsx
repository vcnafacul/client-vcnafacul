import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { SeletorDeCursinho } from "./SeletorDeCursinho";

const cursinhos = [
  { id: "a", name: "Cursinho Alfa" },
  { id: "b", name: "Pré-Vestibular São José" },
];

// ⚠️ Radix Popper é lento no jsdom: um teste só abre o popover.
describe("SeletorDeCursinho (044/06)", () => {
  it("mostra o escolhido, busca e devolve o id; 'Todos' devolve null", () => {
    const onChange = vi.fn();
    render(<SeletorDeCursinho cursinhos={cursinhos} valor="a" onChange={onChange} />);
    const gatilho = screen.getByRole("button", { name: "Cursinho do monitoramento" });
    expect(gatilho).toHaveTextContent("Cursinho Alfa");

    fireEvent.click(gatilho);
    fireEvent.change(screen.getByPlaceholderText("Buscar cursinho"), {
      target: { value: "sao jose" },
    });
    expect(screen.queryByText("Cursinho Alfa", { selector: "li span" })).toBeNull();
    expect(screen.queryByText("Todos os cursinhos", { selector: "li span" })).toBeNull();
    fireEvent.click(screen.getByText("Pré-Vestibular São José"));
    expect(onChange).toHaveBeenLastCalledWith("b");

    fireEvent.click(gatilho);
    fireEvent.click(screen.getByText("Todos os cursinhos", { selector: "li span" }));
    expect(onChange).toHaveBeenLastCalledWith(null);
  });
});
