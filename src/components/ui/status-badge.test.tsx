import { render, screen } from "@testing-library/react";
import { AlertTriangle } from "lucide-react";
import { describe, expect, it } from "vitest";

import { StatusBadge } from "./status-badge";

const classesDe = (raiz: HTMLElement) =>
  [raiz, ...raiz.querySelectorAll("*")].map((e) => e.getAttribute("class") ?? "").join(" ");

describe("StatusBadge", () => {
  it('variant="warning" value="32%" renderiza "32%" e nenhuma classe com orange', () => {
    const { container } = render(
      <StatusBadge variant="warning" look="tint" icon={AlertTriangle} value="32%">
        Risco de evasão
      </StatusBadge>,
    );
    expect(screen.getByText("32%")).toBeInTheDocument();
    expect(classesDe(container)).not.toMatch(/orange/);
  });

  it("dot: pílula muted, ponto colorido e texto foreground", () => {
    render(<StatusBadge variant="destructive">Faltando questões</StatusBadge>);
    const badge = screen.getByText("Faltando questões");
    expect(badge).toHaveAttribute("data-variant", "destructive");
    expect(badge.className).toContain("bg-muted");
    expect(badge.className).toContain("text-foreground");
    const ponto = badge.querySelector("[aria-hidden='true']") as HTMLElement;
    expect(ponto.className).toContain("bg-destructive");
  });

  it("tint: fundo -muted e texto na cor do status", () => {
    render(
      <StatusBadge variant="success" look="tint">
        Concluída
      </StatusBadge>,
    );
    const badge = screen.getByText("Concluída");
    expect(badge.className).toContain("bg-success-muted");
    expect(badge.className).toContain("text-success");
  });

  it("o ícone toma o lugar do ponto", () => {
    render(
      <StatusBadge variant="warning" icon={AlertTriangle}>
        Atenção
      </StatusBadge>,
    );
    const badge = screen.getByText("Atenção");
    expect(badge.querySelector("svg")).not.toBeNull();
    expect(badge.querySelector("span[aria-hidden='true']")).toBeNull();
  });
});
