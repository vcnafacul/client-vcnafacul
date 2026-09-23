import { fireEvent, render } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { TrilhaDaLinhagem } from "./TrilhaDaLinhagem";

const A = "665f0c1a2b3c4d5e6f00000a";
const B = "665f0c1a2b3c4d5e6f00000b";

describe("TrilhaDaLinhagem (card 34A)", () => {
  it("⚠️ com uma questão só, não aparece — não há de onde voltar", () => {
    const { container } = render(
      <TrilhaDaLinhagem trilha={[A]} abrir={vi.fn()} voltar={vi.fn()} />,
    );

    expect(container.querySelector("[data-trilha]")).toBeNull();
  });

  it("mostra o caminho e volta", () => {
    const voltar = vi.fn();
    const abrir = vi.fn();
    const { container } = render(
      <TrilhaDaLinhagem trilha={[A, B]} abrir={abrir} voltar={voltar} />,
    );

    expect(container.querySelector("[data-trilha]")?.textContent).toContain(
      "00000a",
    );
    fireEvent.click(container.querySelector("[data-voltar]")!);
    expect(voltar).toHaveBeenCalled();

    fireEvent.click(container.querySelector(`[data-trilha-item="${A}"]`)!);
    expect(abrir).toHaveBeenCalledWith(A);
  });

  it("a última (a aberta) não é link", () => {
    const { container } = render(
      <TrilhaDaLinhagem trilha={[A, B]} abrir={vi.fn()} voltar={vi.fn()} />,
    );

    expect(container.querySelector(`[data-trilha-item="${B}"]`)).toBeNull();
  });
});
