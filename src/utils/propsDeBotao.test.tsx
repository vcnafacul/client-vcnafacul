import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { propsDeBotao } from "./propsDeBotao";

function montar(onAtivar: () => void) {
  render(
    <div data-testid="alvo" {...propsDeBotao(onAtivar)}>
      <input data-testid="interno" />
    </div>,
  );
  return screen.getByTestId("alvo");
}

describe("propsDeBotao", () => {
  it("clique ativa", () => {
    const f = vi.fn();
    fireEvent.click(montar(f));
    expect(f).toHaveBeenCalledTimes(1);
  });

  it("Enter ativa uma vez; Enter repetido não ativa de novo", () => {
    const f = vi.fn();
    const el = montar(f);
    fireEvent.keyDown(el, { key: "Enter" });
    fireEvent.keyDown(el, { key: "Enter", repeat: true });
    fireEvent.keyDown(el, { key: "Enter", repeat: true });
    expect(f).toHaveBeenCalledTimes(1);
  });

  it("Espaço ativa no keyup (não no keydown) e não rola a página", () => {
    const f = vi.fn();
    const el = montar(f);
    const antes = fireEvent.keyDown(el, { key: " " });
    expect(antes).toBe(false);
    expect(f).not.toHaveBeenCalled();
    fireEvent.keyUp(el, { key: " " });
    expect(f).toHaveBeenCalledTimes(1);
  });

  it("tecla vinda de controle interno não ativa", () => {
    const f = vi.fn();
    montar(f);
    const interno = screen.getByTestId("interno");
    fireEvent.keyDown(interno, { key: "Enter" });
    fireEvent.keyDown(interno, { key: " " });
    fireEvent.keyUp(interno, { key: " " });
    expect(f).not.toHaveBeenCalled();
  });
});
