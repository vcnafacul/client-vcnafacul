import { render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { Period } from "@/enums/analytics/period";

/** tickets/044, card 07 — com cursinho, as seções usam as rotas do recorte. */
vi.mock("@/components/atoms/lineChartMui", () => ({
  default: (p: { title: string; series: { label: string; data: number[] }[] }) => (
    <div data-testid={`grafico-${p.title}`}>
      {p.series.map((s) => `${s.label}:${s.data.join(",")}`).join("|")}
    </div>
  ),
}));
vi.mock("@/components/atoms/barChartMuiFilter", () => ({ default: () => <div /> }));
vi.mock("@/store/auth", () => ({ useAuthStore: () => ({ data: { token: "tk" } }) }));

const m = vi.hoisted(() => ({
  simuladosPorPeriodoDoCursinho: vi.fn(),
  simuladosPorTipoDoCursinho: vi.fn(),
  resumoDoCursinho: vi.fn(),
  inscricoesPorPeriodoDoCursinho: vi.fn(),
  ultimoAcessoDoCursinho: vi.fn(),
  usuariosPorPerfilDoCursinho: vi.fn(),
  globalPorPeriodo: vi.fn(),
  globalUltimoAcesso: vi.fn(),
  globalAtivos: vi.fn(),
  ultimosProcessos: vi.fn(),
}));
vi.mock("@/services/analytics/monitoramento", async (orig) => ({
  ...(await orig<typeof import("@/services/analytics/monitoramento")>()),
  simuladosPorPeriodoDoCursinho: m.simuladosPorPeriodoDoCursinho,
  simuladosPorTipoDoCursinho: m.simuladosPorTipoDoCursinho,
  resumoDoCursinho: m.resumoDoCursinho,
  inscricoesPorPeriodoDoCursinho: m.inscricoesPorPeriodoDoCursinho,
  ultimoAcessoDoCursinho: m.ultimoAcessoDoCursinho,
  usuariosPorPerfilDoCursinho: m.usuariosPorPerfilDoCursinho,
  ultimosProcessos: m.ultimosProcessos,
}));
vi.mock("@/services/analytics/simulado/aggregateByPeriod", () => ({
  getAggregateHistoricoByPeriod: m.globalPorPeriodo,
}));
vi.mock("@/services/analytics/simulado/aggregateByPeriodAndType", () => ({
  getAggregateHistoricoByPeriodAnType: vi.fn().mockResolvedValue([]),
}));
vi.mock("@/services/analytics/user/aggregateLUserByLastAccess", () => ({
  aggregateUserByLastAccess: m.globalUltimoAcesso,
}));
vi.mock("@/services/analytics/user/aggregateUserByPeriod", () => ({
  aggregateUserByPeriod: m.globalAtivos,
}));
vi.mock("@/services/analytics/user/aggregateUserByRole", () => ({
  aggregateUserByRole: vi.fn().mockResolvedValue([]),
}));

import { MonitoramentoIndisponivel } from "@/services/analytics/monitoramento";
import AnalyticsPrepCourse from "./prepCourse";
import AnalyticsSimulado from "./simulado";
import AnalyticsUsers from "./users";

describe("seções do monitoramento com cursinho (044/07)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    m.ultimosProcessos.mockResolvedValue([]);
  });

  it("Simulados: rota do cursinho, sem a global; 502 → Indisponível", async () => {
    m.simuladosPorPeriodoDoCursinho.mockRejectedValue(new MonitoramentoIndisponivel());
    m.simuladosPorTipoDoCursinho.mockResolvedValue([]);
    render(<AnalyticsSimulado period={Period.month} cursinhoId="A" />);
    expect(await screen.findByText(/Indisponível agora/)).toBeInTheDocument();
    expect(m.simuladosPorPeriodoDoCursinho).toHaveBeenCalledWith("A", "month", "tk");
    expect(m.globalPorPeriodo).not.toHaveBeenCalled();
    expect(screen.getByText("Simulados das provas do cursinho")).toBeInTheDocument();
  });

  it("Usuários: último acesso em duas séries e sem 'Ativos e Total'", async () => {
    m.ultimoAcessoDoCursinho.mockResolvedValue([
      { period: "2026-03", colaboradores: 2, estudantes: 9 },
    ]);
    m.usuariosPorPerfilDoCursinho.mockResolvedValue([]);
    render(<AnalyticsUsers period={Period.month} cursinhoId="A" />);
    expect(
      await screen.findByText("Colaboradores:2|Estudantes:9"),
    ).toBeInTheDocument();
    expect(screen.queryByTestId("grafico-Usuários Ativos e Total")).toBeNull();
    expect(m.globalUltimoAcesso).not.toHaveBeenCalled();
    expect(m.globalAtivos).not.toHaveBeenCalled();
    expect(m.usuariosPorPerfilDoCursinho).toHaveBeenCalledWith("A", false, "tk");
  });

  it("Cursinhos: resumo e inscrições do cursinho", async () => {
    m.resumoDoCursinho.mockResolvedValue({
      processosNaoTeste: 3,
      processosTotal: 5,
      inscricoesNaoTeste: 120,
      matriculasNaoTeste: 40,
    });
    m.inscricoesPorPeriodoDoCursinho.mockResolvedValue([
      { period: "2026-03", totalInscriptions: 7 },
    ]);
    render(<AnalyticsPrepCourse period={Period.month} cursinhoId="A" />);
    await waitFor(() => expect(screen.getByText("120")).toBeInTheDocument());
    expect(screen.getByText("40")).toBeInTheDocument();
    expect(screen.getByText("Número de inscrições:7")).toBeInTheDocument();
    expect(screen.getByText("Processos seletivos do cursinho")).toBeInTheDocument();
    expect(m.ultimosProcessos).toHaveBeenCalledWith("tk", "A");
  });
});
