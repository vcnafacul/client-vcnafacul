import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { StatusBadge } from "./StatusBadge";
import { dashV2 } from "./tokens";

describe("StatusBadge", () => {
  it.each([
    ["done", "Completa"],
    ["running", "Em andamento"],
    ["missing", "Faltando"],
    ["neutral", "Rascunho"],
  ] as const)("o tone `%s` sempre renderiza o texto", (tone, label) => {
    render(<StatusBadge tone={tone} label={label} />);
    expect(screen.getByText(label)).toBeInTheDocument();
  });

  it("não existe modo só-ícone: o rótulo é sempre texto visível", () => {
    // ⚠️ O ponto colorido é aria-hidden; se ele fosse o único conteúdo, o badge
    // não anunciaria nada — que é exatamente o problema do ícone no canto do
    // card do V1.
    const { container } = render(<StatusBadge tone="done" label="Completa" />);
    const badge = container.querySelector("[data-tone]") as HTMLElement;
    expect(badge.textContent).toBe("Completa");
    expect(badge.querySelectorAll("[aria-hidden='true']")).toHaveLength(1);
  });

  it("a cor vai no ponto e o texto fica em marine", () => {
    const { container } = render(<StatusBadge tone="missing" label="Faltando" />);
    const badge = container.querySelector("[data-tone='missing']") as HTMLElement;
    const ponto = badge.querySelector("[aria-hidden='true']") as HTMLElement;

    expect(ponto.className).toContain(dashV2.status.missing.dot);
    expect(badge.className).toContain(dashV2.status.missing.chip);
    expect(badge.className).toContain(dashV2.text.primary);
  });

  it("cada tone usa o chip e o ponto do seu próprio token", () => {
    for (const tone of ["done", "running", "missing", "neutral"] as const) {
      const { container, unmount } = render(<StatusBadge tone={tone} label="x" />);
      const badge = container.querySelector("[data-tone]") as HTMLElement;
      expect(badge.className, tone).toContain(dashV2.status[tone].chip);
      expect(
        (badge.querySelector("[aria-hidden='true']") as HTMLElement).className,
        tone,
      ).toContain(dashV2.status[tone].dot);
      unmount();
    }
  });
});
