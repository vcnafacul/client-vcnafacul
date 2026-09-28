import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { BotaoConfirmar } from "./BotaoConfirmar";

describe("BotaoConfirmar", () => {
  it("com 0, só o ícone; com N, o número", () => {
    const { rerender } = render(
      <BotaoConfirmar
        confirmado={false}
        contagem={0}
        ocupado={false}
        onClick={() => {}}
      />,
    );
    expect(screen.getByRole("button").textContent).toBe("");
    rerender(
      <BotaoConfirmar
        confirmado={false}
        contagem={3}
        ocupado={false}
        onClick={() => {}}
      />,
    );
    expect(screen.getByRole("button")).toHaveTextContent("3");
  });

  it("marcado: aria-pressed e o texto de desfazer", () => {
    render(
      <BotaoConfirmar
        confirmado
        contagem={1}
        ocupado={false}
        onClick={() => {}}
      />,
    );
    const b = screen.getByRole("button", {
      name: "Você confirmou — clique para desfazer",
    });
    expect(b).toHaveAttribute("aria-pressed", "true");
  });

  it("⚠️ o clique não sobe para o card (que voaria até o cursinho)", () => {
    const doCard = vi.fn();
    const onClick = vi.fn();
    render(
      <div onClick={doCard}>
        <BotaoConfirmar
          confirmado={false}
          contagem={0}
          ocupado={false}
          onClick={onClick}
        />
      </div>,
    );
    fireEvent.click(screen.getByRole("button"));
    expect(onClick).toHaveBeenCalled();
    expect(doCard).not.toHaveBeenCalled();
  });

  it("em voo: desabilitado (duplo clique não manda duas)", () => {
    render(
      <BotaoConfirmar
        confirmado={false}
        contagem={0}
        ocupado
        onClick={() => {}}
      />,
    );
    expect(screen.getByRole("button")).toBeDisabled();
  });
});
