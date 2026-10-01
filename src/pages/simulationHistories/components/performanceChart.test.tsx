import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { AproveitamentoHitoriesDTO } from "../../../dtos/historico/getPerformanceDTO";
import { PerformanceChart } from "./performanceChart";

// O gráfico em si não interessa aqui, e no jsdom ele não tem tamanho.
vi.mock("@mui/x-charts", () => ({ LineChart: () => null }));
vi.mock("@/components/dashV2/useAcimaDeSm", () => ({
  useAcimaDeSm: () => false,
}));

const historico = (geral: number, dia: number) => ({
  historyId: `h${dia}`,
  testName: "Matemática",
  performance: { geral, frentes: [], materias: [] },
  timeSpent: 0,
  questionsAnswered: 45,
  totalQuestionsTest: 45,
  testPerformance: geral,
  testAttempts: 1,
  createdAt: new Date(2026, 8, dia),
});

const aproveitamento = (n: number) =>
  ({
    performanceMateriaFrente: { geral: 0, frentes: [], materias: [] },
    historicos: Array.from({ length: n }, (_, i) =>
      historico(0.3 + (i % 5) / 10, i + 1),
    ),
  }) as unknown as AproveitamentoHitoriesDTO;

describe("PerformanceChart", () => {
  it("o total é o real, e as estatísticas dizem que são dos últimos 10", () => {
    render(
      <PerformanceChart aproveitamento={aproveitamento(30)} totalSimulados={30} />,
    );

    expect(screen.getByText("Total de Simulados").nextSibling).toHaveTextContent(
      "30",
    );
    expect(
      screen.getByText("Estatísticas dos últimos 10 simulados"),
    ).toBeInTheDocument();
  });

  it("sem o total, cai na quantidade de históricos recebida", () => {
    render(<PerformanceChart aproveitamento={aproveitamento(4)} />);

    expect(screen.getByText("Total de Simulados").nextSibling).toHaveTextContent(
      "4",
    );
    expect(
      screen.getByText("Estatísticas dos últimos 4 simulados"),
    ).toBeInTheDocument();
  });

  it("pior desempenho em vermelho, melhor em verde", () => {
    render(<PerformanceChart aproveitamento={aproveitamento(4)} />);

    expect(screen.getByText("Pior Desempenho").nextSibling).toHaveStyle({
      color: "#f87171",
    });
    expect(screen.getByText("Melhor Desempenho").nextSibling).toHaveStyle({
      color: "#4ade80",
    });
  });
});
