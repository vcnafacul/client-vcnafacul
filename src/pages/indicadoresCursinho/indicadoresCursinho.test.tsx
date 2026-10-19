import { render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";

const svc = vi.hoisted(() => ({
  getPeriodosDosIndicadores: vi.fn(),
  getIndicadores: vi.fn(),
}));
vi.mock("@/services/indicadores", async (orig) => ({
  ...(await orig<typeof import("@/services/indicadores")>()),
  ...svc,
}));
vi.mock("@/store/auth", () => ({
  useAuthStore: (sel: (s: unknown) => unknown) => sel({ data: { token: "tk" } }),
}));

import IndicadoresCursinho from ".";

const periodo = (over = {}) => ({
  id: "p1",
  nome: "Período 2026",
  ano: 2026,
  inicio: "2026-02-01",
  fim: "2026-12-10",
  emAndamento: true,
  ...over,
});

const renderTela = (url = "/indicadores") =>
  render(
    <MemoryRouter initialEntries={[url]}>
      <IndicadoresCursinho />
    </MemoryRouter>,
  );

describe("tela de Indicadores", () => {
  beforeEach(() => {
    svc.getPeriodosDosIndicadores.mockReset();
    svc.getIndicadores.mockReset();
  });

  it("tickets/046: abre em todos os períodos (sem periodoId) e avisa das turmas sem período", async () => {
    svc.getPeriodosDosIndicadores.mockResolvedValue({
      periodos: [periodo({ id: "antigo", emAndamento: false }), periodo()],
      turmasSemPeriodo: 2,
    });
    svc.getIndicadores.mockResolvedValue({
      todos: true,
      periodos: [],
      atualizadoEm: new Date().toISOString(),
      cursinho: {},
      emAndamento: null,
      turmas: [],
      comparativo: [],
    });

    renderTela();

    await waitFor(() =>
      expect(svc.getIndicadores).toHaveBeenCalledWith("tk", null, undefined),
    );
    expect(
      screen.getByText(/2 turmas sem período letivo não entram/),
    ).toBeInTheDocument();
    expect(
      screen.getByText("Como estão os alunos do seu cursinho em todos os períodos letivos."),
    ).toBeInTheDocument();
    // cada período tem a sua hora: na visão de todos, sem "Atualizado às"
    expect(screen.queryByText(/Atualizado às/)).toBeNull();
  });

  it("com ?periodo=, busca aquele período, como antes", async () => {
    svc.getPeriodosDosIndicadores.mockResolvedValue({
      periodos: [periodo({ id: "antigo", emAndamento: false }), periodo()],
      turmasSemPeriodo: 0,
    });
    svc.getIndicadores.mockResolvedValue({
      periodo: periodo(),
      atualizadoEm: new Date().toISOString(),
      cursinho: {},
      turmas: [],
      serie: [],
    });

    renderTela("/indicadores?periodo=p1");

    await waitFor(() =>
      expect(svc.getIndicadores).toHaveBeenCalledWith("tk", "p1", undefined),
    );
    expect(await screen.findByText(/Atualizado às/)).toBeInTheDocument();
  });

  it("?periodo= de outro cursinho (fora da lista) cai em todos", async () => {
    svc.getPeriodosDosIndicadores.mockResolvedValue({
      periodos: [periodo()],
      turmasSemPeriodo: 0,
    });
    svc.getIndicadores.mockResolvedValue({
      todos: true, periodos: [], atualizadoEm: "", cursinho: {}, emAndamento: null, turmas: [], comparativo: [],
    });
    renderTela("/indicadores?periodo=xyz");
    await waitFor(() =>
      expect(svc.getIndicadores).toHaveBeenCalledWith("tk", null, undefined),
    );
  });

  it("sem período letivo: orienta a cadastrar e não busca indicadores", async () => {
    svc.getPeriodosDosIndicadores.mockResolvedValue({
      periodos: [],
      turmasSemPeriodo: 0,
    });

    renderTela();

    expect(
      await screen.findByText("Nenhum período letivo cadastrado"),
    ).toBeInTheDocument();
    expect(svc.getIndicadores).not.toHaveBeenCalled();
  });
});
