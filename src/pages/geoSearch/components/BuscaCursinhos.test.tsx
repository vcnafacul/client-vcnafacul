import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { BuscaCursinhos, ID_DA_BUSCA } from "./BuscaCursinhos";

describe("BuscaCursinhos", () => {
  it("digitar avisa o valor", () => {
    const onMudar = vi.fn();
    render(<BuscaCursinhos valor="" onMudar={onMudar} />);
    fireEvent.change(
      screen.getByRole("searchbox", { name: "Pesquisar cursinhos" }),
      {
        target: { value: "cuca" },
      },
    );
    expect(onMudar).toHaveBeenCalledWith("cuca");
  });

  it("Esc limpa; o ✕ só aparece com texto e também limpa", () => {
    const onMudar = vi.fn();
    const { rerender } = render(<BuscaCursinhos valor="" onMudar={onMudar} />);
    expect(screen.queryByRole("button", { name: "Limpar busca" })).toBeNull();

    rerender(<BuscaCursinhos valor="cuca" onMudar={onMudar} />);
    fireEvent.keyDown(screen.getByRole("searchbox"), { key: "Escape" });
    expect(onMudar).toHaveBeenLastCalledWith("");
    onMudar.mockClear();
    fireEvent.click(screen.getByRole("button", { name: "Limpar busca" }));
    expect(onMudar).toHaveBeenLastCalledWith("");
  });

  it("tem o id que o modal do card 08 usa para devolver o foco", () => {
    render(<BuscaCursinhos valor="" onMudar={() => {}} />);
    expect(screen.getByRole("searchbox").id).toBe(ID_DA_BUSCA);
  });
});
