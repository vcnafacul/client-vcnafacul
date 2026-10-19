import { fireEvent, render, screen, within } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";
import type { IndicadoresDeTodos } from "@/services/indicadores";

vi.mock("@/components/indicadores/InfoDaMetrica", () => ({ InfoDaMetrica: () => null }));
// a tabela (acima de sm), não a lista do celular
vi.mock("@/components/dashV2/useAcimaDeSm", () => ({ useAcimaDeSm: () => true }));
const desempenho = vi.hoisted(() => ({
  dados: null as unknown,
  carregando: false,
  erro: false,
  carregar: () => {},
  periodoId: undefined as unknown,
}));
vi.mock("./useDesempenho", () => ({
  useDesempenho: (p: unknown) => {
    desempenho.periodoId = p;
    return desempenho;
  },
}));

import { SecoesDosIndicadores } from "./SecoesDosIndicadores";

const metricas = (alunos: number, ativos: number) => ({
  alunos,
  ativos,
  cancelados: 1,
  desistenciaInicial: 0,
  aulasRegistradas: 10,
  chamadasAluno: 100,
  presencas: 80,
  sumindo: 2,
});

const todos = (emAndamento: boolean): IndicadoresDeTodos => ({
  todos: true,
  periodos: [],
  atualizadoEm: "2026-10-18T12:00:00Z",
  cursinho: metricas(50, 40),
  emAndamento: emAndamento ? metricas(30, 28) : null,
  turmas: [
    { id: "t1", nome: "Manhã", periodoId: "p1", periodoNome: "Extensivo 2025", metricas: metricas(20, 12) },
    { id: "t2", nome: "Noite", periodoId: "p2", periodoNome: "Extensivo 2026", metricas: metricas(30, 28) },
  ],
  comparativo: [
    { periodoId: "p1", nome: "Extensivo 2025", inicio: "2025-02-01", fim: "2025-12-10", emAndamento: false, metricas: metricas(20, 12) },
    { periodoId: "p2", nome: "Extensivo 2026", inicio: "2026-02-01", fim: "2026-12-10", emAndamento: true, metricas: metricas(30, 28) },
  ],
});

// ⚠️ A tabela depende de "hoje" (047): data fixa, 2025 encerrado e 2026 em andamento.
beforeAll(() => {
  vi.useFakeTimers({ toFake: ["Date"] });
  vi.setSystemTime(new Date("2026-10-18T15:00:00Z"));
});
afterAll(() => vi.useRealTimers());

const montar = (d: IndicadoresDeTodos) =>
  render(<SecoesDosIndicadores dados={d} />, { wrapper: MemoryRouter });

describe("Seções na visão de todos os períodos (046)", () => {
  it("matrículas somadas, ativos só dos em andamento, comparativo e coluna Período", () => {
    montar(todos(true));
    expect(screen.getByText("Matrículas nos períodos")).toBeInTheDocument();
    expect(screen.getByText("50")).toBeInTheDocument();
    expect(screen.getByText("em 2 períodos · 2 turmas")).toBeInTheDocument();
    // ativos = 28 (só 2026), não os 40 da soma
    const ativos = screen.getByText("nos períodos em andamento").closest("div")!
      .parentElement!;
    expect(ativos).toHaveTextContent("28");
    expect(ativos).not.toHaveTextContent("40");
    expect(screen.getByText("Comparativo entre períodos")).toBeInTheDocument();
    expect(screen.queryByText("Ao longo do período")).toBeNull();
    expect(screen.getByText("Sumindo")).toBeInTheDocument();
    // o período fica embaixo do nome da turma (sem coluna nova: cabe em 768px)
    const tabela = screen.getAllByRole("table")[0];
    expect(within(tabela).queryByText("Período")).toBeNull();
    // 047: só a turma do período em andamento; a de 2025 (encerrado) fica atrás do botão
    expect(within(tabela).getAllByText("Extensivo 2026").length).toBe(1);
    expect(within(tabela).queryByText(/Extensivo 2025/)).toBeNull();
    expect(screen.getByText(/Turmas dos períodos futuros e em andamento/)).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Mostrar turmas de períodos encerrados" }));
    expect(within(screen.getAllByRole("table")[0]).getByText("Extensivo 2025 · encerrado")).toBeInTheDocument();
    expect(screen.getByText(/Todas as turmas/)).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Esconder turmas de períodos encerrados" }));
    expect(within(screen.getAllByRole("table")[0]).queryByText(/Extensivo 2025/)).toBeNull();
    expect(desempenho.periodoId).toBeNull();
  });

  it("nenhum período em andamento: Ativos 'Nenhum período em andamento' e sem Sumindo", () => {
    montar(todos(false));
    expect(screen.getByText("Nenhum período em andamento")).toBeInTheDocument();
    expect(screen.queryByText("Sumindo")).toBeNull();
  });
});

import { CursinhoDosIndicadores } from "./cursinhoDosIndicadores";

describe("Turmas na visão de outro cursinho (045)", () => {
  it("o nome da turma não é link (a tela de turmas é a do próprio usuário)", () => {
    render(
      <CursinhoDosIndicadores.Provider value="outro">
        <SecoesDosIndicadores dados={todos(true)} />
      </CursinhoDosIndicadores.Provider>,
      { wrapper: MemoryRouter },
    );
    const tabela = screen.getAllByRole("table")[0];
    expect(within(tabela).queryAllByRole("link")).toHaveLength(0);
  });
});

describe("Turmas no fim do ano (047, D3)", () => {
  it("tudo encerrado e nada novo: só as turmas do último período", () => {
    const d = todos(false);
    d.comparativo = d.comparativo.map((p) =>
      p.periodoId === "p2" ? { ...p, fim: "2026-09-30", emAndamento: false } : p,
    );
    montar(d);
    const tabela = screen.getAllByRole("table")[0];
    expect(within(tabela).getByText("Extensivo 2026 · encerrado")).toBeInTheDocument();
    expect(within(tabela).queryByText(/Extensivo 2025/)).toBeNull();
    expect(screen.getByText(/do último período \(Extensivo 2026\)/)).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Mostrar turmas de períodos encerrados" }),
    ).toBeInTheDocument();
  });
});
