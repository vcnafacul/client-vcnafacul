import { render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";

/** tickets/045 — o admin vê os indicadores de outro cursinho. */
const svc = vi.hoisted(() => ({
  getPeriodosDosIndicadores: vi.fn(),
  getIndicadores: vi.fn(),
  getPartnerPrepCourseLogos: vi.fn(),
}));
vi.mock("@/services/indicadores", async (orig) => ({
  ...(await orig<typeof import("@/services/indicadores")>()),
  getPeriodosDosIndicadores: svc.getPeriodosDosIndicadores,
  getIndicadores: svc.getIndicadores,
}));
vi.mock("@/services/prepCourse/partnerLogos", () => ({
  getPartnerPrepCourseLogos: svc.getPartnerPrepCourseLogos,
}));
vi.mock("@/store/auth", () => ({
  useAuthStore: (sel: (s: unknown) => unknown) =>
    sel({ data: { token: "tk", permissao: {} } }),
}));
vi.mock("./SecoesDosIndicadores", () => ({
  SecoesDosIndicadores: () => <div>seções</div>,
}));

import { SemCursinho } from "@/services/indicadores";
import { TelaDosIndicadores } from ".";

const periodo = { id: "pA", nome: "2026", ano: 2026, inicio: "2026-02-01", fim: "2026-12-10", emAndamento: true };
const dados = { periodo, atualizadoEm: new Date().toISOString(), cursinho: {}, turmas: [], serie: [] };

const tela = (url: string, podeVerOutros = true) =>
  render(
    <MemoryRouter initialEntries={[url]}>
      <TelaDosIndicadores podeVerOutros={podeVerOutros} />
    </MemoryRouter>,
  );

describe("Indicadores — visão do admin (045)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    svc.getPartnerPrepCourseLogos.mockResolvedValue([
      { id: "A", name: "Cursinho Alfa", logoUrl: "" },
    ]);
    svc.getPeriodosDosIndicadores.mockResolvedValue({ periodos: [periodo], turmasSemPeriodo: 0 });
    svc.getIndicadores.mockResolvedValue(dados);
  });

  it("com ?cursinho=, espera a lista e busca pelas rotas daquele cursinho, com o aviso", async () => {
    tela("/indicadores?cursinho=A");
    await waitFor(() =>
      expect(svc.getIndicadores).toHaveBeenCalledWith("tk", "pA", "A"),
    );
    expect(svc.getPeriodosDosIndicadores).toHaveBeenCalledTimes(1);
    expect(svc.getPeriodosDosIndicadores).toHaveBeenCalledWith("tk", "A");
    expect(screen.getByRole("status")).toHaveTextContent(
      "Você está vendo os indicadores de Cursinho Alfa como o cursinho vê. Telefones dos alunos não aparecem.",
    );
    expect(screen.getByRole("button", { name: "Ver os indicadores de" })).toHaveTextContent(
      "Cursinho Alfa",
    );
  });

  it("admin sem cursinho próprio: 'Escolha um cursinho'", async () => {
    svc.getPeriodosDosIndicadores.mockRejectedValue(new SemCursinho());
    tela("/indicadores");
    expect(await screen.findByText("Escolha um cursinho")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Ver os indicadores de" })).toHaveTextContent(
      "Meu cursinho",
    );
  });

  it("sem alterarPermissao: nem seletor, nem lista de cursinhos; ?cursinho= é ignorado", async () => {
    tela("/indicadores?cursinho=A", false);
    await waitFor(() =>
      expect(svc.getIndicadores).toHaveBeenCalledWith("tk", "pA", undefined),
    );
    expect(svc.getPartnerPrepCourseLogos).not.toHaveBeenCalled();
    expect(screen.queryByRole("button", { name: "Ver os indicadores de" })).toBeNull();
  });
});
