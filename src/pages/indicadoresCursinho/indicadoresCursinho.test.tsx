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

const renderTela = () =>
  render(
    <MemoryRouter>
      <IndicadoresCursinho />
    </MemoryRouter>,
  );

describe("tela de Indicadores", () => {
  beforeEach(() => {
    svc.getPeriodosDosIndicadores.mockReset();
    svc.getIndicadores.mockReset();
  });

  it("busca os indicadores do período em andamento e avisa das turmas sem período", async () => {
    svc.getPeriodosDosIndicadores.mockResolvedValue({
      periodos: [periodo({ id: "antigo", emAndamento: false }), periodo()],
      turmasSemPeriodo: 2,
    });
    svc.getIndicadores.mockResolvedValue({
      periodo: periodo(),
      atualizadoEm: new Date().toISOString(),
      cursinho: {},
      turmas: [],
      serie: [],
    });

    renderTela();

    await waitFor(() =>
      expect(svc.getIndicadores).toHaveBeenCalledWith("tk", "p1"),
    );
    expect(
      screen.getByText(/2 turmas sem período letivo não entram/),
    ).toBeInTheDocument();
    expect(await screen.findByText(/Atualizado às/)).toBeInTheDocument();
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
