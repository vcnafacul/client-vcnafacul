import { fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it, vi } from "vitest";

vi.mock("@/store/auth", () => ({
  useAuthStore: () => ({ data: { token: "t", permissao: {} } }),
}));

import { ExpandableCoursePeriod } from "./expandableCoursePeriod";

const periodo = (futuro: boolean, turmas = 1) =>
  ({
    id: "p1",
    name: "2026.1",
    year: 2026,
    startDate: new Date("2026-01-10T10:00:00"),
    endDate: new Date(futuro ? "2999-01-10T10:00:00" : "2000-01-10T10:00:00"),
    classes: Array.from({ length: turmas }, (_, i) => ({
      id: `c${i}`,
      name: `Turma ${i}`,
      description: "",
      number_students: 0,
    })),
  }) as never;

const montar = (p: never) =>
  render(
    <MemoryRouter>
      <table>
        <tbody>
          <ExpandableCoursePeriod
            coursePeriod={p}
            setCoursePeriod={vi.fn()}
            handleAddClass={vi.fn()}
            handleEditClass={vi.fn()}
            handleEditCoursePeriod={vi.fn()}
            handleDeleteCoursePeriod={vi.fn()}
            podeGerenciar={false}
          />
        </tbody>
      </table>
    </MemoryRouter>,
  );

describe("ExpandableCoursePeriod", () => {
  it("expande e recolhe as turmas com aria-expanded e aria-controls", () => {
    montar(periodo(true));
    const botao = screen.getByRole("button", { name: "Expandir turmas de 2026.1" });
    expect(botao).toHaveAttribute("aria-expanded", "false");
    expect(screen.queryByRole("table", { name: "turmas" })).toBeNull();

    fireEvent.click(botao);
    const aberto = screen.getByRole("button", { name: "Recolher turmas de 2026.1" });
    expect(aberto).toHaveAttribute("aria-expanded", "true");
    expect(
      document.getElementById(aberto.getAttribute("aria-controls") as string),
    ).toContainElement(screen.getByRole("table", { name: "turmas" }));

    fireEvent.click(aberto);
    expect(screen.queryByRole("table", { name: "turmas" })).toBeNull();
  });

  it("o selo diz Ativo ou Inativo pelo fim do período", () => {
    const { unmount } = montar(periodo(true));
    expect(screen.getByText("Ativo")).toBeInTheDocument();
    unmount();
    montar(periodo(false));
    expect(screen.getByText("Inativo")).toBeInTheDocument();
  });

  it("sem turmas não há o que expandir", () => {
    montar(periodo(true, 0));
    expect(screen.queryByRole("button", { name: /Expandir/ })).toBeNull();
  });
});
