import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { StatusBadge } from "./StatusBadge";
import { VARIANTE_POR_TONE } from "./statusVariants";

/**
 * tickets/059: o badge agora é o `StatusBadge` do design system em `look="dot"`
 * — pílula `bg-muted`, ponto na cor do status, texto `foreground`.
 */
const PONTO = {
  success: "bg-success",
  warning: "bg-warning",
  destructive: "bg-destructive",
  info: "bg-info",
  neutral: "bg-muted-foreground",
} as const;

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

  it("a cor vai no ponto e o texto fica em foreground", () => {
    const { container } = render(<StatusBadge tone="missing" label="Faltando" />);
    const badge = container.querySelector("[data-tone='missing']") as HTMLElement;
    const ponto = badge.querySelector("[aria-hidden='true']") as HTMLElement;

    expect(ponto.className).toContain(PONTO.destructive);
    expect(badge.className).toContain("bg-muted");
    expect(badge.className).toContain("text-foreground");
  });

  it("cada tone usa o chip e o ponto da sua variante", () => {
    for (const tone of ["done", "running", "missing", "info", "neutral"] as const) {
      const { container, unmount } = render(<StatusBadge tone={tone} label="x" />);
      const badge = container.querySelector("[data-tone]") as HTMLElement;
      const variante = VARIANTE_POR_TONE[tone];
      expect(badge.getAttribute("data-variant"), tone).toBe(variante);
      expect(badge.className, tone).toContain("bg-muted");
      expect(
        (badge.querySelector("[aria-hidden='true']") as HTMLElement).className,
        tone,
      ).toContain(PONTO[variante]);
      unmount();
    }
  });

  it("os tons viram as variantes do design system", () => {
    expect(VARIANTE_POR_TONE).toEqual({
      done: "success",
      running: "warning",
      missing: "destructive",
      info: "info",
      neutral: "neutral",
    });
  });
});
