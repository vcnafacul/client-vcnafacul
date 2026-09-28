import { fireEvent, render, screen, within } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

vi.mock("@/store/auth", () => ({
  useAuthStore: () => ({ data: { token: "tok", permissao: {} } }),
}));
vi.mock("@/services/prova/getMissingNumber", () => ({
  getMissingNumber: vi.fn().mockResolvedValue([7, 8]),
}));
vi.mock("react-toastify", () => ({
  toast: { success: vi.fn(), error: vi.fn(), info: vi.fn() },
}));

import { TabClassificacao } from ".";

/**
 * tickets/023, card 08 — a tela vê todas as provas da questão, mas só mexe na
 * composição das que o ms disse `podeComporProva`.
 */
const PA = {
  provaId: "pa",
  provaNome: "Simulado do A",
  numero: 3,
  cursinhoId: "A",
  cursinhoNome: "Cursinho A",
  podeComporProva: true,
};
const PB = {
  provaId: "pb",
  provaNome: "Simulado do B",
  numero: 5,
  cursinhoId: "B",
  cursinhoNome: "Cursinho da Vila",
  podeComporProva: false,
};

const questao = (provaBase: string) =>
  ({
    _id: "q1",
    enemArea: "Matemática",
    materia: "m1",
    frente1: "f1",
    status: 0,
    provasContendo: [PA, PB],
    provaBase,
  }) as never;

const infos = {
  provas: [
    { _id: "pa", nome: "Simulado do A", podeComporProva: true },
    { _id: "pb", nome: "Simulado do B", podeComporProva: false },
    { _id: "pc", nome: "Outra do A", podeComporProva: true },
    { _id: "pd", nome: "ENEM 2023", podeComporProva: false },
  ],
  enemAreas: [],
  materias: [],
  frentes: [],
} as never;

const montar = (provaBase: string) =>
  render(<TabClassificacao question={questao(provaBase)} infos={infos} canEdit />);

describe("TabClassificacao — composição só na prova própria (023 · 08)", () => {
  it("prova de outro cursinho em foco: selo com o nome, e sem remover nem trocar número", () => {
    montar("pb");
    const selo = screen.getByTestId("selo-da-prova");
    expect(selo).toHaveTextContent("🏫 Prova do cursinho Cursinho da Vila");
    expect(selo).toHaveAttribute("title", expect.stringContaining("só quem é dono"));

    fireEvent.click(screen.getByText("Editar Classificação"));

    expect(screen.getByRole("button", { name: "Remover da prova" })).toBeDisabled();
    expect(screen.queryByRole("button", { name: "Remover número" })).toBeNull();
  });

  it("prova própria em foco: sem selo, e pode remover", () => {
    montar("pa");
    expect(screen.queryByTestId("selo-da-prova")).toBeNull();
    fireEvent.click(screen.getByText("Editar Classificação"));
    expect(screen.getByRole("button", { name: "Remover da prova" })).toBeEnabled();
  });

  it("'Adicionar em uma prova' lista só as que a pessoa compõe", () => {
    montar("pa");
    fireEvent.click(screen.getByText("Adicionar em uma prova"));
    expect(within(document.body).getByText("Outra do A")).toBeInTheDocument();
    expect(within(document.body).queryByText("ENEM 2023")).toBeNull();
  });
});
