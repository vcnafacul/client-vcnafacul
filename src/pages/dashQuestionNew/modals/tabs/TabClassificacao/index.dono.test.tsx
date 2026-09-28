import { fireEvent, render, screen, within } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

const auth = vi.hoisted(() => ({ permissao: {} as Record<string, boolean> }));
vi.mock("@/store/auth", () => ({
  useAuthStore: () => ({ data: { token: "tok", permissao: auth.permissao } }),
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

describe("TabClassificacao — área/frente1 em prova oficial (023 · 17)", () => {
  const OFICIAL = {
    provaId: "enem",
    provaNome: "ENEM 2023 Dia 2",
    numero: 140,
    cursinhoId: null,
    protegida: true,
    selecionavel: false,
    podeComporProva: false,
  };
  const comOficial = () =>
    ({
      _id: "q1",
      enemArea: "Matemática",
      materia: "m1",
      frente1: "f1",
      status: 0,
      provasContendo: [PA, OFICIAL],
      provaBase: "pa",
    }) as never;
  const editar = () => {
    render(<TabClassificacao question={comOficial()} infos={infos} canEdit />);
    fireEvent.click(screen.getByText("Editar Classificação"));
  };
  // Área, disciplina e frente principal — o combobox de cada rótulo.
  const selects = () =>
    ["Área do Conhecimento ENEM *", "Disciplina *", "Frente Principal *"].map(
      (rotulo) =>
        within(screen.getByText(rotulo).parentElement!).getByRole("combobox"),
    );

  afterEach(() => {
    auth.permissao = {};
  });

  it("sem criarQuestao: aviso com o nome da prova, e área/disciplina/frente travadas", () => {
    editar();
    expect(screen.getByTestId("trava-area-frente")).toHaveTextContent(
      "Esta questão está numa prova oficial (ENEM 2023 Dia 2)",
    );
    for (const s of selects()) expect(s).toBeDisabled();
  });

  it("com criarQuestao (equipe da plataforma): sem trava", () => {
    auth.permissao = { criarQuestao: true };
    editar();
    expect(screen.queryByTestId("trava-area-frente")).toBeNull();
    expect(selects()[0]).toBeEnabled();
  });

  it("questão só em provas de cursinho: sem trava", () => {
    render(<TabClassificacao question={questao("pa")} infos={infos} canEdit />);
    fireEvent.click(screen.getByText("Editar Classificação"));
    expect(screen.queryByTestId("trava-area-frente")).toBeNull();
  });
});
