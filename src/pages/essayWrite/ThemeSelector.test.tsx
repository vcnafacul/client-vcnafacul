import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it } from "vitest";
import { EssayTheme } from "@/dtos/essay";
import ThemeSelector from "./ThemeSelector";

describe("ThemeSelector", () => {
  it("mostra a semana do tema no dia certo (a coluna `date` chega sem fuso)", () => {
    const tema = {
      id: "t1",
      title: "Tema",
      motivationalText: "",
      instruction: null,
      weekStart: "2026-09-28",
      weekEnd: "2026-10-04",
      active: true,
      createdAt: "",
    } as EssayTheme;

    render(
      <MemoryRouter>
        <ThemeSelector themes={[tema]} onSelect={() => {}} />
      </MemoryRouter>,
    );

    expect(screen.getByText("28/09/2026 — 04/10/2026")).toBeInTheDocument();
  });
});
